import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthContext } from '../context/AuthContext'

const ESTOQUE_BAIXO_LIMITE = 5

function inicioDoDia() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function useDashboard() {
  const { session } = useAuthContext()
  const donoId = session?.user?.id
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    if (!donoId) return
    const desde = inicioDoDia()
    const donoOuSemDono = `dono_id.eq.${donoId},dono_id.is.null`

    const [pedidosHojeRes, statusAtivoRes, estoqueBaixoRes] =
      await Promise.all([
        supabase
          .from('pedidos')
          .select('id, status, total, created_at, updated_at')
          .gte('created_at', desde)
          .or(donoOuSemDono),
        supabase
          .from('pedidos')
          .select('status')
          .in('status', ['a_fazer', 'em_preparo', 'pronto'])
          .or(donoOuSemDono),
        supabase
          .from('produtos')
          .select('id, nome, estoque')
          .eq('dono_id', donoId)
          .eq('ativo', true)
          .lte('estoque', ESTOQUE_BAIXO_LIMITE)
          .order('estoque', { ascending: true }),
      ])

    if (pedidosHojeRes.error) {
      setError(pedidosHojeRes.error.message)
      setLoading(false)
      return
    }

    const pedidosHoje = pedidosHojeRes.data
    const totalPedidos = pedidosHoje.length
    const receitaHoje = pedidosHoje.reduce((soma, p) => soma + Number(p.total), 0)
    const ticketMedio = totalPedidos > 0 ? receitaHoje / totalPedidos : 0

    const finalizados = pedidosHoje.filter(
      (p) => p.status === 'pronto' || p.status === 'entregue',
    )
    const tempoMedioPreparoMin =
      finalizados.length > 0
        ? finalizados.reduce((soma, p) => {
            const minutos =
              (new Date(p.updated_at) - new Date(p.created_at)) / 60000
            return soma + minutos
          }, 0) / finalizados.length
        : null

    const porStatus = { a_fazer: 0, em_preparo: 0, pronto: 0 }
    for (const p of statusAtivoRes.data ?? []) {
      porStatus[p.status] = (porStatus[p.status] ?? 0) + 1
    }

    const idsPedidosHoje = pedidosHoje.map((p) => p.id)
    let maisVendidos = []
    if (idsPedidosHoje.length > 0) {
      const { data: itens } = await supabase
        .from('itens_pedido')
        .select('quantidade, produtos(id, nome)')
        .in('pedido_id', idsPedidosHoje)

      const ranking = new Map()
      for (const item of itens ?? []) {
        if (!item.produtos) continue
        const atual = ranking.get(item.produtos.id) ?? {
          nome: item.produtos.nome,
          quantidade: 0,
        }
        atual.quantidade += item.quantidade
        ranking.set(item.produtos.id, atual)
      }
      maisVendidos = [...ranking.values()]
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5)
    }

    setError(null)
    setStats({
      totalPedidos,
      receitaHoje,
      ticketMedio,
      tempoMedioPreparoMin,
      porStatus,
      maisVendidos,
      estoqueBaixo: estoqueBaixoRes.data ?? [],
    })
    setLoading(false)
  }, [donoId])

  useEffect(() => {
    fetchStats()

    const channel = supabase
      .channel(`dashboard-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => fetchStats(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

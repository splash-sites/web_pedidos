import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthContext } from '../context/AuthContext'

const STATUS_ATIVOS = ['a_fazer', 'em_preparo', 'pronto']

const PROXIMO_STATUS = {
  a_fazer: 'em_preparo',
  em_preparo: 'pronto',
  pronto: 'entregue',
}

const STATUS_ANTERIOR = {
  em_preparo: 'a_fazer',
  pronto: 'em_preparo',
}

async function ajustarEstoque(itens, sinal) {
  for (const item of itens) {
    const { data: produto } = await supabase
      .from('produtos')
      .select('estoque')
      .eq('id', item.produto_id)
      .single()
    if (!produto) continue

    const novoEstoque = Math.max(0, produto.estoque + sinal * item.quantidade)
    await supabase
      .from('produtos')
      .update({ estoque: novoEstoque })
      .eq('id', item.produto_id)
  }
}

export function usePedidosRealtime() {
  const { session } = useAuthContext()
  const donoId = session?.user?.id
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(new Date())

  const fetchPedidos = useCallback(async () => {
    if (!donoId) return
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, itens_pedido(*, produtos(nome)), funcionarios(nome)')
      .in('status', STATUS_ATIVOS)
      .or(`dono_id.eq.${donoId},dono_id.is.null`)
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setPedidos(data)
    }
    setLastSync(new Date())
    setLoading(false)
  }, [donoId])

  useEffect(() => {
    fetchPedidos()

    const channel = supabase
      .channel(`pedidos-kanban-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => fetchPedidos(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPedidos])

  async function avancarStatus(pedido, funcionarioId) {
    const proximo = PROXIMO_STATUS[pedido.status]
    if (!proximo) return
    const mudancas = {
      status: proximo,
      updated_at: new Date().toISOString(),
      dono_id: donoId,
    }
    if (pedido.status === 'a_fazer' && proximo === 'em_preparo') {
      await ajustarEstoque(pedido.itens_pedido, -1)
      mudancas.funcionario_id = funcionarioId
    }
    const { error } = await supabase
      .from('pedidos')
      .update(mudancas)
      .eq('id', pedido.id)
    if (error) throw new Error(error.message)
  }

  async function voltarStatus(pedido) {
    const anterior = STATUS_ANTERIOR[pedido.status]
    if (!anterior) return
    const mudancas = {
      status: anterior,
      updated_at: new Date().toISOString(),
      dono_id: donoId,
    }
    if (pedido.status === 'em_preparo' && anterior === 'a_fazer') {
      await ajustarEstoque(pedido.itens_pedido, 1)
      mudancas.funcionario_id = null
    }
    const { error } = await supabase
      .from('pedidos')
      .update(mudancas)
      .eq('id', pedido.id)
    if (error) throw new Error(error.message)
  }

  return {
    pedidos,
    loading,
    error,
    lastSync,
    avancarStatus,
    voltarStatus,
  }
}

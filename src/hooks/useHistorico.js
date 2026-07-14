import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthContext } from '../context/AuthContext'

const LIMITE = 50

export function useHistorico() {
  const { session } = useAuthContext()
  const donoId = session?.user?.id
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHistorico = useCallback(async () => {
    if (!donoId) return
    const [entreguesRes, todosRes] = await Promise.all([
      supabase
        .from('pedidos')
        .select('*, itens_pedido(*, produtos(nome))')
        .eq('status', 'entregue')
        .eq('dono_id', donoId)
        .order('updated_at', { ascending: false })
        .limit(LIMITE),
      supabase
        .from('pedidos')
        .select('id, created_at')
        .eq('dono_id', donoId)
        .order('created_at', { ascending: true }),
    ])

    if (entreguesRes.error) {
      setError(entreguesRes.error.message)
      setLoading(false)
      return
    }

    const numeroPorId = new Map(
      (todosRes.data ?? []).map((p, i) => [p.id, i + 1]),
    )

    setError(null)
    setPedidos(
      entreguesRes.data.map((p) => ({ ...p, numero: numeroPorId.get(p.id) })),
    )
    setLoading(false)
  }, [donoId])

  useEffect(() => {
    fetchHistorico()

    const channel = supabase
      .channel(`historico-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => fetchHistorico(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchHistorico])

  return { pedidos, loading, error }
}

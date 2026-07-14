import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthContext } from '../context/AuthContext'

export function useProdutos() {
  const { session } = useAuthContext()
  const donoId = session?.user?.id
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProdutos = useCallback(async () => {
    if (!donoId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('dono_id', donoId)
      .order('nome', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setProdutos(data)
    }
    setLoading(false)
  }, [donoId])

  useEffect(() => {
    fetchProdutos()
  }, [fetchProdutos])

  async function createProduto(produto) {
    const { data, error } = await supabase
      .from('produtos')
      .insert({ ...produto, dono_id: donoId })
      .select()
      .single()

    if (error) throw new Error(error.message)
    setProdutos((prev) =>
      [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)),
    )
    return data
  }

  async function updateProduto(id, changes) {
    const { data, error } = await supabase
      .from('produtos')
      .update(changes)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setProdutos((prev) => prev.map((p) => (p.id === id ? data : p)))
    return data
  }

  async function deleteProduto(id) {
    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setProdutos((prev) => prev.filter((p) => p.id !== id))
  }

  return {
    produtos,
    loading,
    error,
    refetch: fetchProdutos,
    createProduto,
    updateProduto,
    deleteProduto,
  }
}

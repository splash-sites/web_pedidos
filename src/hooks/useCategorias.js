import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthContext } from '../context/AuthContext'

export function useCategorias() {
  const { session } = useAuthContext()
  const donoId = session?.user?.id
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategorias = useCallback(async () => {
    if (!donoId) return
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('dono_id', donoId)
      .order('nome', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setCategorias(data)
    }
    setLoading(false)
  }, [donoId])

  useEffect(() => {
    fetchCategorias()
  }, [fetchCategorias])

  async function createCategoria(nome) {
    const { data, error } = await supabase
      .from('categorias')
      .insert({ nome, dono_id: donoId })
      .select()
      .single()
    if (error) throw new Error(error.message)
    setCategorias((prev) =>
      [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)),
    )
    return data
  }

  async function updateCategoria(id, nome) {
    const { data, error } = await supabase
      .from('categorias')
      .update({ nome })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    setCategorias((prev) => prev.map((c) => (c.id === id ? data : c)))
    return data
  }

  async function deleteCategoria(id) {
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setCategorias((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    categorias,
    loading,
    error,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  }
}

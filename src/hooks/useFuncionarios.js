import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthContext } from '../context/AuthContext'

export function useFuncionarios() {
  const { session } = useAuthContext()
  const donoId = session?.user?.id
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFuncionarios = useCallback(async () => {
    if (!donoId) return
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('dono_id', donoId)
      .order('nome', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setFuncionarios(data)
    }
    setLoading(false)
  }, [donoId])

  useEffect(() => {
    fetchFuncionarios()
  }, [fetchFuncionarios])

  async function createFuncionario(nome) {
    const { data, error } = await supabase
      .from('funcionarios')
      .insert({ nome, dono_id: donoId })
      .select()
      .single()
    if (error) throw new Error(error.message)
    setFuncionarios((prev) =>
      [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)),
    )
    return data
  }

  async function updateFuncionario(id, changes) {
    const { data, error } = await supabase
      .from('funcionarios')
      .update(changes)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    setFuncionarios((prev) => prev.map((f) => (f.id === id ? data : f)))
    return data
  }

  async function deleteFuncionario(id) {
    const { error } = await supabase.from('funcionarios').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setFuncionarios((prev) => prev.filter((f) => f.id !== id))
  }

  return {
    funcionarios,
    loading,
    error,
    createFuncionario,
    updateFuncionario,
    deleteFuncionario,
  }
}

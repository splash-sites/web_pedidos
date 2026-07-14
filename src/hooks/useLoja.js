import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthContext } from '../context/AuthContext'

export function useLoja() {
  const { session } = useAuthContext()
  const donoId = session?.user?.id
  const [loja, setLoja] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLoja = useCallback(async () => {
    if (!donoId) return
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .eq('dono_id', donoId)
      .maybeSingle()

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setLoja(data)
    }
    setLoading(false)
  }, [donoId])

  useEffect(() => {
    fetchLoja()
  }, [fetchLoja])

  async function salvarLoja({ slug, nome, whatsapp }) {
    const { data, error } = await supabase
      .from('lojas')
      .upsert({ dono_id: donoId, slug, nome, whatsapp }, { onConflict: 'dono_id' })
      .select()
      .single()

    if (error) throw new Error(error.message)
    setLoja(data)
    return data
  }

  return { loja, loading, error, salvarLoja }
}

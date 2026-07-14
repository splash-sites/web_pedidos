import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useAuth() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setSession(null)
        return
      }
      // getSession() só lê o token local — não confirma que o usuário
      // ainda existe no servidor. getUser() valida de verdade.
      const { error } = await supabase.auth.getUser()
      if (error) {
        await supabase.auth.signOut()
        setSession(null)
      } else {
        setSession(data.session)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session),
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email, senha) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })
    if (error) throw new Error(error.message)
  }

  async function signUp(email, senha, nome) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    })
    if (error) throw new Error(error.message)
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateNome(nome) {
    const { error } = await supabase.auth.updateUser({ data: { nome } })
    if (error) throw new Error(error.message)
  }

  async function updateSenha(senha) {
    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) throw new Error(error.message)
  }

  return {
    session,
    loading: session === undefined,
    signIn,
    signUp,
    signOut,
    updateNome,
    updateSenha,
  }
}

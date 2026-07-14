import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

export default function Login() {
  const { session, loading, signIn, signUp } = useAuthContext()
  const [modo, setModo] = useState('entrar') // 'entrar' | 'criar'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (!loading && session) {
    return <Navigate to="/pedidos" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    setAviso(null)
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        await signIn(email, senha)
      } else {
        const data = await signUp(email, senha, nome)
        if (!data.session) {
          setAviso('Conta criada. Verifique seu email pra confirmar antes de entrar.')
        }
      }
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl text-brown-darker">Cacau Show</h1>
        <p className="mt-1 text-sm text-brown-dark/60">Painel da loja</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          {modo === 'criar' && (
            <label className="text-sm text-brown-dark">
              Nome
              <input
                className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </label>
          )}

          <label className="text-sm text-brown-dark">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="text-sm text-brown-dark">
            Senha
            <input
              type="password"
              minLength={6}
              className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>

          {erro && <p className="text-sm text-red-600">{erro}</p>}
          {aviso && <p className="text-sm text-green-700">{aviso}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 rounded-md bg-brown-dark px-4 py-2 text-sm font-medium text-cream hover:bg-brown-darker disabled:opacity-60"
          >
            {enviando ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          onClick={() => {
            setModo(modo === 'entrar' ? 'criar' : 'entrar')
            setErro(null)
            setAviso(null)
          }}
          className="mt-4 text-sm text-brown-dark/60 hover:text-accent"
        >
          {modo === 'entrar'
            ? 'Primeira vez? Criar conta'
            : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  )
}

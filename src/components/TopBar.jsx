import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

export default function TopBar() {
  const { session, signOut } = useAuthContext()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)

  const nome = session?.user?.user_metadata?.nome
  const email = session?.user?.email

  async function handleSair() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex justify-end">
      <div className="relative">
        <button
          onClick={() => setAberto((v) => !v)}
          className="relative z-50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-brown-darker hover:bg-brown-dark/10"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
            {(nome || email || '?').charAt(0).toUpperCase()}
          </span>
          {nome || email}
          <svg className="h-3.5 w-3.5 text-brown-dark/50" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path d="M5 8l5 5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {aberto && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setAberto(false)}
            />
            <div className="absolute right-0 z-50 mt-1 w-32 rounded-md border border-brown-dark/10 bg-white p-1.5 shadow-lg">
              <button
                onClick={handleSair}
                className="block w-full cursor-pointer rounded-md px-3 py-1.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

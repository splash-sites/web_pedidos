import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const navItems = [
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/cardapio', label: 'Cardápio' },
  { to: '/historico', label: 'Histórico' },
  { to: '/configuracoes', label: 'Configurações' },
]

export default function Sidebar() {
  const { session, signOut } = useAuthContext()
  const navigate = useNavigate()

  const nome = session?.user?.user_metadata?.nome
  const email = session?.user?.email

  async function handleSair() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const navLinkClass = ({ isActive }) =>
    `rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-accent text-sidebar'
        : 'text-cream/80 hover:bg-sidebar-hover'
    }`

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between bg-sidebar px-5 py-6 text-cream">
      <div>
        <h1 className="font-serif text-2xl text-cream">Cacau Show</h1>
        <p className="mt-1 text-sm text-cream/60">Painel da loja</p>

        <nav className="mt-8 flex flex-col gap-1 border-t border-cream/10 pt-6">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-cream/10 pt-6">
        <p className="truncate text-sm font-medium text-cream/90">
          {nome || email}
        </p>
        {nome && <p className="truncate text-xs text-cream/50">{email}</p>}

        <button
          onClick={handleSair}
          className="mt-3 text-left text-sm text-cream/70 hover:text-cream"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}

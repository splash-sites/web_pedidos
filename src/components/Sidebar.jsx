import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/cardapio', label: 'Cardápio' },
  { to: '/historico', label: 'Histórico' },
]

const navLinkClass = ({ isActive }) =>
  `rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-accent text-sidebar'
      : 'text-cream/80 hover:bg-sidebar-hover'
  }`

export default function Sidebar() {
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

      <div className="flex flex-col border-t border-cream/10 pt-3">
        <NavLink to="/configuracoes" className={navLinkClass}>
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <circle cx="10" cy="10" r="2.5" strokeWidth="1.5" />
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                d="M10 2.5v1.4M10 16.1v1.4M17.5 10h-1.4M3.9 10H2.5M15.1 4.9l-1 1M5.9 14.1l-1 1M15.1 15.1l-1-1M5.9 5.9l-1-1"
              />
            </svg>
            Configurações
          </span>
        </NavLink>
      </div>
    </aside>
  )
}

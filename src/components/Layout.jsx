import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <TopBar />
        <div className="mt-4 border-t border-brown-dark/10 pt-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

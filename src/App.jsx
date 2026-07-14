import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Pedidos from './pages/Pedidos'
import Dashboard from './pages/Dashboard'
import Cardapio from './pages/Cardapio'
import Historico from './pages/Historico'
import Configuracoes from './pages/Configuracoes'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/pedidos" replace />} />
              <Route path="/pedidos" element={<Pedidos />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cardapio" element={<Cardapio />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

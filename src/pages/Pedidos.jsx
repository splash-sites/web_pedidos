import { useState } from 'react'
import { usePedidosRealtime } from '../hooks/usePedidosRealtime'
import KanbanColumn from '../components/KanbanColumn'
import SelecionarFuncionarioModal from '../components/SelecionarFuncionarioModal'

function formatHora(date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function Pedidos() {
  const { pedidos, loading, error, lastSync, avancarStatus, voltarStatus } =
    usePedidosRealtime()
  const [busyId, setBusyId] = useState(null)
  const [pedidoParaIniciar, setPedidoParaIniciar] = useState(null)

  const recebido = pedidos.filter((p) => p.status === 'a_fazer')
  const emPreparo = pedidos.filter((p) => p.status === 'em_preparo')
  const pronto = pedidos.filter((p) => p.status === 'pronto')

  async function handleAvancar(pedido) {
    if (pedido.status === 'a_fazer') {
      setPedidoParaIniciar(pedido)
      return
    }
    setBusyId(pedido.id)
    try {
      await avancarStatus(pedido)
    } catch (err) {
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleConfirmarFuncionario(funcionarioId) {
    setBusyId(pedidoParaIniciar.id)
    try {
      await avancarStatus(pedidoParaIniciar, funcionarioId)
      setPedidoParaIniciar(null)
    } finally {
      setBusyId(null)
    }
  }

  async function handleVoltar(pedido) {
    setBusyId(pedido.id)
    try {
      await voltarStatus(pedido)
    } catch (err) {
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-brown-darker">Pedidos</h2>
        <div className="flex items-center gap-2 text-sm text-brown-dark/60">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Atualiza automaticamente · {formatHora(lastSync)}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-brown-dark/60">Carregando...</p>
      ) : (
        <div className="mt-6 flex gap-8">
          <KanbanColumn
            titulo="Recebido"
            pedidos={recebido}
            onAvancar={handleAvancar}
            busyId={busyId}
            vazioMsg="Nenhum pedido recebido ainda."
          />
          <KanbanColumn
            titulo="Em preparo"
            pedidos={emPreparo}
            onAvancar={handleAvancar}
            onVoltar={handleVoltar}
            busyId={busyId}
            vazioMsg="Nenhum pedido em preparo."
          />
          <KanbanColumn
            titulo="Pronto"
            pedidos={pronto}
            onAvancar={handleAvancar}
            onVoltar={handleVoltar}
            busyId={busyId}
            vazioMsg="Nenhum pedido pronto ainda."
          />
        </div>
      )}

      {pedidoParaIniciar && (
        <SelecionarFuncionarioModal
          onConfirmar={handleConfirmarFuncionario}
          onCancelar={() => setPedidoParaIniciar(null)}
        />
      )}
    </div>
  )
}

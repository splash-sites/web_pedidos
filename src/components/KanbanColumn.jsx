import PedidoCard from './PedidoCard'

export default function KanbanColumn({
  titulo,
  pedidos,
  onAvancar,
  onVoltar,
  busyId,
  vazioMsg,
}) {
  return (
    <div className="min-w-[280px] flex-1">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-brown-darker">{titulo}</h3>
        <span className="rounded-full bg-brown-dark/10 px-2 py-0.5 text-xs font-medium text-brown-dark">
          {pedidos.length}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {pedidos.length === 0 ? (
          <p className="text-sm text-brown-dark/50">{vazioMsg}</p>
        ) : (
          pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onAvancar={onAvancar}
              onVoltar={onVoltar}
              busy={busyId === pedido.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

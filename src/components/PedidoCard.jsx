const BOTAO_LABEL = {
  a_fazer: 'Iniciar preparo',
  em_preparo: 'Marcar como pronto',
  pronto: 'Marcar como entregue',
}

function formatHora(isoString) {
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function capitalizarNome(nome) {
  return nome
    .split(' ')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ')
}

function formatTitulo(pedido, isDelivery) {
  if (isDelivery) {
    return pedido.nome ? capitalizarNome(pedido.nome) : 'Delivery'
  }
  const mesa = `Mesa: ${pedido.identificacao}`
  return pedido.nome ? `${mesa} - ${capitalizarNome(pedido.nome)}` : mesa
}

export default function PedidoCard({ pedido, onAvancar, onVoltar, busy }) {
  const isDelivery = pedido.modalidade === 'delivery'

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-brown-darker">
          {formatTitulo(pedido, isDelivery)}
        </h4>
        <span className="text-xs text-brown-dark/50">
          {formatHora(pedido.created_at)}
        </span>
      </div>

      <span
        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
          isDelivery ? 'bg-red-100 text-red-700' : 'bg-brown-dark/10 text-brown-dark'
        }`}
      >
        {isDelivery ? 'Delivery' : 'Cafeteria'}
      </span>

      {pedido.dono_id == null && (
        <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
          Sem dono — avançar assume pra sua loja
        </span>
      )}

      {pedido.funcionarios?.nome && (
        <p className="mt-1 text-xs text-brown-dark/60">
          Preparo: {pedido.funcionarios.nome}
        </p>
      )}

      <ul className="mt-3 flex flex-col gap-2">
        {pedido.itens_pedido.map((item) => (
          <li key={item.id} className="text-sm">
            <span className="text-brown-darker">
              {item.quantidade}× {item.produtos?.nome ?? 'Produto removido'}
            </span>
            {item.observacao && (
              <p className="italic text-brown-dark/60">
                &quot;{item.observacao}&quot;
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        {onVoltar && (
          <button
            onClick={() => onVoltar(pedido)}
            disabled={busy}
            className="rounded-md bg-cream px-3 py-2 text-sm text-brown-dark hover:bg-brown-dark/10 disabled:opacity-50"
          >
            ‹
          </button>
        )}
        <button
          onClick={() => onAvancar(pedido)}
          disabled={busy}
          className="flex-1 rounded-md bg-brown-dark px-4 py-2 text-sm font-medium text-cream hover:bg-brown-darker disabled:opacity-50"
        >
          {busy ? 'Atualizando...' : BOTAO_LABEL[pedido.status]}
        </button>
      </div>
    </div>
  )
}

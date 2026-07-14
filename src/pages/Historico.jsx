import { useHistorico } from '../hooks/useHistorico'

const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function formatDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Historico() {
  const { pedidos, loading, error } = useHistorico()

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brown-darker">Histórico</h2>
      <p className="mt-1 text-sm text-brown-dark/60">
        Últimos pedidos entregues.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-brown-dark/60">Carregando...</p>
      ) : pedidos.length === 0 ? (
        <p className="mt-6 text-sm text-brown-dark/60">
          Nenhum pedido entregue ainda.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-brown-dark/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-brown-dark">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Mesa</th>
                <th className="px-4 py-3 font-medium">Itens</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Entregue em</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id} className="border-t border-brown-dark/10">
                  <td className="px-4 py-3 font-mono text-xs text-brown-dark/60">
                    #{String(p.numero ?? 0).padStart(4, '0')}
                  </td>
                  <td className="px-4 py-3 font-medium text-brown-darker">
                    {p.identificacao}
                  </td>
                  <td className="px-4 py-3 text-brown-dark/70">
                    {p.itens_pedido
                      .map(
                        (item) =>
                          `${item.quantidade}× ${item.produtos?.nome ?? 'Produto removido'}`,
                      )
                      .join(', ')}
                  </td>
                  <td className="px-4 py-3 text-brown-dark/70">
                    {formatoMoeda.format(Number(p.total))}
                  </td>
                  <td className="px-4 py-3 text-brown-dark/70">
                    {formatDataHora(p.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

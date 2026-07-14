import { useDashboard } from '../hooks/useDashboard'
import StatTile from '../components/StatTile'

const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const STATUS_LABEL = {
  a_fazer: 'Recebido',
  em_preparo: 'Em preparo',
  pronto: 'Pronto',
}

function formatMinutos(min) {
  if (min == null) return '—'
  if (min < 1) return '< 1 min'
  return `${Math.round(min)} min`
}

export default function Dashboard() {
  const { stats, loading, error } = useDashboard()

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brown-darker">Dashboard</h2>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loading || !stats ? (
        <p className="mt-6 text-sm text-brown-dark/60">Carregando...</p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          <div className="flex gap-4">
            <StatTile label="Pedidos hoje" value={stats.totalPedidos} />
            <StatTile
              label="Receita hoje"
              value={formatoMoeda.format(stats.receitaHoje)}
            />
            <StatTile
              label="Ticket médio"
              value={formatoMoeda.format(stats.ticketMedio)}
            />
            <StatTile
              label="Tempo médio de preparo"
              value={formatMinutos(stats.tempoMedioPreparoMin)}
              sublabel="pedidos prontos/entregues hoje"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-brown-darker">
                Pedidos por status agora
              </h3>
              <div className="mt-3 flex flex-col gap-2">
                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm"
                  >
                    <span className="text-sm text-brown-dark">{label}</span>
                    <span className="font-semibold text-brown-darker">
                      {stats.porStatus[key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-brown-darker">
                Produtos mais vendidos hoje
              </h3>
              {stats.maisVendidos.length === 0 ? (
                <p className="mt-3 text-sm text-brown-dark/50">
                  Nenhuma venda registrada hoje.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {stats.maisVendidos.map((p, i) => (
                    <div
                      key={p.nome}
                      className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm"
                    >
                      <span className="text-sm text-brown-dark">
                        {i + 1}. {p.nome}
                      </span>
                      <span className="font-semibold text-brown-darker">
                        {p.quantidade}×
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-brown-darker">Estoque baixo</h3>
            {stats.estoqueBaixo.length === 0 ? (
              <p className="mt-3 text-sm text-brown-dark/50">
                Nenhum produto com estoque baixo.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {stats.estoqueBaixo.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm"
                  >
                    <span className="text-sm text-brown-dark">{p.nome}</span>
                    <span className="font-semibold text-red-600">
                      {p.estoque} un.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

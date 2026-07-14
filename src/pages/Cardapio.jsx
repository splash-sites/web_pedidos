import { useMemo, useState } from 'react'
import { useProdutos } from '../hooks/useProdutos'
import ProdutoForm from '../components/ProdutoForm'

export default function Cardapio() {
  const {
    produtos,
    loading,
    error,
    createProduto,
    updateProduto,
    deleteProduto,
  } = useProdutos()

  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [editing, setEditing] = useState(null) // null = fechado, {} = novo, {...} = editar
  const [deletingId, setDeletingId] = useState(null)

  const categorias = useMemo(() => {
    const set = new Set(produtos.map((p) => p.categoria).filter(Boolean))
    return ['todas', ...set]
  }, [produtos])

  const filtrados = useMemo(() => {
    return produtos.filter((p) => {
      const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
      const bateCategoria = categoria === 'todas' || p.categoria === categoria
      return bateBusca && bateCategoria
    })
  }, [produtos, busca, categoria])

  async function handleSave(values) {
    if (editing?.id) {
      await updateProduto(editing.id, values)
    } else {
      await createProduto(values)
    }
    setEditing(null)
  }

  async function handleDelete(produto) {
    if (!confirm(`Excluir "${produto.nome}"? Essa ação não pode ser desfeita.`)) {
      return
    }
    setDeletingId(produto.id)
    try {
      await deleteProduto(produto.id)
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-brown-darker">Cardápio</h2>
        <button
          onClick={() => setEditing({})}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Novo produto
        </button>
      </div>

      <div className="mt-4 flex gap-3">
        <input
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-64 rounded-md border border-brown-dark/20 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <div className="relative">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="appearance-none rounded-md border border-brown-dark/20 bg-white py-2 pl-3 pr-8 text-sm text-brown-dark focus:border-accent focus:outline-none"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c === 'todas' ? 'Todas as categorias' : c}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-dark/50"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
          >
            <path d="M6 8l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-brown-dark/60">Carregando...</p>
      ) : filtrados.length === 0 ? (
        <p className="mt-6 text-sm text-brown-dark/60">
          Nenhum produto encontrado.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-brown-dark/30 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-brown-dark">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Canais</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-t border-brown-dark/10">
                  <td className="px-4 py-3 font-medium text-brown-darker">
                    {p.nome}
                  </td>
                  <td className="px-4 py-3 text-brown-dark/70">
                    {p.categoria || '—'}
                  </td>
                  <td className="px-4 py-3 text-brown-dark/70">
                    R$ {Number(p.preco).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-brown-dark/70">
                    {p.estoque}
                  </td>
                  <td className="px-4 py-3 text-xs text-brown-dark/70">
                    {[
                      p.disponivel_cafeteria && 'Cafeteria',
                      p.disponivel_delivery && 'Delivery',
                    ]
                      .filter(Boolean)
                      .join(' + ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        p.ativo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(p)}
                      className="mr-3 text-brown-dark hover:text-accent"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deletingId === p.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <ProdutoForm
          produto={editing.id ? editing : null}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}

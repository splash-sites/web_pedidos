import { useState } from 'react'
import { useCategorias } from '../hooks/useCategorias'

const emptyForm = {
  nome: '',
  descricao: '',
  preco: '',
  categoria: '',
  imagem_url: '',
  estoque: '',
  ativo: true,
  disponivel_cafeteria: true,
  disponivel_delivery: true,
}

export default function ProdutoForm({ produto, onSave, onCancel }) {
  const { categorias } = useCategorias()
  const [form, setForm] = useState(
    produto
      ? {
          nome: produto.nome ?? '',
          descricao: produto.descricao ?? '',
          preco: produto.preco ?? '',
          categoria: produto.categoria ?? '',
          imagem_url: produto.imagem_url ?? '',
          estoque: produto.estoque ?? '',
          ativo: produto.ativo ?? true,
          disponivel_cafeteria: produto.disponivel_cafeteria ?? true,
          disponivel_delivery: produto.disponivel_delivery ?? true,
        }
      : emptyForm,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome.trim()) {
      setError('Nome é obrigatório.')
      return
    }
    if (!form.disponivel_cafeteria && !form.disponivel_delivery) {
      setError('Selecione pelo menos um canal: Cafeteria ou Delivery.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        preco: form.preco === '' ? 0 : Number(form.preco),
        categoria: form.categoria.trim() || null,
        imagem_url: form.imagem_url.trim() || null,
        estoque: form.estoque === '' ? 0 : Number(form.estoque),
        ativo: form.ativo,
        disponivel_cafeteria: form.disponivel_cafeteria,
        disponivel_delivery: form.disponivel_delivery,
      })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-brown-darker">
          {produto ? 'Editar produto' : 'Novo produto'}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="text-sm text-brown-dark">
            Nome
            <input
              className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              autoFocus
            />
          </label>

          <label className="text-sm text-brown-dark">
            Descrição
            <textarea
              className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
              rows={2}
              value={form.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-brown-dark">
              Preço (R$)
              <input
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                value={form.preco}
                onChange={(e) => handleChange('preco', e.target.value)}
              />
            </label>

            <label className="text-sm text-brown-dark">
              Estoque
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
                value={form.estoque}
                onChange={(e) => handleChange('estoque', e.target.value)}
              />
            </label>
          </div>

          <label className="text-sm text-brown-dark">
            Categoria
            <select
              className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
              value={form.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-brown-dark">
            URL da imagem
            <input
              className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
              value={form.imagem_url}
              onChange={(e) => handleChange('imagem_url', e.target.value)}
            />
          </label>

          <div className="text-sm text-brown-dark">
            Canais de venda
            <div className="mt-1 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.disponivel_cafeteria}
                  onChange={(e) => handleChange('disponivel_cafeteria', e.target.checked)}
                />
                Cafeteria
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.disponivel_delivery}
                  onChange={(e) => handleChange('disponivel_delivery', e.target.checked)}
                />
                Delivery
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-brown-dark">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => handleChange('ativo', e.target.checked)}
            />
            Ativo no cardápio
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-4 py-2 text-sm text-brown-dark hover:bg-cream"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brown-dark px-4 py-2 text-sm font-medium text-cream hover:bg-brown-darker disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

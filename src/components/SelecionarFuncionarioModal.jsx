import { useState } from 'react'
import { useFuncionarios } from '../hooks/useFuncionarios'

export default function SelecionarFuncionarioModal({ onConfirmar, onCancelar }) {
  const { funcionarios, loading } = useFuncionarios()
  const [selecionadoId, setSelecionadoId] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  const ativos = funcionarios.filter((f) => f.ativo)

  async function handleConfirmar(e) {
    e.preventDefault()
    if (!selecionadoId) {
      setErro('Selecione quem vai preparar.')
      return
    }
    setEnviando(true)
    setErro(null)
    try {
      await onConfirmar(selecionadoId)
    } catch (err) {
      setErro(err.message)
      setEnviando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancelar}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-brown-darker">
          Quem vai preparar?
        </h3>

        {loading ? (
          <p className="mt-4 text-sm text-brown-dark/60">Carregando...</p>
        ) : ativos.length === 0 ? (
          <p className="mt-4 text-sm text-brown-dark/60">
            Nenhum funcionário ativo cadastrado. Cadastre em Configurações →
            Funcionários.
          </p>
        ) : (
          <form onSubmit={handleConfirmar} className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {ativos.map((f) => (
                <label
                  key={f.id}
                  className="flex items-center gap-2 rounded-md border border-brown-dark/20 px-3 py-2 text-sm text-brown-dark has-[:checked]:border-accent has-[:checked]:bg-cream"
                >
                  <input
                    type="radio"
                    name="funcionario"
                    value={f.id}
                    checked={selecionadoId === f.id}
                    onChange={(e) => setSelecionadoId(e.target.value)}
                  />
                  {f.nome}
                </label>
              ))}
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelar}
                className="rounded-md px-4 py-2 text-sm text-brown-dark hover:bg-cream"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="rounded-md bg-brown-dark px-4 py-2 text-sm font-medium text-cream hover:bg-brown-darker disabled:opacity-60"
              >
                {enviando ? 'Confirmando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        )}

        {!loading && ativos.length === 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onCancelar}
              className="cursor-pointer rounded-md px-4 py-2 text-sm text-brown-dark hover:bg-cream"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

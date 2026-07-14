import { useEffect, useState } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { useCategorias } from '../hooks/useCategorias'
import { useFuncionarios } from '../hooks/useFuncionarios'
import { useLoja } from '../hooks/useLoja'

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SECOES = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'loja', label: 'Loja' },
  { id: 'categorias', label: 'Categorias' },
  { id: 'funcionarios', label: 'Funcionários' },
]

function PerfilSection() {
  const { session, updateNome, updateSenha } = useAuthContext()
  const [nome, setNome] = useState(session?.user?.user_metadata?.nome ?? '')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)

    if (senha || confirmar) {
      if (senha.length < 6) {
        setMsg({ tipo: 'erro', texto: 'Senha precisa ter pelo menos 6 caracteres.' })
        return
      }
      if (senha !== confirmar) {
        setMsg({ tipo: 'erro', texto: 'Senhas não conferem.' })
        return
      }
    }

    setSalvando(true)
    try {
      await updateNome(nome.trim())
      if (senha) {
        await updateSenha(senha)
        setSenha('')
        setConfirmar('')
      }
      setMsg({ tipo: 'ok', texto: 'Perfil atualizado.' })
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      <h3 className="font-semibold text-brown-darker">Perfil</h3>
      <form onSubmit={handleSubmit} className="mt-4 flex max-w-sm flex-col gap-3">
        <label className="text-sm text-brown-dark">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>
        <label className="text-sm text-brown-dark">
          Email
          <input
            disabled
            value={session?.user?.email ?? ''}
            className="mt-1 w-full rounded-md border border-brown-dark/20 bg-cream px-3 py-2 text-sm text-brown-dark/60"
          />
        </label>
        <label className="text-sm text-brown-dark">
          Nova senha
          <input
            type="password"
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>
        <label className="text-sm text-brown-dark">
          Confirmar nova senha
          <input
            type="password"
            minLength={6}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>
        <span className="-mt-2 text-xs text-brown-dark/50">
          Deixe os campos de senha em branco pra manter a senha atual.
        </span>
        {msg && (
          <p className={`text-sm ${msg.tipo === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
            {msg.texto}
          </p>
        )}
        <button
          type="submit"
          disabled={salvando}
          className="self-start rounded-md bg-brown-dark px-4 py-2 text-sm font-medium text-cream hover:bg-brown-darker disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}

const CARDAPIO_BASE_URL = 'https://cardapio-app-teal.vercel.app/loja/'

function LojaSection() {
  const { loja, loading, error: erroCarregar, salvarLoja } = useLoja()
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (loja) {
      setNome(loja.nome)
      setSlug(loja.slug)
      setWhatsapp(loja.whatsapp ?? '')
    }
  }, [loja])

  function handleSlugChange(valor) {
    setSlug(slugify(valor))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim() || !slug.trim()) {
      setMsg({ tipo: 'erro', texto: 'Nome e identificador (slug) são obrigatórios.' })
      return
    }
    setSalvando(true)
    setMsg(null)
    try {
      await salvarLoja({
        nome: nome.trim(),
        slug: slug.trim(),
        whatsapp: whatsapp.replace(/\D/g, '') || null,
      })
      setMsg({ tipo: 'ok', texto: 'Loja salva.' })
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      <h3 className="font-semibold text-brown-darker">Loja</h3>
      <p className="mt-1 max-w-sm text-sm text-brown-dark/60">
        Informações da sua loja usadas pelo cardápio online.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-brown-dark/60">Carregando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex max-w-sm flex-col gap-3">
          <label className="text-sm text-brown-dark">
            Nome da loja
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Cacau Show - Centro"
              className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <label className="text-sm text-brown-dark">
            Identificador do cardápio
            <input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="cacau-show-centro"
              className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm font-mono focus:border-accent focus:outline-none"
            />
            <span className="mt-1 block text-xs text-brown-dark/50">
              Esse texto vira o endereço do seu cardápio online, o link que
              você compartilha com os clientes. Use só letras, números e
              hífen — sem espaços ou acentos.
            </span>
            {slug && (
              <a
                href={`${CARDAPIO_BASE_URL}${slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block rounded-md border border-brown-dark/20 px-3 py-1.5 text-xs font-medium text-brown-dark hover:bg-cream"
              >
                Ver cardápio ↗
              </a>
            )}
          </label>
          <label className="text-sm text-brown-dark">
            WhatsApp
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="5511999999999"
              className="mt-1 w-full rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
            <span className="mt-1 block text-xs text-brown-dark/50">
              Com DDI + DDD, só números (ex: 55 + DDD + número). Pro cliente ser
              redirecionado no final do pedido.
            </span>
          </label>
          {erroCarregar && <p className="text-sm text-red-600">{erroCarregar}</p>}
          {msg && (
            <p className={`text-sm ${msg.tipo === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
              {msg.texto}
            </p>
          )}
          <button
            type="submit"
            disabled={salvando}
            className="self-start rounded-md bg-brown-dark px-4 py-2 text-sm font-medium text-cream hover:bg-brown-darker disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}
    </div>
  )
}

function CategoriasSection() {
  const { categorias, loading, error, createCategoria, updateCategoria, deleteCategoria } =
    useCategorias()
  const [novaCategoria, setNovaCategoria] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [editandoNome, setEditandoNome] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  async function handleCriar(e) {
    e.preventDefault()
    if (!novaCategoria.trim()) return
    setEnviando(true)
    setErro(null)
    try {
      await createCategoria(novaCategoria.trim())
      setNovaCategoria('')
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  function iniciarEdicao(categoria) {
    setEditandoId(categoria.id)
    setEditandoNome(categoria.nome)
  }

  async function handleSalvarEdicao(id) {
    if (!editandoNome.trim()) return
    setErro(null)
    try {
      await updateCategoria(id, editandoNome.trim())
      setEditandoId(null)
    } catch (err) {
      setErro(err.message)
    }
  }

  async function handleExcluir(categoria) {
    if (!confirm(`Excluir categoria "${categoria.nome}"?`)) return
    setErro(null)
    try {
      await deleteCategoria(categoria.id)
    } catch (err) {
      setErro(err.message)
    }
  }

  return (
    <div>
      <h3 className="font-semibold text-brown-darker">Categorias</h3>
      <p className="mt-1 max-w-sm text-sm text-brown-dark/60">
        Usadas no campo categoria ao cadastrar produtos no Cardápio.
      </p>

      <form onSubmit={handleCriar} className="mt-4 flex max-w-sm gap-2">
        <input
          placeholder="Nova categoria..."
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          className="flex-1 rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          Adicionar
        </button>
      </form>

      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}

      {loading ? (
        <p className="mt-4 text-sm text-brown-dark/60">Carregando...</p>
      ) : categorias.length === 0 ? (
        <p className="mt-4 text-sm text-brown-dark/60">
          Nenhuma categoria cadastrada.
        </p>
      ) : (
        <div className="mt-4 max-w-sm overflow-hidden rounded-lg border border-brown-dark/10 bg-cream">
          {categorias.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border-t border-brown-dark/10 px-4 py-2 first:border-t-0"
            >
              {editandoId === c.id ? (
                <input
                  autoFocus
                  value={editandoNome}
                  onChange={(e) => setEditandoNome(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSalvarEdicao(c.id)}
                  className="mr-2 flex-1 rounded-md border border-brown-dark/20 px-2 py-1 text-sm focus:border-accent focus:outline-none"
                />
              ) : (
                <span className="text-sm text-brown-dark">{c.nome}</span>
              )}

              <div className="flex gap-3 text-sm">
                {editandoId === c.id ? (
                  <button
                    onClick={() => handleSalvarEdicao(c.id)}
                    className="text-accent hover:opacity-80"
                  >
                    Salvar
                  </button>
                ) : (
                  <button
                    onClick={() => iniciarEdicao(c)}
                    className="text-brown-dark hover:text-accent"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => handleExcluir(c)}
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FuncionariosSection() {
  const {
    funcionarios,
    loading,
    error,
    createFuncionario,
    updateFuncionario,
    deleteFuncionario,
  } = useFuncionarios()
  const [novoNome, setNovoNome] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [editandoNome, setEditandoNome] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  async function handleCriar(e) {
    e.preventDefault()
    if (!novoNome.trim()) return
    setEnviando(true)
    setErro(null)
    try {
      await createFuncionario(novoNome.trim())
      setNovoNome('')
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  function iniciarEdicao(funcionario) {
    setEditandoId(funcionario.id)
    setEditandoNome(funcionario.nome)
  }

  async function handleSalvarEdicao(id) {
    if (!editandoNome.trim()) return
    setErro(null)
    try {
      await updateFuncionario(id, { nome: editandoNome.trim() })
      setEditandoId(null)
    } catch (err) {
      setErro(err.message)
    }
  }

  async function handleToggleAtivo(funcionario) {
    setErro(null)
    try {
      await updateFuncionario(funcionario.id, { ativo: !funcionario.ativo })
    } catch (err) {
      setErro(err.message)
    }
  }

  async function handleExcluir(funcionario) {
    if (!confirm(`Excluir funcionário "${funcionario.nome}"?`)) return
    setErro(null)
    try {
      await deleteFuncionario(funcionario.id)
    } catch (err) {
      setErro(err.message)
    }
  }

  return (
    <div>
      <h3 className="font-semibold text-brown-darker">Funcionários</h3>
      <p className="mt-1 max-w-sm text-sm text-brown-dark/60">
        Quem pode ser escolhido como responsável pelo preparo ao iniciar um pedido.
      </p>

      <form onSubmit={handleCriar} className="mt-4 flex max-w-sm gap-2">
        <input
          placeholder="Nome do funcionário..."
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          className="flex-1 rounded-md border border-brown-dark/20 px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          Adicionar
        </button>
      </form>

      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}

      {loading ? (
        <p className="mt-4 text-sm text-brown-dark/60">Carregando...</p>
      ) : funcionarios.length === 0 ? (
        <p className="mt-4 text-sm text-brown-dark/60">
          Nenhum funcionário cadastrado.
        </p>
      ) : (
        <div className="mt-4 max-w-sm overflow-hidden rounded-lg border border-brown-dark/10 bg-cream">
          {funcionarios.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between border-t border-brown-dark/10 px-4 py-2 first:border-t-0"
            >
              {editandoId === f.id ? (
                <input
                  autoFocus
                  value={editandoNome}
                  onChange={(e) => setEditandoNome(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSalvarEdicao(f.id)}
                  className="mr-2 flex-1 rounded-md border border-brown-dark/20 px-2 py-1 text-sm focus:border-accent focus:outline-none"
                />
              ) : (
                <span
                  className={`text-sm ${f.ativo ? 'text-brown-dark' : 'text-brown-dark/40 line-through'}`}
                >
                  {f.nome}
                </span>
              )}

              <div className="flex gap-3 text-sm">
                {editandoId === f.id ? (
                  <button
                    onClick={() => handleSalvarEdicao(f.id)}
                    className="text-accent hover:opacity-80"
                  >
                    Salvar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleToggleAtivo(f)}
                      className="text-brown-dark hover:text-accent"
                    >
                      {f.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => iniciarEdicao(f)}
                      className="text-brown-dark hover:text-accent"
                    >
                      Editar
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleExcluir(f)}
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const CONTEUDO = {
  perfil: PerfilSection,
  loja: LojaSection,
  categorias: CategoriasSection,
  funcionarios: FuncionariosSection,
}

export default function Configuracoes() {
  const [secaoAtiva, setSecaoAtiva] = useState('perfil')
  const ConteudoAtivo = CONTEUDO[secaoAtiva]

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brown-darker">Configurações</h2>

      <div className="mt-6 flex gap-10">
        <nav className="flex w-40 shrink-0 flex-col gap-1">
          {SECOES.map((secao) => (
            <button
              key={secao.id}
              onClick={() => setSecaoAtiva(secao.id)}
              className={`rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                secaoAtiva === secao.id
                  ? 'bg-accent text-white'
                  : 'text-brown-dark hover:bg-brown-dark/10'
              }`}
            >
              {secao.label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          <ConteudoAtivo />
        </div>
      </div>
    </div>
  )
}

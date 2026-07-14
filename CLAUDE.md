# CLAUDE.md — web-pedidos (Recebimento de Pedidos)

> Renomear para `CLAUDE.md` e colocar na raiz deste repositório.

## Visão geral

Este repositório é **metade de um sistema de pedidos com dois projetos independentes**:

1. `web-pedidos` (este repo) — painel de **recebimento de pedidos**, uso desktop/web, mantido por mim.
2. `cardapio-app` (outro repo, outra pessoa) — **cardápio + envio de pedidos**, site responsivo mobile-first.

Os dois são **sites React separados, deployados separadamente na Vercel**, sem nenhum app nativo envolvido. Eles **não se comunicam diretamente entre si** — a única ponte é o **mesmo projeto Supabase** (banco compartilhado + Realtime).

⚠️ **Virou multi-loja** (ver seção "Feature: Multi-loja" mais abaixo): cada conta (login) é uma loja separada, com produtos/categorias/pedidos próprios. Isso muda o que o `cardapio-app` precisa fazer ao ler `produtos` e criar `pedidos` — leia a seção antes de mexer em qualquer coisa relacionada.

## Papel deste repositório

- CRUD de produtos: **criar, editar, deletar**, e controlar **estoque**
- Painel estilo **kanban** dos pedidos recebidos, com 3 colunas de status
- Botão de **avançar status** em cada pedido
- Atualização em tempo real via Supabase Realtime (outro lado cria pedido → aparece aqui na hora)
- Interface pensada para **desktop**, mas responsiva

## Stack

- React + Vite
- Cliente Supabase (`@supabase/supabase-js`)
- CSS/Tailwind (sugestão) para estilização
- Deploy: Vercel

## Modelo de dados (Supabase — compartilhado com `cardapio-app`)

⚠️ Este schema é **contrato entre os dois repositórios**. Qualquer alteração aqui precisa ser combinada com quem mantém o `cardapio-app`, porque os dois leem/escrevem nas mesmas tabelas.

### `produtos`
| campo | tipo |
|---|---|
| id | uuid (pk) |
| dono_id | uuid (fk → auth.users) — **novo, dono/loja do produto** |
| nome | text |
| descricao | text |
| preco | numeric |
| categoria | text |
| imagem_url | text |
| estoque | integer |
| disponivel_cafeteria | boolean, not null default true — **novo, aparece pro cliente na Cafeteria** |
| disponivel_delivery | boolean, not null default true — **novo, aparece pro cliente no Delivery** |
| ativo | boolean |
| created_at | timestamp |

### `pedidos`
| campo | tipo |
|---|---|
| id | uuid (pk) |
| dono_id | uuid (fk → auth.users), **nullable** — **novo, dono/loja do pedido**. Fica `null` até o `cardapio-app` passar a mandar esse campo, ou até um funcionário desta loja avançar/voltar o status dele (auto-reivindica) |
| status | enum: `a_fazer`, `em_preparo`, `pronto`, `entregue` |
| modalidade | text: `cafeteria` ou `delivery`, not null default `cafeteria` — **novo** |
| identificacao | text (mesa) — só usado quando `modalidade='cafeteria'` |
| nome | text — nome do cliente, só usado quando `modalidade='delivery'` |
| cpf | text, opcional — só delivery |
| endereco_rua / endereco_numero / endereco_complemento / endereco_bairro | text, opcionais — só delivery |
| total | numeric |
| created_at | timestamp |
| updated_at | timestamp |

### `itens_pedido`
| campo | tipo |
|---|---|
| id | uuid (pk) |
| pedido_id | uuid (fk → pedidos) |
| produto_id | uuid (fk → produtos) |
| quantidade | integer |
| preco_unitario | numeric |
| observacao | text |

## Fluxo de status do pedido

```
a_fazer → em_preparo → pronto → entregue
```

Este repo é responsável por **avançar** o status (o `cardapio-app` só cria o pedido em `a_fazer` e escuta as mudanças).

## Variáveis de ambiente

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

Mesma URL e mesma chave usadas no `cardapio-app` (mesmo projeto Supabase).

## Como este repo se conecta com o `cardapio-app`

- Não há chamada direta entre os dois front-ends — tudo passa pelo Supabase.
- Este repo faz **subscribe** na tabela `pedidos` (Realtime) para atualizar o kanban assim que um pedido novo chega ou muda de status em qualquer um dos lados.
- Alterações de schema, enums ou policies (RLS) devem ser avisadas ao parceiro antes de subir.

## Estrutura de pastas sugerida

```
src/
  components/       → Card de pedido, coluna do kanban, form de produto
  pages/            → Pedidos (kanban), Cardápio (CRUD produtos), Dashboard, Histórico
  lib/
    supabaseClient.js
  hooks/
    usePedidosRealtime.js
    useProdutos.js
```

## Estado atual (implementado)

- Página **Pedidos**: kanban real com 3 colunas (Recebido/`a_fazer`, Em preparo/`em_preparo`, Pronto/`pronto`), busca dados de `pedidos` + `itens_pedido` + `produtos`, botão avançar status (e botão `‹` pra voltar), realtime via Supabase.
- Página **Cardápio**: CRUD completo de produtos (listar, criar, editar, excluir, filtro por categoria/busca), testado end-to-end contra o Supabase real.
- Página **Dashboard**: stats do dia (pedidos, receita, ticket médio, tempo médio de preparo), status agora, top 5 vendidos hoje, estoque baixo. Ver detalhes/limitações abaixo.
- Página **Histórico**: últimos 50 pedidos com status `entregue`, ordenados por `updated_at` desc, com itens e total.
- Sidebar com os itens: Pedidos, Dashboard, Cardápio, Histórico.

### ⚠️ Pegadinha do Realtime (itens_pedido sem replication)

A subscription de Realtime só está ligada na tabela `pedidos` (`src/hooks/usePedidosRealtime.js`). Tentei também assinar `itens_pedido`, mas o Supabase respondeu `"Unable to subscribe to changes... Please check Realtime is enabled for the given connect parameters: table: itens_pedido"` — **e isso quebrava o canal inteiro**, inclusive o binding de `pedidos` que funcionava. Removi a assinatura de `itens_pedido` pra não travar tudo.

Se quiser que o kanban reaja também a itens adicionados/editados depois da criação do pedido (não só à mudança de status), é preciso:
1. Habilitar Realtime pra `itens_pedido` no Supabase Dashboard → Database → Replication (marcar a tabela na publication `supabase_realtime`)
2. Depois disso, adicionar de volta o segundo `.on('postgres_changes', { table: 'itens_pedido' }, ...)` no hook

Hoje isso não é crítico porque o `cardapio-app` cria pedido + itens juntos — o INSERT em `pedidos` já dispara o refetch e traz os itens junto.

## Feature: Cardápio (CRUD de produtos) — implementada

Página de gestão de produtos do cardápio (`src/pages/Cardapio.jsx`). Usa a tabela `produtos`.

- [x] Listagem de produtos (nome, categoria, preço, estoque, canais, status ativo/inativo)
- [x] Criar produto (nome, descrição, preço, categoria, imagem, estoque inicial, canais)
- [x] Editar produto
- [x] Excluir produto (hard delete, com confirmação — não é soft-delete, `ativo=false` é um checkbox separado no form)
- [x] Controle de estoque — via campo no form de edição (não tem botão dedicado de "+1/-1", é edição direta do número)
- [ ] Upload de imagem — **não implementado**, só campo de URL (`imagem_url` texto). Se precisar upload de arquivo de verdade, precisa de Supabase Storage.
- [x] Filtro por categoria e busca por nome

## Feature: Dashboard — v1 implementada

Página `/dashboard` (`src/pages/Dashboard.jsx` + `src/hooks/useDashboard.js`), realtime na tabela `pedidos`. Escopo é só **hoje** (sem filtro de período ainda).

- [x] **Pedidos do dia**: total de pedidos, receita do dia, ticket médio
- [x] **Tempo médio de preparo**: aproximado por `updated_at - created_at` dos pedidos `pronto`/`entregue` hoje — **cuidado**: `updated_at` é sobrescrito a cada mudança de status, então se um pedido já virou `entregue`, esse número deixa de refletir só o tempo até ficar pronto. Pra medição precisa, precisaria de uma coluna tipo `pronto_at` separada.
- [x] **Pedidos por status agora**: contagem Recebido/Em preparo/Pronto
- [x] **Produtos mais vendidos**: ranking top 5 por quantidade, escopo hoje (via `itens_pedido` dos pedidos criados hoje)
- [x] **Produtos com estoque baixo**: alerta quando `estoque <= 5` (limite fixo no código, `ESTOQUE_BAIXO_LIMITE` em `useDashboard.js`)
- [ ] **Receita por período**: gráfico dia/semana/mês — não implementado, precisa decidir range/agrupamento
- [ ] **Horários de pico**: não implementado

Pontos em aberto: filtro de período (hoje/semana/mês/custom) e gráfico de receita ficaram de fora do v1 — avaliar se vale a pena antes de mexer.

## Feature: Autenticação + Configurações — implementada

Antes disso **não existia login nenhum** — o botão "Sair" era decorativo. Agora:

- **Supabase Auth** (email + senha), via `src/hooks/useAuth.js` + `src/context/AuthContext.jsx`
- `src/pages/Login.jsx`: tela de entrar/criar conta (toggle). Signup usa `supabase.auth.signUp` com `options.data.nome` pro nome ir pro `user_metadata`
- `src/components/ProtectedRoute.jsx`: todas as rotas do painel (exceto `/login`) exigem sessão — sem sessão redireciona pra `/login`
- Sidebar mostra nome/email da sessão e "Sair" agora chama `signOut()` de verdade
- `src/pages/Configuracoes.jsx` (rota `/configuracoes`, nova entrada na sidebar):
  - **Perfil**: editar nome (`supabase.auth.updateUser({ data: { nome } })`)
  - **Senha**: trocar senha (`supabase.auth.updateUser({ password })`)
  - **Categorias**: CRUD completo (criar/editar/excluir), usadas como `<select>` no campo categoria do `ProdutoForm` (Cardápio) — antes era texto livre

### Testado

- Redirect pra `/login` sem sessão: confirmado
- Erro de signup (email inválido) aparece certo na tela: confirmado
- Signup com email real, login, trocar nome/senha, CRUD de categorias, isolamento por loja: **não testado ainda** — precisa do SQL rodado e de uma conta real (ver seção "Multi-loja" abaixo)

## Feature: Multi-loja (cada conta = uma loja) — implementada, precisa SQL + validação com parceiro

Decisão: virou multi-tenant de verdade. Cada conta (Supabase Auth) é uma loja separada, com **produtos, categorias e pedidos próprios**. Antes era um painel único e compartilhado — agora não é mais.

### ⚠️ Precisa rodar SQL manualmente primeiro

Não tenho permissão de DDL com a chave publishable. **SQL está em `sql/001_multi_loja.sql`** — rodar tudo de uma vez no SQL Editor do Supabase antes de usar qualquer coisa (login, categorias, produtos, pedidos vão quebrar sem isso). O arquivo:
- cria a tabela `categorias` (com `dono_id`)
- adiciona `dono_id` em `produtos` e `pedidos`
- configura RLS de tudo (ver detalhes no próprio arquivo, tem comentário explicando cada policy)
- tem uma query comentada no final pra você reivindicar (`dono_id`) os produtos que já existem (Pão de Queijo, Croissant) pra sua conta, depois de criar login

### Como funciona o isolamento

- **`produtos`/`categorias`**: toda leitura/escrita deste painel filtra por `dono_id = usuário logado`. RLS trava escrita (insert/update/delete) só pro dono; leitura de `produtos` fica aberta pra qualquer um (`select using (true)`) porque o **`cardapio-app` lê sem estar logado** (cliente não tem sessão Supabase Auth) — a policy não conseguiria diferenciar lojas sem uma info adicional vinda do `cardapio-app`.
- **`pedidos`**: mesma ideia, mas com uma pegadinha grande — ver abaixo.

### ⚠️⚠️ O `cardapio-app` PRECISA mudar — senão pedido novo fica "sem dono"

Quem cria pedido é o `cardapio-app`, sem login, e hoje ele **não sabe nada sobre `dono_id`/loja**. Até o parceiro atualizar o código dele pra mandar `dono_id` no insert de `pedidos` (e filtrar `produtos` por loja na hora de montar o cardápio do cliente), **todo pedido novo chega com `dono_id = null`**.

Pra não perder pedido nenhum enquanto isso não é resolvido, implementei um esquema paliativo:
- O kanban (`usePedidosRealtime.js`), Dashboard e afins mostram pedidos com `dono_id = null` **pra qualquer loja logada**, com uma tag amarela "Sem dono — avançar assume pra sua loja" no card (`PedidoCard.jsx`)
- Assim que alguém avança ou volta o status desse pedido, o código seta `dono_id` pro `auth.uid()` de quem clicou — a partir daí o pedido passa a pertencer só àquela loja
- RLS (`pedidos_update_own_or_unclaimed`) permite update se `dono_id = auth.uid() OU dono_id IS NULL`, mas exige que o resultado final tenha `dono_id = auth.uid()` — ou seja, só é possível reivindicar, nunca roubar pedido de loja já dona

**Isso é uma solução de curto prazo, não a solução real.** Se existir mais de uma loja usando o sistema ao mesmo tempo, um pedido "sem dono" aparece pra todas elas até uma clicar primeiro — não há isolamento de verdade nesse meio-tempo. **Precisa alinhar com quem mantém o `cardapio-app`** pra ele passar a mandar `dono_id` (ou algum identificador de loja) ao criar pedido, e filtrar `produtos` por loja ao montar o cardápio do cliente. Até lá, esse recurso só é seguro/coerente com **uma loja só usando o sistema**.

### Testado
Nada disso foi testado ainda no navegador — precisa do SQL rodado primeiro.

## Checklist / Próximos passos

- [x] Configurar cliente Supabase
- [x] Painel kanban (Recebido | Em preparo | Pronto)
- [x] Botão de avançar status por pedido
- [x] Realtime subscription na tabela `pedidos`
- [x] CRUD de produtos / página Cardápio (ver seção acima)
- [x] Página Dashboard v1 (ver seção acima — receita por período e horário de pico ficaram de fora)
- [x] Página Histórico (pedidos com status `entregue`)
- [x] Autenticação + página Configurações (ver seção acima)
- [x] Multi-loja: `dono_id` em produtos/categorias/pedidos + RLS (ver seção acima — falta rodar SQL, testar, e alinhar `cardapio-app`)
- [ ] Deploy na Vercel + configurar env vars

## Decisões em aberto (alinhar com o parceiro)

- **Urgente**: `cardapio-app` precisa passar a mandar `dono_id` ao criar pedido, e filtrar `produtos` por loja ao montar o cardápio do cliente — sem isso, multi-loja não funciona de verdade (ver seção "Multi-loja" acima)
- RLS de `produtos`/`pedidos` já está configurada pensando em multi-loja (ver `sql/001_multi_loja.sql`), mas o `cardapio-app` também escreve/lê essas tabelas sem login — confirmar com o parceiro se as policies abertas de leitura/insert fazem sentido pro fluxo dele

## Débito de estoque

Decidido: debita ao avançar `a_fazer` → `em_preparo` (não na criação do pedido). Implementado em `ajustarEstoque()` dentro de `src/hooks/usePedidosRealtime.js`.

- `avancarStatus`: debita a quantidade de cada item do pedido quando sai de `a_fazer` pra `em_preparo`
- `voltarStatus`: restaura o estoque se o pedido voltar de `em_preparo` pra `a_fazer`
- Implementação lê o estoque atual e escreve o novo valor (não é atômico/transação) — ok pra escala de um painel só, mas pode ter race condition se dois avanços simultâneos do mesmo produto acontecerem ao mesmo tempo
- Estoque nunca fica negativo (`Math.max(0, ...)`)


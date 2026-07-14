-- Multi-loja: cada conta (auth.users) vira uma loja separada.
-- Rodar tudo de uma vez no SQL Editor do Supabase.

-- 1. categorias (tabela nova, só deste painel)
create table categorias (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  created_at timestamptz not null default now(),
  unique (dono_id, nome)
);

alter table categorias enable row level security;

create policy "categorias_select_own" on categorias
  for select to authenticated using (dono_id = auth.uid());

create policy "categorias_insert_own" on categorias
  for insert to authenticated with check (dono_id = auth.uid());

create policy "categorias_update_own" on categorias
  for update to authenticated using (dono_id = auth.uid());

create policy "categorias_delete_own" on categorias
  for delete to authenticated using (dono_id = auth.uid());

-- 2. produtos: adiciona dono. Escrita só do dono autenticado;
--    leitura fica aberta (cardapio-app ainda lê sem login, até o parceiro
--    atualizar o código dele pra filtrar por loja).
alter table produtos add column dono_id uuid references auth.users(id);

alter table produtos enable row level security;

create policy "produtos_select_all" on produtos
  for select using (true);

create policy "produtos_insert_own" on produtos
  for insert to authenticated with check (dono_id = auth.uid());

create policy "produtos_update_own" on produtos
  for update to authenticated using (dono_id = auth.uid());

create policy "produtos_delete_own" on produtos
  for delete to authenticated using (dono_id = auth.uid());

-- 3. pedidos: adiciona dono. Leitura e criação continuam abertas
--    (cardapio-app cria pedido sem login e ainda não manda dono_id).
--    Só quem avança/volta status (autenticado) precisa ser dono —
--    e o próprio avanço "reivindica" o pedido (dono_id ainda nulo).
alter table pedidos add column dono_id uuid references auth.users(id);

alter table pedidos enable row level security;

create policy "pedidos_select_all" on pedidos
  for select using (true);

create policy "pedidos_insert_all" on pedidos
  for insert with check (true);

create policy "pedidos_update_own_or_unclaimed" on pedidos
  for update to authenticated
  using (dono_id = auth.uid() or dono_id is null)
  with check (dono_id = auth.uid());

-- 4. Reivindicar produtos já existentes (Pão de Queijo, Croissant etc.)
--    Troque SEU_USER_ID pelo id da sua conta (Supabase Dashboard ->
--    Authentication -> Users -> copiar o UUID), depois rode:
-- update produtos set dono_id = 'SEU_USER_ID' where dono_id is null;

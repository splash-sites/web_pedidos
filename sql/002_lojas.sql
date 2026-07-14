-- Tabela lojas: traduz um slug amigável (usado na URL do cardapio-app)
-- pro dono_id (uuid da conta) usado em produtos/pedidos.
-- Rodar depois de 001_multi_loja.sql.

create table lojas (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null unique references auth.users(id) on delete cascade,
  slug text not null unique,
  nome text not null,
  created_at timestamptz not null default now()
);

alter table lojas enable row level security;

-- leitura aberta: o cardapio-app resolve slug -> dono_id sem estar logado
create policy "lojas_select_all" on lojas
  for select using (true);

create policy "lojas_insert_own" on lojas
  for insert to authenticated with check (dono_id = auth.uid());

create policy "lojas_update_own" on lojas
  for update to authenticated using (dono_id = auth.uid());

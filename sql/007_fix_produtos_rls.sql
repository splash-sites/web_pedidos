-- Corrige RLS de produtos: testei um UPDATE sem estar logado (só com a
-- chave publishable) e funcionou, quando deveria ser bloqueado. Isso
-- significa que hoje qualquer um com a chave publishable consegue
-- criar/editar/apagar produtos de qualquer loja, não só ler.
--
-- Garante RLS ligado e recria as policies do zero (idempotente, seguro
-- rodar mesmo se já estiverem corretas).

alter table produtos enable row level security;

drop policy if exists "produtos_select_all" on produtos;
drop policy if exists "produtos_insert_own" on produtos;
drop policy if exists "produtos_update_own" on produtos;
drop policy if exists "produtos_delete_own" on produtos;

create policy "produtos_select_all" on produtos
  for select using (true);

create policy "produtos_insert_own" on produtos
  for insert to authenticated with check (dono_id = auth.uid());

create policy "produtos_update_own" on produtos
  for update to authenticated using (dono_id = auth.uid());

create policy "produtos_delete_own" on produtos
  for delete to authenticated using (dono_id = auth.uid());

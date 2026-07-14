-- Funcionários (atendentes): quem prepara cada pedido.
-- Só deste painel, cardapio-app não precisa saber disso.

create table funcionarios (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table funcionarios enable row level security;

create policy "funcionarios_select_own" on funcionarios
  for select to authenticated using (dono_id = auth.uid());

create policy "funcionarios_insert_own" on funcionarios
  for insert to authenticated with check (dono_id = auth.uid());

create policy "funcionarios_update_own" on funcionarios
  for update to authenticated using (dono_id = auth.uid());

create policy "funcionarios_delete_own" on funcionarios
  for delete to authenticated using (dono_id = auth.uid());

-- pedidos: quem está preparando (setado ao avançar pra em_preparo,
-- limpo se voltar pra a_fazer)
alter table pedidos add column if not exists funcionario_id uuid references funcionarios(id);

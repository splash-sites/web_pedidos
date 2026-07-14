-- Substitui pedidos.canal (criado em 003_canais_venda.sql) por modalidade,
-- alinhado com o schema que o cardapio-app já está usando. Coluna canal
-- estava vazia (nenhum pedido usava), seguro descartar.

alter table pedidos drop column if exists canal;

-- Suporte a dois fluxos de pedido: Cafeteria (consumo no local) e Delivery (entrega).
alter table pedidos
  add column if not exists modalidade text not null default 'cafeteria',
  add column if not exists nome text,
  add column if not exists cpf text,
  add column if not exists endereco_rua text,
  add column if not exists endereco_numero text,
  add column if not exists endereco_complemento text,
  add column if not exists endereco_bairro text;

alter table pedidos
  drop constraint if exists pedidos_modalidade_check;

alter table pedidos
  add constraint pedidos_modalidade_check check (modalidade in ('cafeteria', 'delivery'));

-- identificacao (mesa) continua sendo usado só para modalidade='cafeteria'.
-- Para modalidade='delivery', identificacao fica null e o endereço vem das colunas endereco_*.

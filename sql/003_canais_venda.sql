-- Canais de venda: Cafeteria e/ou Delivery.
-- Produto pode estar em 1 ou nos 2 canais.
--
-- ⚠️ A parte de `pedidos.canal` abaixo foi SUBSTITUÍDA por `pedidos.modalidade`
-- (+ campos de endereço), ver sql/004_modalidade_delivery.sql — esse é o
-- schema que ficou combinado com o cardapio-app. A parte de `produtos`
-- abaixo continua valendo.

alter table produtos
  add column disponivel_cafeteria boolean not null default true,
  add column disponivel_delivery boolean not null default true;

alter table pedidos
  add column canal text check (canal in ('cafeteria', 'delivery'));

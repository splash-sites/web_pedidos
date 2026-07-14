-- WhatsApp da loja, usado pelo cardapio-app pra montar o link wa.me
-- no final do pedido (redireciona o cliente pra confirmar/pagar).

alter table lojas add column if not exists whatsapp text;

# Estetcar Guincho & Estética

Site institucional e agenda de transportes na Região Carbonífera.

## Vercel e Neon

1. Aplique os arquivos SQL de `db/` em ordem no PostgreSQL.
2. Na Vercel, configure `DATABASE_URL` e um `ADMIN_SESSION_SECRET` aleatório de pelo menos 32 caracteres como variáveis sensíveis.
3. Para testar sem transferência, configure `ADMIN_TEST_PASSWORD` e `ADMIN_TEST_UNTIL` (data ISO 8601), implante e entre em `/admin`.

## Entregar ao comprador

Quando a venda for confirmada, defina `ADMIN_MODE=handoff` e configure `ADMIN_HANDOFF_PASSWORD` como uma senha temporária inédita de pelo menos 16 caracteres, diferente da senha de teste. Implante a versão de produção e entregue essa credencial por um canal privado ao comprador.

O primeiro login no modo de entrega exige uma nova senha antes de liberar a agenda. Ao concluir a troca, a senha inicial de entrega e as sessões anteriores perdem a validade. A senha definitiva fica armazenada no Neon em formato de hash.
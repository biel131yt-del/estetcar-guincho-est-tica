# Estetcar Guincho & Estética

Site institucional em português e agenda de transportes para a Região Carbonífera. O formulário salva a solicitação na agenda e oferece o WhatsApp para acompanhamento. A equipe confirma a disponibilidade.

## Desenvolvimento

1. Use Node.js 22.13 ou superior.
2. Execute `npm install`.
3. Aplique a migration local com `npx wrangler d1 migrations apply DB --local`.
4. Execute `npm run dev`. O build de produção é `npm run build`. A API da agenda pode ser testada com `npm run test:agenda` no Node 22.13 ou superior.

## Administração no Sites

- A agenda usa D1, com binding `DB` e schema em `drizzle/0000_bookings.sql`.
- Configure `ADMIN_EMAIL` no ambiente do Sites com o e-mail da conta ChatGPT responsável pela agenda. O Worker valida a identidade fornecida pelo Sites e o e-mail a cada operação administrativa.
- Acesse `/admin` no endereço publicado. O painel lista solicitações, permite filtrar por status, cadastrar pedidos manuais e registrar observações internas.
- A autorização usa os cabeçalhos autenticados da plataforma Sites. Ao implantar fora do Sites, substitua essa integração por uma autenticação verificada antes de expor as rotas administrativas. No Worker local, a ausência de `ADMIN_EMAIL` bloqueia o painel.
- A migration original em PostgreSQL foi substituída pelo schema D1 para esta implantação. Qualquer base anterior exige migração de dados explícita.

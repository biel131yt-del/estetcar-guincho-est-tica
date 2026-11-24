# Estetcar Guincho & Estética

Site institucional e agenda de transportes na Região Carbonífera.

## Vercel

- O servidor usa TanStack Start com Nitro. Instale com `npm install` e compile com `npm run build`.
- Aplique `db/001-bookings.sql` ao PostgreSQL e configure `DATABASE_URL` como variável sensível em produção.
- Configure a variável sensível `ADMIN_PASSWORD` com uma senha aleatória de pelo menos 24 caracteres. Faça uma nova implantação para aplicar a alteração.
- A equipe abre `/admin` diretamente e entra com usuário `admin`. O servidor exige a mesma credencial nas rotas administrativas da API. O painel fica indisponível até a senha ser configurada.
- O formulário público registra o pedido e oferece uma conversa pré-preenchida pelo WhatsApp.
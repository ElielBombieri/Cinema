# Cinema API

API do cinema em Node.js, Express e PostgreSQL. Cuida de login, catálogo, sessões, reservas, venda de ingressos e relatório da bilheteria.

O app em `../frontend` consome esta API. Suba o banco e a API antes de abrir o aplicativo.

## Requisitos

- Node.js com npm
- Docker, para o PostgreSQL

## Como iniciar

Na raiz do projeto (`Cinema`), suba o banco:

```powershell
docker compose up -d
```

O Postgres fica em `localhost:5432`, com usuário `cinema`, senha `cinema` e banco `cinema`.

Na pasta `backend`:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npx prisma migrate deploy
npx prisma generate
npm run popular
npm run dev
```

A API escuta em [http://localhost:3000](http://localhost:3000). A rota `GET /` responde `{ "ok": true }`.

`npm run popular` cria usuários, filmes, a Sala 1 e duas sessões do dia seguinte. Se o catálogo já existir, o comando só garante os usuários de exemplo.

| Papel | E-mail | Senha |
| --- | --- | --- |
| Cliente | `cliente@cinema.local` | `cliente123` |
| Operador | `operador@cinema.local` | `operador123` |

O cadastro público (`POST /auth/registrar`) sempre cria um cliente. O operador de exemplo só entra pelo script acima.

## Variáveis de ambiente

Copie `.env.example` para `.env`.

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão do Prisma com o Postgres |
| `JWT_SECRET` | Assinatura do token. Troque o valor de exemplo antes de usar fora da máquina local |
| `PORT` | Porta da API. O padrão é `3000` |
| `FRONTEND_ORIGIN` | Origem exata liberada no CORS. O padrão é `http://localhost:8081`, que é a web do Expo |

O token vale 8 horas e vai no cabeçalho `Authorization: Bearer <token>`. Erros de regra voltam como `{ "erro": "mensagem" }`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe a API com `tsx` |
| `npm run popular` | Insere os dados de exemplo |
| `npm run typecheck` | Confere os tipos sem gerar arquivos |
| `npx prisma migrate deploy` | Aplica as migrations já existentes |
| `npx prisma generate` | Gera o client em `generated/prisma` |

## Endpoints

Rotas depois de `/auth/registrar` e `/auth/login` exigem token.

| Método | Rota | Quem | Corpo |
| --- | --- | --- | --- |
| `POST` | `/auth/registrar` | público | `{ nome, email, senha }` — senha com pelo menos 6 caracteres |
| `POST` | `/auth/login` | público | `{ email, senha }` |
| `GET` | `/auth/eu` | autenticado | — |
| `GET` | `/filmes` | autenticado | — |
| `POST` | `/filmes` | operador | `{ titulo, sinopse, duracaoMinutos }` |
| `GET` | `/salas` | autenticado | — |
| `POST` | `/salas` | operador | `{ nome, filas, assentosPorFila }` — até 26 filas (A–Z) e 30 assentos por fila |
| `GET` | `/sessoes` | autenticado | — |
| `GET` | `/sessoes/:id` | autenticado | mapa da sessão; cada assento diz se é `LIVRE`, `RESERVADO` ou `VENDIDO` |
| `POST` | `/sessoes` | operador | `{ filmeId, salaId, inicio, preco }` — `inicio` no formato `AAAA-MM-DD HH:MM` |
| `GET` | `/reservas/minhas` | cliente | — |
| `POST` | `/reservas` | cliente | `{ sessaoId, assentos: [{ fila, numero }] }` |
| `POST` | `/reservas/:id/pagar` | cliente | emite os ingressos da reserva aberta |
| `POST` | `/vendas` | operador | `{ email, sessaoId, assentos }` — venda no balcão para um cliente já cadastrado |
| `GET` | `/ingressos/meus` | cliente | — |
| `POST` | `/ingressos/validar` | operador | `{ codigo }` — marca o ingresso como utilizado |
| `GET` | `/relatorios/vendas` | operador | ocupação e total vendido por sessão |

Uma reserva fica aberta por 10 minutos. Depois disso, a próxima consulta libera os assentos. O pagamento é simulado: pagar a reserva, ou vender no balcão, emite o código do ingresso na hora. Um assento já vendido não volta a ficar livre ou reservado.

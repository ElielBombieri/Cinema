# Cinema

Aplicativo do cinema em Expo e React Native, com Expo Router. O mesmo app abre no navegador, no Android e no iOS.

Ele fala com a API em `../backend`. Deixe o Postgres e a API rodando antes de usar as telas. O passo a passo da API está em `../backend/README.md`.

## Requisitos

- Node.js com npm
- A API em [http://localhost:3000](http://localhost:3000)
- Para celular: Expo Go, ou um emulador Android / simulador iOS

## Como iniciar

Na pasta `frontend`:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm start
```

O Expo abre o menu do projeto. Atalhos úteis:

| Tecla | Abre em |
| --- | --- |
| `w` | navegador, em geral em [http://localhost:8081](http://localhost:8081) |
| `a` | Android |
| `i` | iOS |

Também dá para ir direto:

```powershell
npm run web
npm run android
npm run ios
```

`npm run tsc` só confere os tipos.

## Ligação com a API

O arquivo `.env` define a URL da API:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

No navegador da mesma máquina, esse valor funciona junto com `FRONTEND_ORIGIN=http://localhost:8081` no `.env` do backend. Se o Expo subir em outra porta, use essa origem no `FRONTEND_ORIGIN` e reinicie a API.

No emulador Android, `localhost` é o próprio emulador. Use `http://10.0.2.2:3000`. No celular físico, use o IP da máquina na rede, por exemplo `http://192.168.0.10:3000`, e reinicie o Expo depois de mudar o `.env`.

O login devolve um token. No celular ele fica no armazenamento seguro do aparelho. No navegador fica no `sessionStorage` e some quando a aba fecha. O token vale 8 horas.

## Contas de exemplo

Elas existem depois de `npm run popular` no backend.

| Papel | E-mail | Senha |
| --- | --- | --- |
| Cliente | `cliente@cinema.local` | `cliente123` |
| Operador | `operador@cinema.local` | `operador123` |

**Criar conta** na tela de entrada cadastra um cliente e já entra no app. O operador não se cadastra por essa tela.

## Como usar

Ao entrar, o app manda o cliente para as sessões e o operador para a bilheteria.

### Cliente

1. Na lista de sessões, abra um filme.
2. Toque nos assentos livres e confirme a reserva. Ela vale 10 minutos.
3. Pague na própria tela do mapa, ou depois em **Minhas reservas**. O pagamento é simulado e devolve o código de cada ingresso.
4. **Meus ingressos** mostra os códigos emitidos, inclusive os vendidos no balcão para o seu e-mail.

### Operador

Na bilheteria:

- **Vender no balcão** escolhe a sessão e os assentos e informa o e-mail de um cliente já cadastrado. A venda emite os ingressos na hora.
- **Validar ingresso** recebe o código e marca o ingresso como utilizado.
- **Cadastrar filme** pede título, sinopse e duração em minutos.
- **Cadastrar sala** pede nome, quantidade de filas e assentos por fila. As filas saem de A em diante, com no máximo 26 filas e 30 assentos por fila.
- **Cadastrar sessão** escolhe um filme e uma sala já existentes. A data e a hora são escolhidas no mesmo campo de calendário. O app impede sessões sobrepostas na mesma sala e exige pelo menos 1 minuto entre o fim de um filme e o início do próximo. O preço é por assento.
- **Relatório de vendas** mostra, por sessão, lugares livres, reservados e vendidos, a ocupação e o total vendido.

O catálogo de exemplo traz os filmes *O Farol* e *Noite na Cidade*, a Sala 1 (filas A–C, cinco assentos) e duas sessões no dia seguinte.

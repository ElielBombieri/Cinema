# Rotina de testes do Cinema

Roteiro manual de aceitação baseado nos requisitos do Trabalho Final de Programação II e Banco de Dados II. Execute primeiro em ambiente local e banco de desenvolvimento. Não use a rotina de limpeza em produção.

## 1. Preparação

Na raiz do projeto, inicie o PostgreSQL e aguarde o estado `healthy`:

```powershell
docker compose up -d --wait
docker compose ps
```

No diretório `backend`, aplique as migrations, gere o Prisma Client, popule os dados e inicie a API:

```powershell
npx prisma migrate deploy
npx prisma generate
npm run popular
npm run dev
```

Confirme `GET http://localhost:3000/` retorna `{ "ok": true }`. Em outra janela PowerShell, configure a URL e autentique os dois papéis:

```powershell
$api = 'http://localhost:3000'
$cliente = Invoke-RestMethod "$api/auth/login" -Method Post -ContentType 'application/json' -Body '{"email":"cliente@cinema.local","senha":"cliente123"}'
$operador = Invoke-RestMethod "$api/auth/login" -Method Post -ContentType 'application/json' -Body '{"email":"operador@cinema.local","senha":"operador123"}'
$hCliente = @{ Authorization = "Bearer $($cliente.accessToken)" }
$hOperador = @{ Authorization = "Bearer $($operador.accessToken)" }
```

Use uma sessão futura de teste e anote seu `id` e os assentos livres. Evite reutilizar assentos que já tenham ingressos emitidos. Para testes repetíveis, crie uma nova sessão/sala por meio da interface do operador ou use uma cópia local limpa do banco.

## 2. Casos funcionais e de segurança

| ID | Ação | Resultado esperado |
| --- | --- | --- |
| AUTH-01 | Login com e-mail/senha válidos do cliente e do operador | HTTP 200; cada token identifica o papel correto; `GET /auth/eu` retorna o usuário autenticado. |
| AUTH-02 | Login com senha incorreta | HTTP 401, sem token e sem revelar se o e-mail existe. |
| AUTH-03 | Chamar endpoint protegido sem token ou com token inválido | HTTP 401. |
| AUTH-04 | Cliente tentar cadastrar filme, vender no balcão, validar ingresso ou consultar relatório | HTTP 403; nenhuma alteração no banco. |
| AUTH-05 | Operador tentar reservar/pagar como cliente | HTTP 403. |
| CAD-01 | Operador cadastrar filme, sala e sessão usando apenas campos editáveis da tela | Cadastro aparece nas listagens; assentos da sala são criados para a sessão. A tela não deve pedir IDs ou totalizadores. |
| CAD-02 | Tentar cadastrar sala com nome repetido, dimensões inválidas ou sessão duplicada para sala/horário | Resposta de validação/conflito; nenhum registro parcial. |
| CAD-03 | Cadastrar sessão na mesma sala antes do fim de um filme existente | HTTP 409 com horário em que a sessão em andamento termina. |
| CAD-04 | Cadastrar sessão exatamente no fim da sessão anterior ou com menos de 1 minuto de intervalo | HTTP 409 informando que é necessário aguardar 1 minuto. |
| CAD-05 | Cadastrar sessão quando há intervalo de pelo menos 1 minuto, considerando a duração de cada filme | Cadastro permitido; sessão não se sobrepõe à anterior ou à próxima. |
| MAP-01 | Cliente abrir uma sessão | Mapa exibe cada assento como `LIVRE`, `RESERVADO` ou `VENDIDO`, de acordo com o estado no banco. |
| RES-01 | Cliente reservar um ou mais assentos livres | HTTP 201; reserva `ABERTA`, assentos `RESERVADO`, vencimento em aproximadamente 10 minutos e total calculado pela API. |
| RES-02 | Cliente reservar assento já reservado ou vendido | HTTP 409; não cria reserva para os assentos ocupados. |
| RES-03 | Enviar sessão inexistente, assento inexistente, lista vazia ou payload inválido | Erro 4xx; não cria reserva nem altera o mapa. |
| RES-04 | Outro cliente tentar pagar a reserva | HTTP 403; reserva e assentos permanecem inalterados. |
| PAG-01 | Dono pagar reserva ainda válida | Emite um ingresso por assento, cada um com código único; reserva `PAGA`; assentos `VENDIDO`. |
| PAG-02 | Tentar pagar novamente a mesma reserva | HTTP 409; nenhum ingresso duplicado. |
| EXP-01 | Deixar uma reserva vencer e consultar o mapa/lista de reservas | Reserva passa a `EXPIRADA`; assentos voltam a `LIVRE` e podem ser reservados por outro cliente. |
| EXP-02 | Tentar pagar uma reserva vencida | HTTP 409; nenhum ingresso emitido. |
| BAL-01 | Operador vender assentos livres para cliente cadastrado | Emite ingressos únicos imediatamente e marca assentos vendidos. |
| BAL-02 | Operador vender para e-mail inexistente ou assento ocupado | HTTP 404 ou 409; sem venda parcial. |
| ING-01 | Operador validar ingresso válido | Primeira validação é aceita e grava `utilizadoEm`; validar novamente informa que já foi usado. |
| ING-02 | Cliente tentar validar ingresso ou operador acessar ingressos pessoais | HTTP 403. |
| REL-01 | Operador consultar relatório de vendas | Uma linha por sessão, com capacidade, livres, reservados, vendidos, percentual ocupado e total de vendas coerentes com os ingressos. |
| REL-02 | Cliente consultar relatório | HTTP 403. |

## 3. Concorrência e transação

Abra duas sessões de navegador ou use dois tokens de cliente. Escolha o mesmo assento livre e envie as duas reservas quase ao mesmo tempo. Repita cinco vezes em uma sessão de teste nova.

**Aprovação:** apenas uma reserva é confirmada; a outra recebe conflito; existe no máximo um assento de sessão reservado/vendido e, após pagamento, exatamente um ingresso para ele. Repita a disputa entre uma reserva de cliente e uma venda de operador. Uma falha no meio do pagamento não pode deixar metade dos assentos vendidos ou ingressos emitidos.

## 4. Integridade, migrations e SQL

No banco de desenvolvimento, valide as restrições e os artefatos SQL:

1. `npx prisma migrate status` informa que não há migrations pendentes.
2. Confira no schema/migration as PKs, FKs, índices e unicidades: e-mail, nome de sala, assento por sala/fila/número, assento por sessão, código do ingresso e ingresso por assento de sessão.
3. Tente inserir diretamente uma segunda associação do mesmo assento à mesma sessão e um ingresso duplicado para o mesmo assento de sessão. O PostgreSQL deve rejeitar ambos por constraint única.
4. Com um ingresso de teste emitido, tente mudar seu `AssentoSessao.status` de `VENDIDO` para `LIVRE`. A trigger `trg_impedir_alterar_assento_vendido` deve rejeitar o `UPDATE`.
5. Confira que `/relatorios/vendas` agrega filme, sala, sessão, assentos e ingressos e que os totais batem com os registros de teste.
6. Teste restauração de migration somente em banco descartável: crie um banco vazio, execute `npx prisma migrate deploy`, depois `npm run popular` e repita `migrate status`.

**Ponto do enunciado a completar:** atualmente a migration cria a trigger e a função SQL `relatorio_vendas()`, mas não cria uma `PROCEDURE` PostgreSQL. Portanto, o item “stored procedure” do PDF não pode ser marcado como aprovado apenas com essa função; confirme com o professor se a função que retorna linhas é aceita ou implemente uma procedure antes da entrega.

## 5. Interface e apresentação

Faça o fluxo completo nas telas, tanto como cliente quanto como operador: autenticar, selecionar sessão/assento, reservar, pagar, exibir ingresso, vender no balcão, validar na entrada, consultar relatório e sair. Confirme mensagens compreensíveis para erro, carregamento e sucesso; campos exigem somente dados que o usuário deve informar; token, senha hash e segredos não aparecem na interface ou nas respostas.

## 6. Registro dos resultados

Para cada caso, anote `Aprovado`, `Reprovado` ou `Não executado`, data, ambiente, responsável e evidência (captura de tela ou resposta HTTP sem tokens/segredos). Bloqueiam a apresentação: falha de login, assento duplicado, reserva vencida que não libera o lugar, ingresso repetido, autorização incorreta, migration pendente ou relatório inconsistente.

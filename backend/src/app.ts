import express, { type NextFunction, type Request, type Response } from "express";
import { authRouter } from "./controllers/authController.js";
import { filmesRouter } from "./controllers/filmeController.js";
import { ingressosRouter } from "./controllers/ingressoController.js";
import { relatoriosRouter } from "./controllers/relatorioController.js";
import { reservasRouter, vendasRouter } from "./controllers/reservaController.js";
import { salasRouter } from "./controllers/salaController.js";
import { sessoesRouter } from "./controllers/sessaoController.js";
import { ErroRegra } from "./erros.js";

export const app = express();

app.use((req, res, next) => {
  const origensPermitidas = (process.env.FRONTEND_ORIGIN ?? "http://localhost:8081")
    .split(",")
    .map((origem) => origem.trim())
    .filter(Boolean);
  const origem = req.header("origin");
  res.setHeader("Vary", "Origin");
  if (origem && origensPermitidas.includes(origem)) {
    res.setHeader("Access-Control-Allow-Origin", origem);
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/filmes", filmesRouter);
app.use("/salas", salasRouter);
app.use("/sessoes", sessoesRouter);
app.use("/reservas", reservasRouter);
app.use("/vendas", vendasRouter);
app.use("/ingressos", ingressosRouter);
app.use("/relatorios", relatoriosRouter);

app.use((_req, res) => {
  res.status(404).json({ erro: "Esta opção não está disponível." });
});

app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (erro instanceof ErroRegra) {
    res.status(erro.status).json({ erro: erro.message });
    return;
  }
  console.error(erro);

  const codigo =
    typeof erro === "object" && erro !== null && "code" in erro && typeof erro.code === "string"
      ? erro.code
      : "";
  const statusDeclarado =
    typeof erro === "object" && erro !== null && "status" in erro && typeof erro.status === "number"
      ? erro.status
      : 500;

  if (codigo === "P2002") {
    res.status(409).json({ erro: "Já existe um cadastro com esses dados." });
    return;
  }
  if (codigo === "P2003") {
    res.status(400).json({ erro: "Não foi possível concluir porque há dados relacionados inválidos." });
    return;
  }
  if (codigo === "P2025") {
    res.status(404).json({ erro: "O item solicitado não foi encontrado ou já foi removido." });
    return;
  }
  if (codigo === "P1000" || codigo === "P1001") {
    res.status(503).json({ erro: "O serviço está temporariamente indisponível. Tente novamente em instantes." });
    return;
  }
  if (statusDeclarado === 400) {
    res.status(400).json({ erro: "Os dados enviados não puderam ser entendidos. Confira os campos e tente novamente." });
    return;
  }
  if (statusDeclarado === 413) {
    res.status(413).json({ erro: "Os dados enviados são muito grandes. Reduza as informações e tente novamente." });
    return;
  }
  res.status(500).json({ erro: "Não foi possível concluir a operação agora. Tente novamente em instantes." });
});

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
  const origemPermitida = process.env.FRONTEND_ORIGIN ?? "http://localhost:8081";
  const origem = req.header("origin");
  if (origem === origemPermitida) {
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

app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (erro instanceof ErroRegra) {
    res.status(erro.status).json({ erro: erro.message });
    return;
  }
  console.error(erro);
  res.status(500).json({ erro: "Erro interno" });
});

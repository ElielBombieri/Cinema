import { Router } from "express";
import { autenticar, exigirOperador, exigirUsuario } from "../middleware/autenticar.js";
import * as relatorioService from "../services/relatorioService.js";

export const relatoriosRouter = Router();

relatoriosRouter.use(autenticar);

relatoriosRouter.get("/vendas", async (req, res) => {
  exigirOperador(exigirUsuario(req));
  res.json(await relatorioService.vendas());
});

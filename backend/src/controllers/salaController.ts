import { Router } from "express";
import { inteiroPositivo } from "../erros.js";
import { autenticar, exigirOperador, exigirUsuario } from "../middleware/autenticar.js";
import * as salaService from "../services/salaService.js";

export const salasRouter = Router();

salasRouter.use(autenticar);

salasRouter.get("/", async (_req, res) => {
  res.json(await salaService.listar());
});

salasRouter.post("/", async (req, res) => {
  exigirOperador(exigirUsuario(req));
  res.status(201).json(await salaService.criar(req.body));
});

salasRouter.put("/:id", async (req, res) => {
  exigirOperador(exigirUsuario(req));
  res.json(await salaService.atualizar(inteiroPositivo(req.params.id, "A sala"), req.body));
});

salasRouter.delete("/:id", async (req, res) => {
  exigirOperador(exigirUsuario(req));
  await salaService.excluir(inteiroPositivo(req.params.id, "A sala"));
  res.sendStatus(204);
});

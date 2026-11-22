import { Router } from "express";
import { inteiroPositivo } from "../erros.js";
import { autenticar, exigirOperador, exigirUsuario } from "../middleware/autenticar.js";
import * as sessaoService from "../services/sessaoService.js";

export const sessoesRouter = Router();

sessoesRouter.use(autenticar);

sessoesRouter.get("/", async (_req, res) => {
  res.json(await sessaoService.listar());
});

sessoesRouter.get("/:id", async (req, res) => {
  const usuario = exigirUsuario(req);
  const id = inteiroPositivo(req.params.id, "A sessão");
  res.json(await sessaoService.mapa(id, usuario.id));
});

sessoesRouter.post("/", async (req, res) => {
  exigirOperador(exigirUsuario(req));
  res.status(201).json(await sessaoService.criar(req.body));
});

sessoesRouter.put("/:id", async (req, res) => {
  exigirOperador(exigirUsuario(req));
  const id = inteiroPositivo(req.params.id, "A sessão");
  res.json(await sessaoService.atualizar(id, req.body));
});

sessoesRouter.delete("/:id", async (req, res) => {
  exigirOperador(exigirUsuario(req));
  const id = inteiroPositivo(req.params.id, "A sessão");
  await sessaoService.excluir(id);
  res.sendStatus(204);
});

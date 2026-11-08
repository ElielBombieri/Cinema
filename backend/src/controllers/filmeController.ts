import { Router } from "express";
import { autenticar, exigirOperador, exigirUsuario } from "../middleware/autenticar.js";
import * as filmeService from "../services/filmeService.js";

export const filmesRouter = Router();

filmesRouter.use(autenticar);

filmesRouter.get("/", async (_req, res) => {
  res.json(await filmeService.listar());
});

filmesRouter.post("/", async (req, res) => {
  exigirOperador(exigirUsuario(req));
  res.status(201).json(await filmeService.criar(req.body));
});

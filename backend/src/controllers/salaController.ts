import { Router } from "express";
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

import { Router } from "express";
import { autenticar, exigirCliente, exigirOperador, exigirUsuario } from "../middleware/autenticar.js";
import * as ingressoService from "../services/ingressoService.js";

export const ingressosRouter = Router();

ingressosRouter.use(autenticar);

ingressosRouter.get("/meus", async (req, res) => {
  const usuario = exigirUsuario(req);
  exigirCliente(usuario);
  res.json(await ingressoService.listarDoUsuario(usuario.id));
});

ingressosRouter.post("/validar", async (req, res) => {
  exigirOperador(exigirUsuario(req));
  res.json(await ingressoService.validar(req.body));
});

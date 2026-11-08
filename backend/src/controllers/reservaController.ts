import { Router } from "express";
import { inteiroPositivo } from "../erros.js";
import { autenticar, exigirCliente, exigirOperador, exigirUsuario } from "../middleware/autenticar.js";
import * as reservaService from "../services/reservaService.js";

export const reservasRouter = Router();
export const vendasRouter = Router();

reservasRouter.use(autenticar);

reservasRouter.get("/minhas", async (req, res) => {
  const usuario = exigirUsuario(req);
  exigirCliente(usuario);
  res.json(await reservaService.listarDoUsuario(usuario.id));
});

reservasRouter.post("/", async (req, res) => {
  const usuario = exigirUsuario(req);
  exigirCliente(usuario);
  res.status(201).json(await reservaService.reservar(usuario.id, req.body));
});

reservasRouter.post("/:id/pagar", async (req, res) => {
  const usuario = exigirUsuario(req);
  exigirCliente(usuario);
  const id = inteiroPositivo(req.params.id, "A reserva");
  res.json(await reservaService.pagar(usuario.id, id));
});

vendasRouter.use(autenticar);

vendasRouter.post("/", async (req, res) => {
  exigirOperador(exigirUsuario(req));
  res.status(201).json(await reservaService.venderNoBalcao(req.body));
});

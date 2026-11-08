import { Router } from "express";
import { autenticar, exigirUsuario } from "../middleware/autenticar.js";
import * as authService from "../services/authService.js";

export const authRouter = Router();

authRouter.post("/registrar", async (req, res) => {
  const resultado = await authService.registrar(req.body);
  res.status(201).json(resultado);
});

authRouter.post("/login", async (req, res) => {
  res.json(await authService.entrar(req.body));
});

authRouter.get("/eu", autenticar, async (req, res) => {
  const usuario = exigirUsuario(req);
  res.json(await authService.eu(usuario.id));
});

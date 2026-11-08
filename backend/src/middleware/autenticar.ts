import type { NextFunction, Request, Response } from "express";
import { ErroRegra } from "../erros.js";
import { lerToken } from "../services/authService.js";

export type UsuarioLogado = { id: number; papel: "CLIENTE" | "OPERADOR" };

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioLogado;
    }
  }
}

export function autenticar(req: Request, _res: Response, next: NextFunction): void {
  req.usuario = lerToken(req.header("authorization"));
  next();
}

export function exigirUsuario(req: Request): UsuarioLogado {
  if (!req.usuario) throw new ErroRegra("Faça login para continuar", 401);
  return req.usuario;
}

export function exigirOperador(usuario: UsuarioLogado): void {
  if (usuario.papel !== "OPERADOR") {
    throw new ErroRegra("Apenas a bilheteria pode fazer esta operação", 403);
  }
}

export function exigirCliente(usuario: UsuarioLogado): void {
  if (usuario.papel !== "CLIENTE") {
    throw new ErroRegra("Esta operação é do cliente", 403);
  }
}

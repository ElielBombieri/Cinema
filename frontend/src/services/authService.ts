import type { Usuario } from "../models/cinema";
import { api } from "./api";

type UsuarioApi = Usuario & { id: number };

type RespostaAuth = {
  accessToken: string;
  usuario: UsuarioApi;
};

export function publico(usuario: UsuarioApi): Usuario {
  return {
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
  };
}

export function registrar(nome: string, email: string, senha: string): Promise<RespostaAuth> {
  return api<RespostaAuth>("/auth/registrar", {
    method: "POST",
    corpo: { nome, email, senha },
  });
}

export function entrar(email: string, senha: string): Promise<RespostaAuth> {
  return api<RespostaAuth>("/auth/login", {
    method: "POST",
    corpo: { email, senha },
  });
}

export async function eu(token: string): Promise<Usuario> {
  const usuario = await api<UsuarioApi>("/auth/eu", { token });
  return publico(usuario);
}

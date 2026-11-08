import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { emailValido, ErroRegra, textoObrigatorio } from "../erros.js";
import * as usuarioRepositorio from "../repositorios/usuario.js";

const RODADAS = 10;

export type UsuarioPublico = {
  id: number;
  nome: string;
  email: string;
  papel: "CLIENTE" | "OPERADOR";
};

function segredo(): string {
  const valor = process.env.JWT_SECRET;
  if (!valor) throw new Error("Defina JWT_SECRET no arquivo .env");
  return valor;
}

function publico(usuario: { id: number; nome: string; email: string; papel: "CLIENTE" | "OPERADOR" }): UsuarioPublico {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel };
}

function tokenDe(usuario: UsuarioPublico): string {
  return jwt.sign({ sub: String(usuario.id), papel: usuario.papel }, segredo(), { expiresIn: "8h" });
}

export async function registrar(corpo: unknown): Promise<{ accessToken: string; usuario: UsuarioPublico }> {
  if (typeof corpo !== "object" || corpo === null) throw new ErroRegra("Dados inválidos");
  const dados = corpo as { nome?: unknown; email?: unknown; senha?: unknown };
  const nome = textoObrigatorio(dados.nome, "o nome");
  const email = emailValido(dados.email);
  const senha = textoObrigatorio(dados.senha, "a senha");
  if (senha.length < 6) throw new ErroRegra("A senha deve ter pelo menos 6 caracteres");

  const existente = await usuarioRepositorio.buscarPorEmail(email);
  if (existente) throw new ErroRegra("Já existe um usuário com este e-mail", 409);

  const senhaHash = await bcrypt.hash(senha, RODADAS);
  const usuario = await usuarioRepositorio.criar({ nome, email, senhaHash, papel: "CLIENTE" });
  const visivel = publico(usuario);
  return { accessToken: tokenDe(visivel), usuario: visivel };
}

export async function entrar(corpo: unknown): Promise<{ accessToken: string; usuario: UsuarioPublico }> {
  if (typeof corpo !== "object" || corpo === null) throw new ErroRegra("Dados inválidos");
  const dados = corpo as { email?: unknown; senha?: unknown };
  const email = emailValido(dados.email);
  const senha = textoObrigatorio(dados.senha, "a senha");

  const usuario = await usuarioRepositorio.buscarPorEmail(email);
  if (!usuario) throw new ErroRegra("E-mail ou senha inválidos", 401);
  const confere = await bcrypt.compare(senha, usuario.senhaHash);
  if (!confere) throw new ErroRegra("E-mail ou senha inválidos", 401);

  const visivel = publico(usuario);
  return { accessToken: tokenDe(visivel), usuario: visivel };
}

export async function eu(id: number): Promise<UsuarioPublico> {
  const usuario = await usuarioRepositorio.buscarPorId(id);
  if (!usuario) throw new ErroRegra("Usuário não encontrado", 401);
  return publico(usuario);
}

export function lerToken(authorization: string | undefined): { id: number; papel: "CLIENTE" | "OPERADOR" } {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new ErroRegra("Faça login para continuar", 401);
  }
  const token = authorization.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, segredo());
    if (typeof payload === "string" || payload.sub === undefined) {
      throw new ErroRegra("Token inválido", 401);
    }
    const id = Number(payload.sub);
    const papel = payload.papel;
    if (!Number.isInteger(id) || (papel !== "CLIENTE" && papel !== "OPERADOR")) {
      throw new ErroRegra("Token inválido", 401);
    }
    return { id, papel };
  } catch (erro) {
    if (erro instanceof ErroRegra) throw erro;
    throw new ErroRegra("Token inválido", 401);
  }
}

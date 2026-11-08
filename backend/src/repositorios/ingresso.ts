import { randomBytes } from "node:crypto";
import { prisma } from "../prisma.js";
import { ErroRegra } from "../erros.js";
import type { Db } from "./db.js";

export async function codigoLivre(db: Db = prisma): Promise<string> {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = randomBytes(4).toString("hex").toUpperCase();
    const existe = await db.ingresso.findUnique({ where: { codigo } });
    if (!existe) return codigo;
  }
  throw new ErroRegra("Não foi possível gerar o código do ingresso", 500);
}

export function criar(
  dados: {
    codigo: string;
    reservaId: number;
    assentoSessaoId: number;
    usuarioId: number;
    sessaoId: number;
    valor: string;
  },
  db: Db = prisma,
) {
  return db.ingresso.create({ data: dados });
}

export function marcarAssentoVendido(id: number, db: Db = prisma) {
  return db.assentoSessao.update({
    where: { id },
    data: { status: "VENDIDO", reservaExpiraEm: null },
  });
}

export function buscarPorCodigo(codigo: string, db: Db = prisma) {
  return db.ingresso.findUnique({
    where: { codigo },
    include: {
      sessao: { include: { filme: true, sala: true } },
      assentoSessao: { include: { assento: true } },
      usuario: true,
    },
  });
}

export function listarDoUsuario(usuarioId: number, db: Db = prisma) {
  return db.ingresso.findMany({
    where: { usuarioId },
    include: {
      sessao: { include: { filme: true, sala: true } },
      assentoSessao: { include: { assento: true } },
    },
    orderBy: { emitidoEm: "desc" },
  });
}

export function marcarUtilizado(id: number, quando: Date, db: Db = prisma) {
  return db.ingresso.update({ where: { id }, data: { utilizadoEm: quando } });
}

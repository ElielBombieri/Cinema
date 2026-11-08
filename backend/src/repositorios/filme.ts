import { prisma } from "../prisma.js";
import type { Db } from "./db.js";

export function listar(db: Db = prisma) {
  return db.filme.findMany({ orderBy: { titulo: "asc" } });
}

export function buscarPorId(id: number, db: Db = prisma) {
  return db.filme.findUnique({ where: { id } });
}

export function criar(
  dados: { titulo: string; sinopse: string; duracaoMinutos: number },
  db: Db = prisma,
) {
  return db.filme.create({ data: dados });
}

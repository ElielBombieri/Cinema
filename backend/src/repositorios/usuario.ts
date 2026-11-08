import type { Papel } from "../../generated/prisma/client.js";
import { prisma } from "../prisma.js";
import type { Db } from "./db.js";

export function buscarPorEmail(email: string, db: Db = prisma) {
  return db.usuario.findUnique({ where: { email } });
}

export function buscarPorId(id: number, db: Db = prisma) {
  return db.usuario.findUnique({ where: { id } });
}

export function criar(
  dados: { nome: string; email: string; senhaHash: string; papel?: Papel },
  db: Db = prisma,
) {
  return db.usuario.create({ data: dados });
}

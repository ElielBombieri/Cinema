import { prisma } from "../prisma.js";
import type { Db } from "./db.js";

export function listar(db: Db = prisma) {
  return db.sessao.findMany({
    include: {
      filme: true,
      sala: true,
      assentos: { select: { status: true } },
    },
    orderBy: { inicio: "asc" },
  });
}

export function buscarPorId(id: number, db: Db = prisma) {
  return db.sessao.findUnique({
    where: { id },
    include: {
      filme: true,
      sala: true,
      assentos: { include: { assento: true } },
    },
  });
}

export function criar(
  dados: { filmeId: number; salaId: number; inicio: Date; preco: string },
  db: Db = prisma,
) {
  return db.sessao.create({ data: dados });
}

export function criarAssentos(sessaoId: number, assentoIds: number[], db: Db = prisma) {
  return db.assentoSessao.createMany({
    data: assentoIds.map((assentoId) => ({ sessaoId, assentoId })),
  });
}

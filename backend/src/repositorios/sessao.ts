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

export function listarPorSala(salaId: number, db: Db = prisma) {
  return db.sessao.findMany({
    where: { salaId },
    select: {
      id: true,
      inicio: true,
      filme: { select: { titulo: true, duracaoMinutos: true } },
    },
    orderBy: { inicio: "asc" },
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

export function atualizar(id: number, dados: { filmeId: number; salaId: number; inicio: Date; preco: string }, db: Db = prisma) {
  return db.sessao.update({ where: { id }, data: dados, include: { filme: true, sala: true } });
}

export function buscarParaGerenciar(id: number, db: Db = prisma) {
  return db.sessao.findUnique({ where: { id }, include: { filme: true, sala: true, assentos: true, reservas: true, ingressos: true } });
}

export function excluir(id: number, db: Db = prisma) {
  return db.sessao.delete({ where: { id } });
}

export function excluirAssentos(id: number, db: Db = prisma) {
  return db.assentoSessao.deleteMany({ where: { sessaoId: id } });
}

export function listarPorSalaExceto(salaId: number, id: number, db: Db = prisma) {
  return db.sessao.findMany({ where: { salaId, id: { not: id } }, select: { id: true, inicio: true, filme: { select: { titulo: true, duracaoMinutos: true } } }, orderBy: { inicio: "asc" } });
}

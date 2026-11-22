import { prisma } from "../prisma.js";
import type { Db } from "./db.js";

const comAssentos = { assentos: { orderBy: [{ fila: "asc" as const }, { numero: "asc" as const }] } };

export function listar(db: Db = prisma) {
  return db.sala.findMany({ include: comAssentos, orderBy: { nome: "asc" } });
}

export function buscarPorId(id: number, db: Db = prisma) {
  return db.sala.findUnique({ where: { id }, include: comAssentos });
}

export function criar(nome: string, db: Db = prisma) {
  return db.sala.create({ data: { nome } });
}

export function criarAssentos(
  salaId: number,
  assentos: { fila: string; numero: number }[],
  db: Db = prisma,
) {
  return db.assento.createMany({
    data: assentos.map((assento) => ({ salaId, fila: assento.fila, numero: assento.numero })),
  });
}

export function atualizarNome(id: number, nome: string, db: Db = prisma) {
  return db.sala.update({ where: { id }, data: { nome } });
}

export function contarSessoes(id: number, db: Db = prisma) {
  return db.sessao.count({ where: { salaId: id } });
}

export function excluir(id: number, db: Db = prisma) {
  return db.sala.delete({ where: { id } });
}

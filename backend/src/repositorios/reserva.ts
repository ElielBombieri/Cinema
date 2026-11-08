import type { StatusReserva } from "../../generated/prisma/client.js";
import { prisma } from "../prisma.js";
import type { Db } from "./db.js";

export function buscarExpiradas(agora: Date, sessaoId: number | undefined, db: Db = prisma) {
  return db.reserva.findMany({
    where: {
      status: "ABERTA",
      expiraEm: { lt: agora },
      ...(sessaoId === undefined ? {} : { sessaoId }),
    },
    select: { id: true, sessaoId: true },
  });
}

export function liberarAssentos(reservaIds: number[], db: Db = prisma) {
  return db.assentoSessao.updateMany({
    where: { reservaId: { in: reservaIds }, status: "RESERVADO" },
    data: { status: "LIVRE", reservaId: null, usuarioId: null, reservaExpiraEm: null },
  });
}

export function marcarExpiradas(reservaIds: number[], db: Db = prisma) {
  return db.reserva.updateMany({
    where: { id: { in: reservaIds } },
    data: { status: "EXPIRADA" },
  });
}

export function criar(
  dados: { usuarioId: number; sessaoId: number; expiraEm: Date },
  db: Db = prisma,
) {
  return db.reserva.create({ data: dados });
}

export function ocuparAssentos(
  ids: number[],
  dados: { reservaId: number; usuarioId: number; reservaExpiraEm: Date },
  db: Db = prisma,
) {
  return db.assentoSessao.updateMany({
    where: { id: { in: ids }, status: "LIVRE" },
    data: { status: "RESERVADO", ...dados },
  });
}

export function buscarPorId(id: number, db: Db = prisma) {
  return db.reserva.findUnique({
    where: { id },
    include: {
      sessao: { include: { filme: true, sala: true } },
      assentos: { include: { assento: true } },
    },
  });
}

export function listarDoUsuario(usuarioId: number, db: Db = prisma) {
  return db.reserva.findMany({
    where: { usuarioId },
    include: {
      sessao: { include: { filme: true, sala: true } },
      assentos: { include: { assento: true } },
    },
    orderBy: { criadaEm: "desc" },
  });
}

export function atualizarStatus(id: number, status: StatusReserva, db: Db = prisma) {
  return db.reserva.update({ where: { id }, data: { status } });
}

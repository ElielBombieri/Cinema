import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../prisma.js";

export type Tx = Prisma.TransactionClient;

export function transacao<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn);
}

export async function travarSessao(tx: Tx, sessaoId: number): Promise<void> {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(${sessaoId}::bigint)`;
}

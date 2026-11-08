import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../prisma.js";

export type LinhaRelatorio = {
  filme: string;
  sala: string;
  inicio: Date;
  preco: Prisma.Decimal;
  capacidade: number;
  vendidos: number;
  reservados: number;
  livres: number;
  ocupacao: Prisma.Decimal;
  total_vendas: Prisma.Decimal;
};

export function consultar() {
  return prisma.$queryRaw<LinhaRelatorio[]>`SELECT * FROM relatorio_vendas()`;
}

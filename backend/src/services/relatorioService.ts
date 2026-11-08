import { dinheiro } from "../erros.js";
import * as relatorioRepositorio from "../repositorios/relatorio.js";
import { liberarReservasVencidas } from "./reservaService.js";

export type LinhaVendas = {
  filme: string;
  sala: string;
  inicio: string;
  preco: number;
  capacidade: number;
  vendidos: number;
  reservados: number;
  livres: number;
  ocupacao: number;
  totalVendas: number;
};

export async function vendas(): Promise<LinhaVendas[]> {
  await liberarReservasVencidas();
  const linhas = await relatorioRepositorio.consultar();
  return linhas.map((linha) => ({
    filme: linha.filme,
    sala: linha.sala,
    inicio: new Date(linha.inicio).toISOString(),
    preco: dinheiro(linha.preco),
    capacidade: Number(linha.capacidade),
    vendidos: Number(linha.vendidos),
    reservados: Number(linha.reservados),
    livres: Number(linha.livres),
    ocupacao: dinheiro(linha.ocupacao),
    totalVendas: dinheiro(linha.total_vendas),
  }));
}

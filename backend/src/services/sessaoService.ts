import { dataHora, dinheiro, ErroRegra, inteiroPositivo, numeroPositivo } from "../erros.js";
import { Prisma } from "../../generated/prisma/client.js";
import * as filmeRepositorio from "../repositorios/filme.js";
import * as salaRepositorio from "../repositorios/sala.js";
import * as sessaoRepositorio from "../repositorios/sessao.js";
import { transacao } from "../repositorios/transacao.js";
import { liberarReservasVencidas } from "./reservaService.js";

export type SessaoResumo = {
  id: number;
  inicio: string;
  preco: number;
  filme: { titulo: string; duracaoMinutos: number };
  sala: { nome: string };
  livres: number;
  reservados: number;
  vendidos: number;
};

export type MapaAssento = {
  fila: string;
  numero: number;
  status: "LIVRE" | "RESERVADO" | "VENDIDO";
  meu: boolean;
};

export type MapaSessao = {
  id: number;
  inicio: string;
  preco: number;
  filme: { titulo: string; sinopse: string; duracaoMinutos: number };
  sala: { nome: string };
  assentos: MapaAssento[];
};

function contar(status: string[]): { livres: number; reservados: number; vendidos: number } {
  return {
    livres: status.filter((item) => item === "LIVRE").length,
    reservados: status.filter((item) => item === "RESERVADO").length,
    vendidos: status.filter((item) => item === "VENDIDO").length,
  };
}

export async function listar(): Promise<SessaoResumo[]> {
  await liberarReservasVencidas();
  const sessoes = await sessaoRepositorio.listar();
  return sessoes.map((sessao) => {
    const totais = contar(sessao.assentos.map((assento) => assento.status));
    return {
      id: sessao.id,
      inicio: sessao.inicio.toISOString(),
      preco: dinheiro(sessao.preco),
      filme: { titulo: sessao.filme.titulo, duracaoMinutos: sessao.filme.duracaoMinutos },
      sala: { nome: sessao.sala.nome },
      ...totais,
    };
  });
}

export async function mapa(sessaoId: number, usuarioId: number): Promise<MapaSessao> {
  await liberarReservasVencidas(sessaoId);
  const sessao = await sessaoRepositorio.buscarPorId(sessaoId);
  if (!sessao) throw new ErroRegra("Sessão não encontrada", 404);
  const assentos = sessao.assentos
    .map((item) => ({
      fila: item.assento.fila,
      numero: item.assento.numero,
      status: item.status,
      meu: item.status === "RESERVADO" && item.usuarioId === usuarioId,
    }))
    .sort((a, b) => a.fila.localeCompare(b.fila) || a.numero - b.numero);

  return {
    id: sessao.id,
    inicio: sessao.inicio.toISOString(),
    preco: dinheiro(sessao.preco),
    filme: {
      titulo: sessao.filme.titulo,
      sinopse: sessao.filme.sinopse,
      duracaoMinutos: sessao.filme.duracaoMinutos,
    },
    sala: { nome: sessao.sala.nome },
    assentos,
  };
}

export async function criar(corpo: unknown): Promise<SessaoResumo> {
  if (typeof corpo !== "object" || corpo === null) throw new ErroRegra("Dados inválidos");
  const dados = corpo as { filmeId?: unknown; salaId?: unknown; inicio?: unknown; preco?: unknown };
  const filmeId = inteiroPositivo(dados.filmeId, "O filme");
  const salaId = inteiroPositivo(dados.salaId, "A sala");
  const inicio = dataHora(dados.inicio);
  if (inicio <= new Date()) {
    throw new ErroRegra("A data e hora da sessão devem ser futuras");
  }
  const preco = numeroPositivo(dados.preco, "O preço");

  const filme = await filmeRepositorio.buscarPorId(filmeId);
  if (!filme) throw new ErroRegra("Filme não encontrado", 404);
  const sala = await salaRepositorio.buscarPorId(salaId);
  if (!sala) throw new ErroRegra("Sala não encontrada", 404);
  if (sala.assentos.length === 0) throw new ErroRegra("A sala não possui assentos");

  const sessaoExistente = await sessaoRepositorio.buscarPorSalaEInicio(salaId, inicio);
  if (sessaoExistente) {
    throw new ErroRegra("Já existe uma sessão nesta sala para essa data e horário");
  }

  const sessao = await transacao(async (tx) => {
    const criada = await sessaoRepositorio.criar(
      { filmeId, salaId, inicio, preco: preco.toFixed(2) },
      tx,
    );
    await sessaoRepositorio.criarAssentos(
      criada.id,
      sala.assentos.map((assento) => assento.id),
      tx,
    );
    return criada;
  }).catch((erro: unknown) => {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      const alvo = erro.meta?.target;
      const campos = Array.isArray(alvo) ? alvo : [];
      const nomeIndice = typeof alvo === "string" ? alvo : "";
      if (
        (campos.includes("salaId") && campos.includes("inicio")) ||
        nomeIndice.includes("Sessao_salaId_inicio_key")
      ) {
        throw new ErroRegra("Já existe uma sessão nesta sala para essa data e horário");
      }
    }
    throw erro;
  });

  return {
    id: sessao.id,
    inicio: sessao.inicio.toISOString(),
    preco,
    filme: { titulo: filme.titulo, duracaoMinutos: filme.duracaoMinutos },
    sala: { nome: sala.nome },
    livres: sala.assentos.length,
    reservados: 0,
    vendidos: 0,
  };
}

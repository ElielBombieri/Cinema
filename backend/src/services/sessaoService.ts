import { dataHora, dinheiro, ErroRegra, inteiroPositivo, numeroPositivo } from "../erros.js";
import * as filmeRepositorio from "../repositorios/filme.js";
import * as salaRepositorio from "../repositorios/sala.js";
import * as sessaoRepositorio from "../repositorios/sessao.js";
import { transacao, travarSala } from "../repositorios/transacao.js";
import { liberarReservasVencidas } from "./reservaService.js";

export type SessaoResumo = {
  id: number;
  filmeId: number;
  salaId: number;
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

const INTERVALO_MINIMO_MINUTOS = 1;

function horarioLegivel(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function verificarIntervaloSala(
  sessoes: Awaited<ReturnType<typeof sessaoRepositorio.listarPorSala>>,
  inicio: Date,
  duracaoMinutos: number,
): void {
  const fimNovoFilme = inicio.getTime() + duracaoMinutos * 60_000;
  const intervaloMinimo = INTERVALO_MINIMO_MINUTOS * 60_000;

  for (const existente of sessoes) {
    const fimExistente = existente.inicio.getTime() + existente.filme.duracaoMinutos * 60_000;
    if (existente.inicio <= inicio) {
      if (inicio.getTime() < fimExistente) {
        throw new ErroRegra(
          `A sessão de ${existente.filme.titulo} termina às ${horarioLegivel(new Date(fimExistente))}. É necessário aguardar esse horário para iniciar outra sessão na sala.`,
          409,
        );
      }
      if (inicio.getTime() < fimExistente + intervaloMinimo) {
        throw new ErroRegra(
          `A sessão cadastrada termina às ${horarioLegivel(new Date(fimExistente))}. A diferença entre o fim de uma sessão e o início da próxima deve ser de 1 minuto.`,
          409,
        );
      }
      continue;
    }

    if (existente.inicio.getTime() < fimNovoFilme) {
      throw new ErroRegra(
        `A nova sessão terminaria às ${horarioLegivel(new Date(fimNovoFilme))}, mas já existe outra sessão às ${horarioLegivel(existente.inicio)}. Escolha outro horário para esta sala.`,
        409,
      );
    }
    if (existente.inicio.getTime() < fimNovoFilme + intervaloMinimo) {
      throw new ErroRegra(
        `A nova sessão termina às ${horarioLegivel(new Date(fimNovoFilme))}. A diferença entre o fim de uma sessão e o início da próxima deve ser de 1 minuto.`,
        409,
      );
    }
    break;
  }
}

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
      filmeId: sessao.filmeId,
      salaId: sessao.salaId,
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
  return salvar(corpo, undefined);
}

export async function atualizar(id: number, corpo: unknown): Promise<SessaoResumo> {
  return salvar(corpo, id);
}

async function salvar(corpo: unknown, id: number | undefined): Promise<SessaoResumo> {
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

  const sessao = await transacao(async (tx) => {
    await travarSala(tx, salaId);
    const gerenciada = id === undefined ? null : await sessaoRepositorio.buscarParaGerenciar(id, tx);
    if (id !== undefined && !gerenciada) throw new ErroRegra("Sessão não encontrada", 404);
    if (gerenciada && gerenciada.reservas.length + gerenciada.ingressos.length > 0) {
      throw new ErroRegra("Não é possível alterar uma sessão que já possui reservas ou ingressos.", 409);
    }
    const sessoesDaSala = id === undefined
      ? await sessaoRepositorio.listarPorSala(salaId, tx)
      : await sessaoRepositorio.listarPorSalaExceto(salaId, id, tx);
    verificarIntervaloSala(sessoesDaSala, inicio, filme.duracaoMinutos);
    const dados = { filmeId, salaId, inicio, preco: preco.toFixed(2) };
    if (id === undefined) {
      const criada = await sessaoRepositorio.criar(dados, tx);
      await sessaoRepositorio.criarAssentos(criada.id, sala.assentos.map((assento) => assento.id), tx);
      return criada;
    }
    await sessaoRepositorio.excluirAssentos(id, tx);
    const atualizada = await sessaoRepositorio.atualizar(id, dados, tx);
    await sessaoRepositorio.criarAssentos(id, sala.assentos.map((assento) => assento.id), tx);
    return atualizada;
  }).catch((erro: unknown) => {
    if (
      typeof erro === "object" &&
      erro !== null &&
      "code" in erro &&
      erro.code === "P2002"
    ) {
      const meta = "meta" in erro && typeof erro.meta === "object" && erro.meta !== null
        ? (erro.meta as { target?: unknown })
        : undefined;
      const alvo = meta?.target;
      const campos = Array.isArray(alvo) ? alvo : [];
      const nomeIndice = typeof alvo === "string" ? alvo : "";
      if (
        (campos.includes("salaId") && campos.includes("inicio")) ||
        nomeIndice.includes("Sessao_salaId_inicio_key")
      ) {
        throw new ErroRegra("Já existe uma sessão nesta sala para essa data e horário.", 409);
      }
    }
    throw erro;
  });

  return {
    id: sessao.id,
    filmeId,
    salaId,
    inicio: sessao.inicio.toISOString(),
    preco,
    filme: { titulo: filme.titulo, duracaoMinutos: filme.duracaoMinutos },
    sala: { nome: sala.nome },
    livres: sala.assentos.length,
    reservados: 0,
    vendidos: 0,
  };
}

export async function excluir(id: number): Promise<void> {
  await liberarReservasVencidas(id);
  const sessao = await sessaoRepositorio.buscarParaGerenciar(id);
  if (!sessao) throw new ErroRegra("Sessão não encontrada", 404);
  if (sessao.reservas.length + sessao.ingressos.length > 0 || sessao.assentos.some((a) => a.status !== "LIVRE")) {
    throw new ErroRegra("Não é possível excluir uma sessão que possui reservas ou ingressos.", 409);
  }
  await transacao(async (tx) => {
    await sessaoRepositorio.excluirAssentos(id, tx);
    await sessaoRepositorio.excluir(id, tx);
  });
}

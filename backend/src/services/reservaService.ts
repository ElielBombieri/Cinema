import {
  dinheiro,
  emailValido,
  ErroRegra,
  inteiroPositivo,
  listaAssentos,
  type AssentoEscolhido,
} from "../erros.js";
import type { Db } from "../repositorios/db.js";
import * as ingressoRepositorio from "../repositorios/ingresso.js";
import * as reservaRepositorio from "../repositorios/reserva.js";
import * as sessaoRepositorio from "../repositorios/sessao.js";
import * as usuarioRepositorio from "../repositorios/usuario.js";
import { transacao, travarSessao } from "../repositorios/transacao.js";

export const PRAZO_RESERVA_MINUTOS = 10;

type AssentoDaSessao = {
  id: number;
  status: "LIVRE" | "RESERVADO" | "VENDIDO";
  reservaId: number | null;
  assento: { fila: string; numero: number };
};

type SessaoComAssentos = {
  id: number;
  preco: { toString(): string };
  filme: { titulo: string };
  sala: { nome: string };
  inicio: Date;
  assentos: AssentoDaSessao[];
};

export type AssentoReservado = { fila: string; numero: number };

export type ReservaResposta = {
  id: number;
  status: "ABERTA" | "PAGA" | "EXPIRADA" | "CANCELADA";
  expiraEm: string;
  valorTotal: number;
  filme: string;
  sala: string;
  inicio: string;
  assentos: AssentoReservado[];
};

export type IngressoEmitido = {
  codigo: string;
  fila: string;
  numero: number;
  valor: number;
};

async function aplicarExpiracao(db: Db, sessaoId: number): Promise<void> {
  const ids = (await reservaRepositorio.buscarExpiradas(new Date(), sessaoId, db)).map((item) => item.id);
  if (ids.length === 0) return;
  await reservaRepositorio.liberarAssentos(ids, db);
  await reservaRepositorio.marcarExpiradas(ids, db);
}

export async function liberarReservasVencidas(sessaoId?: number): Promise<void> {
  const candidatas = await reservaRepositorio.buscarExpiradas(new Date(), sessaoId);
  const sessoes = [...new Set(candidatas.map((item) => item.sessaoId))];
  for (const id of sessoes) {
    await transacao(async (tx) => {
      await travarSessao(tx, id);
      await aplicarExpiracao(tx, id);
    });
  }
}

function casar(sessao: SessaoComAssentos, escolhas: AssentoEscolhido[]): AssentoDaSessao[] {
  return escolhas.map((escolha) => {
    const encontrado = sessao.assentos.find(
      (item) => item.assento.fila === escolha.fila && item.assento.numero === escolha.numero,
    );
    if (!encontrado) {
      throw new ErroRegra(`O assento ${escolha.fila}-${escolha.numero} não existe nesta sessão`);
    }
    return encontrado;
  });
}

function ordenar(assentos: AssentoReservado[]): AssentoReservado[] {
  return [...assentos].sort((a, b) => a.fila.localeCompare(b.fila) || a.numero - b.numero);
}

function montarReserva(reserva: {
  id: number;
  status: ReservaResposta["status"];
  expiraEm: Date;
  sessao: { preco: { toString(): string }; inicio: Date; filme: { titulo: string }; sala: { nome: string } };
  assentos: { assento: { fila: string; numero: number } }[];
}): ReservaResposta {
  const assentos = ordenar(reserva.assentos.map((item) => ({ fila: item.assento.fila, numero: item.assento.numero })));
  return {
    id: reserva.id,
    status: reserva.status,
    expiraEm: reserva.expiraEm.toISOString(),
    valorTotal: dinheiro(Number(reserva.sessao.preco.toString()) * assentos.length),
    filme: reserva.sessao.filme.titulo,
    sala: reserva.sessao.sala.nome,
    inicio: reserva.sessao.inicio.toISOString(),
    assentos,
  };
}

async function emitir(
  tx: Db,
  reservaId: number,
  usuarioId: number,
  sessao: SessaoComAssentos,
  assentos: AssentoDaSessao[],
): Promise<IngressoEmitido[]> {
  const valor = sessao.preco.toString();
  const emitidos: IngressoEmitido[] = [];
  for (const assento of assentos) {
    const codigo = await ingressoRepositorio.codigoLivre(tx);
    await ingressoRepositorio.criar(
      {
        codigo,
        reservaId,
        assentoSessaoId: assento.id,
        usuarioId,
        sessaoId: sessao.id,
        valor,
      },
      tx,
    );
    await ingressoRepositorio.marcarAssentoVendido(assento.id, tx);
    emitidos.push({
      codigo,
      fila: assento.assento.fila,
      numero: assento.assento.numero,
      valor: dinheiro(sessao.preco),
    });
  }
  await reservaRepositorio.atualizarStatus(reservaId, "PAGA", tx);
  return ordenar(emitidos) as IngressoEmitido[];
}

export async function reservar(usuarioId: number, corpo: unknown): Promise<ReservaResposta> {
  if (typeof corpo !== "object" || corpo === null) throw new ErroRegra("Dados inválidos");
  const dados = corpo as { sessaoId?: unknown; assentos?: unknown };
  const sessaoId = inteiroPositivo(dados.sessaoId, "A sessão");
  const escolhas = listaAssentos(dados.assentos);

  return transacao(async (tx) => {
    await travarSessao(tx, sessaoId);
    await aplicarExpiracao(tx, sessaoId);
    const sessao = await sessaoRepositorio.buscarPorId(sessaoId, tx);
    if (!sessao) throw new ErroRegra("Sessão não encontrada", 404);
    const assentos = casar(sessao, escolhas);
    const ocupado = assentos.find((assento) => assento.status !== "LIVRE");
    if (ocupado) {
      throw new ErroRegra(
        `O assento ${ocupado.assento.fila}-${ocupado.assento.numero} não está livre`,
        409,
      );
    }

    const expiraEm = new Date(Date.now() + PRAZO_RESERVA_MINUTOS * 60 * 1000);
    const reserva = await reservaRepositorio.criar({ usuarioId, sessaoId, expiraEm }, tx);
    const gravados = await reservaRepositorio.ocuparAssentos(
      assentos.map((assento) => assento.id),
      { reservaId: reserva.id, usuarioId, reservaExpiraEm: expiraEm },
      tx,
    );
    if (gravados.count !== assentos.length) {
      throw new ErroRegra("Um dos assentos acabou de ser reservado. Escolha de novo.", 409);
    }

    const completa = await reservaRepositorio.buscarPorId(reserva.id, tx);
    if (!completa) throw new ErroRegra("Não foi possível gravar a reserva", 500);
    return montarReserva(completa);
  });
}

export async function pagar(usuarioId: number, reservaId: number): Promise<{ ingressos: IngressoEmitido[] }> {
  const existente = await reservaRepositorio.buscarPorId(reservaId);
  if (!existente) throw new ErroRegra("Reserva não encontrada", 404);
  if (existente.usuarioId !== usuarioId) throw new ErroRegra("Esta reserva é de outro cliente", 403);

  return transacao(async (tx) => {
    await travarSessao(tx, existente.sessaoId);
    await aplicarExpiracao(tx, existente.sessaoId);
    const reserva = await reservaRepositorio.buscarPorId(reservaId, tx);
    if (!reserva || reserva.status !== "ABERTA") {
      throw new ErroRegra("O prazo da reserva acabou. Os assentos foram liberados.", 409);
    }
    const sessao = await sessaoRepositorio.buscarPorId(reserva.sessaoId, tx);
    if (!sessao) throw new ErroRegra("Sessão não encontrada", 404);
    const assentos = reserva.assentos.map((item) => {
      const atual = sessao.assentos.find((assento) => assento.id === item.id);
      if (!atual || atual.status !== "RESERVADO" || atual.reservaId !== reserva.id) {
        throw new ErroRegra("A reserva não está mais válida", 409);
      }
      return atual;
    });
    const ingressos = await emitir(tx, reserva.id, reserva.usuarioId, sessao, assentos);
    return { ingressos };
  });
}

export async function venderNoBalcao(corpo: unknown): Promise<{ ingressos: IngressoEmitido[] }> {
  if (typeof corpo !== "object" || corpo === null) throw new ErroRegra("Dados inválidos");
  const dados = corpo as { email?: unknown; sessaoId?: unknown; assentos?: unknown };
  const email = emailValido(dados.email);
  const sessaoId = inteiroPositivo(dados.sessaoId, "A sessão");
  const escolhas = listaAssentos(dados.assentos);

  const cliente = await usuarioRepositorio.buscarPorEmail(email);
  if (!cliente) throw new ErroRegra("Cliente não encontrado. Faça o cadastro antes da venda.", 404);

  return transacao(async (tx) => {
    await travarSessao(tx, sessaoId);
    await aplicarExpiracao(tx, sessaoId);
    const sessao = await sessaoRepositorio.buscarPorId(sessaoId, tx);
    if (!sessao) throw new ErroRegra("Sessão não encontrada", 404);
    const assentos = casar(sessao, escolhas);
    const ocupado = assentos.find((assento) => assento.status !== "LIVRE");
    if (ocupado) {
      throw new ErroRegra(
        `O assento ${ocupado.assento.fila}-${ocupado.assento.numero} não está livre`,
        409,
      );
    }
    const expiraEm = new Date(Date.now() + PRAZO_RESERVA_MINUTOS * 60 * 1000);
    const reserva = await reservaRepositorio.criar({ usuarioId: cliente.id, sessaoId, expiraEm }, tx);
    const gravados = await reservaRepositorio.ocuparAssentos(
      assentos.map((assento) => assento.id),
      { reservaId: reserva.id, usuarioId: cliente.id, reservaExpiraEm: expiraEm },
      tx,
    );
    if (gravados.count !== assentos.length) {
      throw new ErroRegra("Um dos assentos acabou de ser reservado. Escolha de novo.", 409);
    }
    const ingressos = await emitir(tx, reserva.id, cliente.id, sessao, assentos);
    return { ingressos };
  });
}

export async function listarDoUsuario(usuarioId: number): Promise<ReservaResposta[]> {
  await liberarReservasVencidas();
  const reservas = await reservaRepositorio.listarDoUsuario(usuarioId);
  return reservas.map(montarReserva);
}

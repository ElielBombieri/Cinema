import { dinheiro, ErroRegra, textoObrigatorio } from "../erros.js";
import * as ingressoRepositorio from "../repositorios/ingresso.js";

export type IngressoResposta = {
  codigo: string;
  valor: number;
  emitidoEm: string;
  utilizadoEm: string | null;
  filme: string;
  sala: string;
  inicio: string;
  fila: string;
  numero: number;
  cliente: string;
};

function paraResposta(ingresso: {
  codigo: string;
  valor: { toString(): string };
  emitidoEm: Date;
  utilizadoEm: Date | null;
  sessao: { inicio: Date; filme: { titulo: string }; sala: { nome: string } };
  assentoSessao: { assento: { fila: string; numero: number } };
  usuario?: { nome: string };
}): IngressoResposta {
  return {
    codigo: ingresso.codigo,
    valor: dinheiro(ingresso.valor),
    emitidoEm: ingresso.emitidoEm.toISOString(),
    utilizadoEm: ingresso.utilizadoEm ? ingresso.utilizadoEm.toISOString() : null,
    filme: ingresso.sessao.filme.titulo,
    sala: ingresso.sessao.sala.nome,
    inicio: ingresso.sessao.inicio.toISOString(),
    fila: ingresso.assentoSessao.assento.fila,
    numero: ingresso.assentoSessao.assento.numero,
    cliente: ingresso.usuario?.nome ?? "",
  };
}

export async function listarDoUsuario(usuarioId: number): Promise<IngressoResposta[]> {
  const ingressos = await ingressoRepositorio.listarDoUsuario(usuarioId);
  return ingressos.map(paraResposta);
}

export async function validar(corpo: unknown): Promise<IngressoResposta> {
  if (typeof corpo !== "object" || corpo === null) throw new ErroRegra("Dados inválidos");
  const dados = corpo as { codigo?: unknown };
  const codigo = textoObrigatorio(dados.codigo, "o código do ingresso").toUpperCase();

  const ingresso = await ingressoRepositorio.buscarPorCodigo(codigo);
  if (!ingresso) throw new ErroRegra("Ingresso não encontrado", 404);
  if (ingresso.utilizadoEm) throw new ErroRegra("Este ingresso já foi utilizado", 409);

  const atualizado = await ingressoRepositorio.marcarUtilizado(ingresso.id, new Date());
  const completo = await ingressoRepositorio.buscarPorCodigo(atualizado.codigo);
  if (!completo) throw new ErroRegra("Ingresso não encontrado", 404);
  return paraResposta(completo);
}

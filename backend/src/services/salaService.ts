import { ErroRegra, inteiroPositivo, textoObrigatorio } from "../erros.js";
import * as salaRepositorio from "../repositorios/sala.js";
import { transacao } from "../repositorios/transacao.js";

export type SalaResposta = {
  id: number;
  nome: string;
  assentos: { fila: string; numero: number }[];
};

type SalaComAssentos = {
  id: number;
  nome: string;
  assentos: { fila: string; numero: number }[];
};

function paraResposta(sala: SalaComAssentos): SalaResposta {
  return {
    id: sala.id,
    nome: sala.nome,
    assentos: sala.assentos.map((assento) => ({ fila: assento.fila, numero: assento.numero })),
  };
}

function montarGrade(filas: number, assentosPorFila: number): { fila: string; numero: number }[] {
  const lista: { fila: string; numero: number }[] = [];
  for (let indiceFila = 0; indiceFila < filas; indiceFila++) {
    const fila = String.fromCharCode(65 + indiceFila);
    for (let numero = 1; numero <= assentosPorFila; numero++) {
      lista.push({ fila, numero });
    }
  }
  return lista;
}

export async function listar(): Promise<SalaResposta[]> {
  const salas = await salaRepositorio.listar();
  return salas.map(paraResposta);
}

export async function criar(corpo: unknown): Promise<SalaResposta> {
  if (typeof corpo !== "object" || corpo === null) throw new ErroRegra("Dados inválidos");
  const dados = corpo as { nome?: unknown; filas?: unknown; assentosPorFila?: unknown };
  const nome = textoObrigatorio(dados.nome, "o nome da sala");
  const filas = inteiroPositivo(dados.filas, "A quantidade de filas");
  const assentosPorFila = inteiroPositivo(dados.assentosPorFila, "A quantidade de assentos por fila");
  if (filas > 26) throw new ErroRegra("A sala pode ter no máximo 26 filas (A até Z)");
  if (assentosPorFila > 30) throw new ErroRegra("Cada fila pode ter no máximo 30 assentos");

  try {
    return await transacao(async (tx) => {
      const sala = await salaRepositorio.criar(nome, tx);
      await salaRepositorio.criarAssentos(sala.id, montarGrade(filas, assentosPorFila), tx);
      const completa = await salaRepositorio.buscarPorId(sala.id, tx);
      if (!completa) throw new ErroRegra("Não foi possível gravar a sala", 500);
      return paraResposta(completa);
    });
  } catch (erro) {
    if (typeof erro === "object" && erro !== null && "code" in erro && erro.code === "P2002") {
      throw new ErroRegra("Já existe uma sala com este nome", 409);
    }
    throw erro;
  }
}

import { ErroRegra, inteiroPositivo, textoObrigatorio } from "../erros.js";
import * as filmeRepositorio from "../repositorios/filme.js";

export type FilmeResposta = {
  id: number;
  titulo: string;
  sinopse: string;
  duracaoMinutos: number;
};

function paraResposta(filme: FilmeResposta): FilmeResposta {
  return {
    id: filme.id,
    titulo: filme.titulo,
    sinopse: filme.sinopse,
    duracaoMinutos: filme.duracaoMinutos,
  };
}

export async function listar(): Promise<FilmeResposta[]> {
  const filmes = await filmeRepositorio.listar();
  return filmes.map(paraResposta);
}

export async function criar(corpo: unknown): Promise<FilmeResposta> {
  return salvar(corpo, undefined);
}

export async function atualizar(id: number, corpo: unknown): Promise<FilmeResposta> {
  return salvar(corpo, id);
}

async function salvar(corpo: unknown, id: number | undefined): Promise<FilmeResposta> {
  if (typeof corpo !== "object" || corpo === null) throw new ErroRegra("Dados inválidos");
  const dados = corpo as { titulo?: unknown; sinopse?: unknown; duracaoMinutos?: unknown };
  const titulo = textoObrigatorio(dados.titulo, "o título");
  const sinopse = textoObrigatorio(dados.sinopse, "a sinopse");
  const duracaoMinutos = inteiroPositivo(dados.duracaoMinutos, "A duração");
  if (id !== undefined) {
    const existente = await filmeRepositorio.buscarPorId(id);
    if (!existente) throw new ErroRegra("Filme não encontrado", 404);
    if (existente.duracaoMinutos !== duracaoMinutos && await filmeRepositorio.contarSessoes(id)) {
      throw new ErroRegra("A duração não pode ser alterada enquanto o filme possuir sessões cadastradas.", 409);
    }
  }
  const filme = id === undefined
    ? await filmeRepositorio.criar({ titulo, sinopse, duracaoMinutos })
    : await filmeRepositorio.atualizar(id, { titulo, sinopse, duracaoMinutos });
  return paraResposta(filme);
}

export async function excluir(id: number): Promise<void> {
  if (!await filmeRepositorio.buscarPorId(id)) throw new ErroRegra("Filme não encontrado", 404);
  if (await filmeRepositorio.contarSessoes(id)) throw new ErroRegra("Não é possível excluir um filme que possui sessões cadastradas.", 409);
  await filmeRepositorio.excluir(id);
}

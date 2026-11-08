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
  if (typeof corpo !== "object" || corpo === null) throw new ErroRegra("Dados inválidos");
  const dados = corpo as { titulo?: unknown; sinopse?: unknown; duracaoMinutos?: unknown };
  const titulo = textoObrigatorio(dados.titulo, "o título");
  const sinopse = textoObrigatorio(dados.sinopse, "a sinopse");
  const duracaoMinutos = inteiroPositivo(dados.duracaoMinutos, "A duração");
  const filme = await filmeRepositorio.criar({ titulo, sinopse, duracaoMinutos });
  return paraResposta(filme);
}

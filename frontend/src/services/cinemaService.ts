import type {
  AssentoEscolhido,
  Filme,
  Ingresso,
  IngressoEmitido,
  LinhaRelatorio,
  MapaSessao,
  Reserva,
  Sala,
  SessaoResumo,
} from "../models/cinema";
import { api } from "./api";

export function listarSessoes(token: string): Promise<SessaoResumo[]> {
  return api<SessaoResumo[]>("/sessoes", { token });
}

export function buscarMapa(token: string, sessaoId: number): Promise<MapaSessao> {
  return api<MapaSessao>(`/sessoes/${sessaoId}`, { token });
}

export function reservar(
  token: string,
  sessaoId: number,
  assentos: AssentoEscolhido[],
): Promise<Reserva> {
  return api<Reserva>("/reservas", {
    method: "POST",
    token,
    corpo: { sessaoId, assentos },
  });
}

export function pagar(token: string, reservaId: number): Promise<{ ingressos: IngressoEmitido[] }> {
  return api<{ ingressos: IngressoEmitido[] }>(`/reservas/${reservaId}/pagar`, {
    method: "POST",
    token,
  });
}

export function minhasReservas(token: string): Promise<Reserva[]> {
  return api<Reserva[]>("/reservas/minhas", { token });
}

export function meusIngressos(token: string): Promise<Ingresso[]> {
  return api<Ingresso[]>("/ingressos/meus", { token });
}

export function vender(
  token: string,
  email: string,
  sessaoId: number,
  assentos: AssentoEscolhido[],
): Promise<{ ingressos: IngressoEmitido[] }> {
  return api<{ ingressos: IngressoEmitido[] }>("/vendas", {
    method: "POST",
    token,
    corpo: { email, sessaoId, assentos },
  });
}

export function validarIngresso(token: string, codigo: string): Promise<Ingresso> {
  return api<Ingresso>("/ingressos/validar", {
    method: "POST",
    token,
    corpo: { codigo },
  });
}

export function listarFilmes(token: string): Promise<Filme[]> {
  return api<Filme[]>("/filmes", { token });
}

export function criarFilme(
  token: string,
  corpo: { titulo: string; sinopse: string; duracaoMinutos: string },
): Promise<Filme> {
  return api<Filme>("/filmes", { method: "POST", token, corpo });
}

export function atualizarFilme(token: string, id: number, corpo: { titulo: string; sinopse: string; duracaoMinutos: string }): Promise<Filme> {
  return api<Filme>(`/filmes/${id}`, { method: "PUT", token, corpo });
}

export function excluirFilme(token: string, id: number): Promise<void> {
  return api<void>(`/filmes/${id}`, { method: "DELETE", token });
}

export function listarSalas(token: string): Promise<Sala[]> {
  return api<Sala[]>("/salas", { token });
}

export function criarSala(
  token: string,
  corpo: { nome: string; filas: string; assentosPorFila: string },
): Promise<Sala> {
  return api<Sala>("/salas", { method: "POST", token, corpo });
}

export function atualizarSala(token: string, id: number, corpo: { nome: string; filas?: string; assentosPorFila?: string }): Promise<Sala> {
  return api<Sala>(`/salas/${id}`, { method: "PUT", token, corpo });
}

export function excluirSala(token: string, id: number): Promise<void> {
  return api<void>(`/salas/${id}`, { method: "DELETE", token });
}

export function criarSessao(
  token: string,
  corpo: { filmeId: number; salaId: number; inicio: string; preco: string },
): Promise<SessaoResumo> {
  return api<SessaoResumo>("/sessoes", { method: "POST", token, corpo });
}

export function atualizarSessao(token: string, id: number, corpo: { filmeId: number; salaId: number; inicio: string; preco: string }): Promise<SessaoResumo> {
  return api<SessaoResumo>(`/sessoes/${id}`, { method: "PUT", token, corpo });
}

export function excluirSessao(token: string, id: number): Promise<void> {
  return api<void>(`/sessoes/${id}`, { method: "DELETE", token });
}

export function relatorioVendas(token: string): Promise<LinhaRelatorio[]> {
  return api<LinhaRelatorio[]>("/relatorios/vendas", { token });
}

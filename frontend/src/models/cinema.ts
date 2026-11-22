export type Papel = "CLIENTE" | "OPERADOR";

export type Usuario = {
  nome: string;
  email: string;
  papel: Papel;
};

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

export type AssentoMapa = {
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
  assentos: AssentoMapa[];
};

export type AssentoEscolhido = {
  fila: string;
  numero: number;
};

export type Reserva = {
  id: number;
  status: "ABERTA" | "PAGA" | "EXPIRADA" | "CANCELADA";
  expiraEm: string;
  valorTotal: number;
  filme: string;
  sala: string;
  inicio: string;
  assentos: AssentoEscolhido[];
};

export type IngressoEmitido = {
  codigo: string;
  fila: string;
  numero: number;
  valor: number;
};

export type Ingresso = {
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

export type Filme = {
  id: number;
  titulo: string;
  sinopse: string;
  duracaoMinutos: number;
};

export type Sala = {
  id: number;
  nome: string;
  assentos: AssentoEscolhido[];
};

export type LinhaRelatorio = {
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

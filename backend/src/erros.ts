export class ErroRegra extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
  }
}

export function textoObrigatorio(valor: unknown, campo: string): string {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new ErroRegra(`Informe ${campo}`);
  }
  return valor.trim();
}

export function numeroPositivo(valor: unknown, campo: string): number {
  const numero = typeof valor === "number" ? valor : Number(String(valor).replace(",", "."));
  if (!Number.isFinite(numero) || numero <= 0) {
    throw new ErroRegra(`${campo} deve ser maior que zero`);
  }
  return numero;
}

export function inteiroPositivo(valor: unknown, campo: string): number {
  const numero = numeroPositivo(valor, campo);
  if (!Number.isInteger(numero)) {
    throw new ErroRegra(`${campo} deve ser um número inteiro`);
  }
  return numero;
}

export function dataHora(valor: unknown): Date {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new ErroRegra("Informe a data e a hora");
  }
  const partes = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(valor.trim());
  if (!partes) {
    throw new ErroRegra("Informe a data no formato AAAA-MM-DD e a hora no formato HH:MM");
  }
  const [, ano, mes, dia, hora, minuto] = partes;
  const data = new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}:00`);
  if (
    Number.isNaN(data.getTime()) ||
    data.getFullYear() !== Number(ano) ||
    data.getMonth() + 1 !== Number(mes) ||
    data.getDate() !== Number(dia) ||
    data.getHours() !== Number(hora) ||
    data.getMinutes() !== Number(minuto)
  ) {
    throw new ErroRegra("A data ou a hora informada não é válida");
  }
  return data;
}

export function dinheiro(valor: { toString(): string } | number): number {
  const numero = typeof valor === "number" ? valor : Number(valor.toString());
  return Math.round(numero * 100) / 100;
}

export function emailValido(valor: unknown): string {
  const email = textoObrigatorio(valor, "o e-mail").toLowerCase();
  if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
    throw new ErroRegra("E-mail inválido");
  }
  return email;
}

export type AssentoEscolhido = { fila: string; numero: number };

export function listaAssentos(valor: unknown): AssentoEscolhido[] {
  if (!Array.isArray(valor) || valor.length === 0) {
    throw new ErroRegra("Selecione ao menos um assento");
  }
  const vistos = new Set<string>();
  return valor.map((item) => {
    if (typeof item !== "object" || item === null) {
      throw new ErroRegra("Assento inválido");
    }
    const dados = item as { fila?: unknown; numero?: unknown };
    const fila = textoObrigatorio(dados.fila, "a fila").toUpperCase();
    const numero = inteiroPositivo(dados.numero, "O número do assento");
    const chave = `${fila}-${numero}`;
    if (vistos.has(chave)) {
      throw new ErroRegra(`O assento ${chave} foi informado mais de uma vez`);
    }
    vistos.add(chave);
    return { fila, numero };
  });
}

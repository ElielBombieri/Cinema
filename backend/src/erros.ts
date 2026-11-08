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
  const data = new Date(valor.trim().replace(" ", "T"));
  if (Number.isNaN(data.getTime())) {
    throw new ErroRegra("Data e hora inválidas. Use AAAA-MM-DD HH:MM");
  }
  return data;
}

export function dinheiro(valor: { toString(): string } | number): number {
  const numero = typeof valor === "number" ? valor : Number(valor.toString());
  return Math.round(numero * 100) / 100;
}

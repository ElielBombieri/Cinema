export function dataHora(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function reais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function textoDoErro(erro: unknown): string {
  if (!(erro instanceof Error)) return "Não foi possível concluir a operação. Tente novamente.";
  if (
    erro instanceof TypeError ||
    /failed to fetch|network request failed|networkerror|fetch failed|econnrefused|erro interno|erro http|resposta inválida da api/i.test(erro.message)
  ) {
    return "Não foi possível acessar o serviço. Verifique se a API está ligada e tente novamente.";
  }
  return erro.message || "Não foi possível concluir a operação. Tente novamente.";
}

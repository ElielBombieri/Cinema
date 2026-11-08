const URL_API = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type Metodo = "GET" | "POST";

type Opcoes = {
  method?: Metodo;
  token?: string | null;
  corpo?: unknown;
};

function mensagemDoCorpo(json: unknown, status: number): string {
  if (typeof json === "object" && json !== null && "erro" in json && typeof json.erro === "string") {
    return json.erro;
  }
  return `Erro HTTP ${status}`;
}

export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opcoes.corpo !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (opcoes.token) {
    headers.Authorization = `Bearer ${opcoes.token}`;
  }

  const resp = await fetch(`${URL_API}${caminho}`, {
    method: opcoes.method ?? "GET",
    headers,
    body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
  });

  const texto = await resp.text();
  let json: unknown = {};
  if (texto !== "") {
    try {
      json = JSON.parse(texto) as unknown;
    } catch {
      throw new Error(resp.ok ? "Resposta inválida da API" : `Erro HTTP ${resp.status}`);
    }
  }

  if (!resp.ok) {
    throw new Error(mensagemDoCorpo(json, resp.status));
  }

  return json as T;
}

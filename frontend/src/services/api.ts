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
  if (status === 401) return "Sua sessão expirou. Entre novamente.";
  if (status === 403) return "Você não tem permissão para realizar esta ação.";
  if (status === 404) return "O item solicitado não foi encontrado.";
  if (status >= 500) return "Não foi possível concluir a operação agora. Tente novamente em instantes.";
  return "Não foi possível concluir a operação. Confira os dados e tente novamente.";
}

export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opcoes.corpo !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (opcoes.token) {
    headers.Authorization = `Bearer ${opcoes.token}`;
  }

  let resp: Response;
  try {
    resp = await fetch(`${URL_API}${caminho}`, {
      method: opcoes.method ?? "GET",
      headers,
      body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
    });
  } catch {
    throw new Error("Não foi possível acessar o serviço. Verifique se a API está ligada e tente novamente.");
  }

  const texto = await resp.text();
  let json: unknown = {};
  if (texto !== "") {
    try {
      json = JSON.parse(texto) as unknown;
    } catch {
      throw new Error(
        resp.ok
          ? "Recebemos uma resposta inesperada. Tente novamente."
          : mensagemDoCorpo({}, resp.status),
      );
    }
  }

  if (!resp.ok) {
    throw new Error(mensagemDoCorpo(json, resp.status));
  }

  return json as T;
}

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const CHAVE_TOKEN = "token";

type MemoriaWeb = {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
  removeItem(chave: string): void;
};

// A aula 9 guarda o token no SecureStore (Keychain / Keystore).
// O exemplo da aula avisa que o SecureStore não existe na Web.
// O trabalho pede o app também na Web, então nesse caso o token fica
// só na sessão do navegador, e some quando a aba fecha.

function memoriaWeb(): MemoriaWeb | null {
  const navegador = globalThis as { sessionStorage?: MemoriaWeb };
  return navegador.sessionStorage ?? null;
}

export async function salvarToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    memoriaWeb()?.setItem(CHAVE_TOKEN, token);
    return;
  }
  await SecureStore.setItemAsync(CHAVE_TOKEN, token);
}

export async function lerToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return memoriaWeb()?.getItem(CHAVE_TOKEN) ?? null;
  }
  return SecureStore.getItemAsync(CHAVE_TOKEN);
}

export async function removerToken(): Promise<void> {
  if (Platform.OS === "web") {
    memoriaWeb()?.removeItem(CHAVE_TOKEN);
    return;
  }
  await SecureStore.deleteItemAsync(CHAVE_TOKEN);
}

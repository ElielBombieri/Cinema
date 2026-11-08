import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Usuario } from "../models/cinema";
import * as authService from "../services/authService";
import { lerToken, removerToken, salvarToken } from "../services/authStorage";

type AuthContextValue = {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    lerToken()
      .then(async (salvo) => {
        if (!salvo) return;
        const atual = await authService.eu(salvo);
        if (!ativo) return;
        setToken(salvo);
        setUsuario(atual);
      })
      .catch(async () => {
        await removerToken();
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function guardar(accessToken: string, dados: Usuario): Promise<void> {
    await salvarToken(accessToken);
    setToken(accessToken);
    setUsuario(dados);
  }

  async function entrar(email: string, senha: string): Promise<void> {
    const resposta = await authService.entrar(email, senha);
    await guardar(resposta.accessToken, authService.publico(resposta.usuario));
  }

  async function registrar(nome: string, email: string, senha: string): Promise<void> {
    const resposta = await authService.registrar(nome, email, senha);
    await guardar(resposta.accessToken, authService.publico(resposta.usuario));
  }

  async function sair(): Promise<void> {
    await removerToken();
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext value={{ usuario, token, carregando, entrar, registrar, sair }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

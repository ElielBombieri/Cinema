import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { Filme, Ingresso, LinhaRelatorio, MapaSessao, Reserva, Sala, SessaoResumo } from "../models/cinema";
import * as cinema from "../services/cinemaService";

function texto(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Erro desconhecido";
}

export function useSessoes(token: string) {
  const [sessoes, setSessoes] = useState<SessaoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setSessoes(await cinema.listarSessoes(token));
    } catch (e) {
      setErro(texto(e));
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar]),
  );

  return { sessoes, carregando, erro, recarregar };
}

export function useMapa(token: string, sessaoId: number) {
  const [mapa, setMapa] = useState<MapaSessao | null>(null);
  const [carregando, setCarregando] = useState(sessaoId > 0);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    if (sessaoId <= 0) {
      setMapa(null);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      setMapa(await cinema.buscarMapa(token, sessaoId));
    } catch (e) {
      setErro(texto(e));
    } finally {
      setCarregando(false);
    }
  }, [token, sessaoId]);

  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar]),
  );

  return { mapa, carregando, erro, recarregar };
}

export function useReservas(token: string) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setReservas(await cinema.minhasReservas(token));
    } catch (e) {
      setErro(texto(e));
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar]),
  );

  return { reservas, carregando, erro, recarregar };
}

export function useIngressos(token: string) {
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setIngressos(await cinema.meusIngressos(token));
    } catch (e) {
      setErro(texto(e));
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar]),
  );

  return { ingressos, carregando, erro, recarregar };
}

export function useFilmes(token: string) {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setFilmes(await cinema.listarFilmes(token));
    } catch (e) {
      setErro(texto(e));
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar]),
  );

  return { filmes, carregando, erro, recarregar };
}

export function useSalas(token: string) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setSalas(await cinema.listarSalas(token));
    } catch (e) {
      setErro(texto(e));
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar]),
  );

  return { salas, carregando, erro, recarregar };
}

export function useRelatorio(token: string) {
  const [linhas, setLinhas] = useState<LinhaRelatorio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setLinhas(await cinema.relatorioVendas(token));
    } catch (e) {
      setErro(texto(e));
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar]),
  );

  return { linhas, carregando, erro, recarregar };
}

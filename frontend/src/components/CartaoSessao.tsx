import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SessaoResumo } from "../models/cinema";
import { dataHora, reais } from "../services/formatar";

type Props = {
  sessao: SessaoResumo;
  aoPressionar?: () => void;
  acoes?: ReactNode;
};

export function CartaoSessao({ sessao, aoPressionar, acoes }: Props) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const intervalo = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(intervalo);
  }, []);
  const inicioMs = new Date(sessao.inicio).getTime();
  const fimMs = inicioMs + sessao.filme.duracaoMinutos * 60_000;
  const status = agora >= fimMs ? "Já passou" : agora >= inicioMs ? "Em andamento" : "Futura";
  const conteudo = (
    <View style={estilos.cartao}>
      <View style={estilos.cabecalho}>
        <View style={estilos.tituloEStatus}>
          <Text style={estilos.titulo}>{sessao.filme.titulo}</Text>
          <Text style={[estilos.status, status === "Já passou" ? estilos.statusPassou : status === "Em andamento" ? estilos.statusAndamento : estilos.statusFutura]}>
            {status}
          </Text>
        </View>
        {acoes ? <View style={estilos.acoes}>{acoes}</View> : null}
      </View>
      <Text style={estilos.linha}>{sessao.sala.nome}</Text>
      <Text style={estilos.linha}>{dataHora(sessao.inicio)}</Text>
      <Text style={estilos.linha}>{reais(sessao.preco)} · {sessao.livres} livres</Text>
    </View>
  );

  if (!aoPressionar) return conteudo;

  return <Pressable onPress={aoPressionar}>{conteudo}</Pressable>;
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    gap: 4,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  acoes: {
    flexDirection: "row",
    flexShrink: 0,
    gap: 6,
    marginTop: -3,
    marginRight: -3,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    flexShrink: 1,
  },
  tituloEStatus: {
    flex: 1,
    flexShrink: 1,
    gap: 5,
  },
  status: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700",
  },
  statusPassou: {
    color: "#475569",
    backgroundColor: "#e2e8f0",
  },
  statusAndamento: {
    color: "#92400e",
    backgroundColor: "#fef3c7",
  },
  statusFutura: {
    color: "#166534",
    backgroundColor: "#dcfce7",
  },
  linha: {
    fontSize: 15,
    color: "#334155",
  },
});

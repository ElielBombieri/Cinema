import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SessaoResumo } from "../models/cinema";
import { dataHora, reais } from "../services/formatar";

type Props = {
  sessao: SessaoResumo;
  aoPressionar?: () => void;
};

export function CartaoSessao({ sessao, aoPressionar }: Props) {
  const conteudo = (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>{sessao.filme.titulo}</Text>
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
  },
  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  linha: {
    fontSize: 15,
    color: "#334155",
  },
});

import { Redirect, router, Stack } from "expo-router";
import { Pressable, Platform, StyleSheet, View } from "react-native";
import { Aviso, Tela } from "../../components/Interface";
import { useAuth } from "../../context/AuthContext";

function voltarParaInicio() {
  return {
    headerLeft: () => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar para a tela inicial do operador"
        onPress={() => router.replace("/operador")}
        style={estilos.botaoInicio}
      >
        {Platform.OS === "web" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 12H4m0 0 7-7m-7 7 7 7" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <View style={estilos.iconeVoltar}>
            <View style={estilos.tracoSeta} />
            <View style={[estilos.pontaSeta, estilos.pontaSuperior]} />
            <View style={[estilos.pontaSeta, estilos.pontaInferior]} />
          </View>
        )}
      </Pressable>
    ),
  };
}

export default function LayoutOperador() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <Tela>
        <Aviso texto="Carregando..." />
      </Tela>
    );
  }
  if (!usuario) return <Redirect href="/login" />;
  if (usuario.papel !== "OPERADOR") return <Redirect href="/cliente" />;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Bilheteria", headerBackVisible: false, headerLeft: () => null }} />
      <Stack.Screen name="venda" options={{ title: "Venda no balcão", ...voltarParaInicio() }} />
      <Stack.Screen name="validar" options={{ title: "Validar ingresso", ...voltarParaInicio() }} />
      <Stack.Screen name="filmes" options={{ title: "Filmes", ...voltarParaInicio() }} />
      <Stack.Screen name="salas" options={{ title: "Salas", ...voltarParaInicio() }} />
      <Stack.Screen name="sessoes" options={{ title: "Sessões", ...voltarParaInicio() }} />
      <Stack.Screen name="relatorio" options={{ title: "Relatório", ...voltarParaInicio() }} />
    </Stack>
  );
}

const estilos = StyleSheet.create({
  botaoInicio: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 40,
    paddingVertical: 6,
  },
  iconeVoltar: {
    width: 20,
    height: 20,
    position: "relative",
  },
  tracoSeta: {
    position: "absolute",
    left: 4,
    top: 9,
    width: 13,
    height: 2,
    backgroundColor: "#111827",
    borderRadius: 1,
  },
  pontaSeta: {
    position: "absolute",
    width: 8,
    height: 2,
    left: 3,
    backgroundColor: "#111827",
    borderRadius: 1,
  },
  pontaSuperior: {
    top: 6,
    transform: [{ rotate: "-45deg" }],
  },
  pontaInferior: {
    top: 12,
    transform: [{ rotate: "45deg" }],
  },
});

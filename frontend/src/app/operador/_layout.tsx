import { Redirect, Stack } from "expo-router";
import { Aviso, Tela } from "../../components/Interface";
import { useAuth } from "../../context/AuthContext";

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
      <Stack.Screen name="index" options={{ title: "Bilheteria" }} />
      <Stack.Screen name="venda" options={{ title: "Venda no balcão" }} />
      <Stack.Screen name="validar" options={{ title: "Validar ingresso" }} />
      <Stack.Screen name="filmes" options={{ title: "Filmes" }} />
      <Stack.Screen name="salas" options={{ title: "Salas" }} />
      <Stack.Screen name="sessoes" options={{ title: "Sessões" }} />
      <Stack.Screen name="relatorio" options={{ title: "Relatório" }} />
    </Stack>
  );
}

import { Redirect, Stack } from "expo-router";
import { Aviso, Tela } from "../../components/Interface";
import { useAuth } from "../../context/AuthContext";

export default function LayoutCliente() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <Tela>
        <Aviso texto="Carregando..." />
      </Tela>
    );
  }
  if (!usuario) return <Redirect href="/login" />;
  if (usuario.papel !== "CLIENTE") return <Redirect href="/operador" />;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Sessões" }} />
      <Stack.Screen name="sessao/[id]" options={{ title: "Assentos" }} />
      <Stack.Screen name="reservas" options={{ title: "Reservas" }} />
      <Stack.Screen name="ingressos" options={{ title: "Ingressos" }} />
    </Stack>
  );
}

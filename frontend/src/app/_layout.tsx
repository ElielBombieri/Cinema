import { Stack, type ErrorBoundaryProps } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { Botao, Tela, Texto, Titulo } from "../components/Interface";

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <Tela>
      <Titulo>Não foi possível abrir esta tela</Titulo>
      <Texto>Tente novamente. Se o problema continuar, feche e abra o aplicativo.</Texto>
      <Botao titulo="Tentar novamente" aoPressionar={retry} />
    </Tela>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: "Entrar" }} />
        <Stack.Screen name="cadastro" options={{ title: "Cadastro" }} />
        <Stack.Screen name="cliente" options={{ headerShown: false }} />
        <Stack.Screen name="operador" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}

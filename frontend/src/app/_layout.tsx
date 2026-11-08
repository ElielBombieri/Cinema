import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

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

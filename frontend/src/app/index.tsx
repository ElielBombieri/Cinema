import { Redirect } from "expo-router";
import { Aviso, Tela } from "../components/Interface";
import { useAuth } from "../context/AuthContext";

export default function Inicio() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <Tela>
        <Aviso texto="Carregando..." />
      </Tela>
    );
  }

  if (!usuario) return <Redirect href="/login" />;
  if (usuario.papel === "OPERADOR") return <Redirect href="/operador" />;
  return <Redirect href="/cliente" />;
}

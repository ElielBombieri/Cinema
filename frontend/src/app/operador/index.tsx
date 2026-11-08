import { router } from "expo-router";
import { Botao, Tela, Texto, Titulo } from "../../components/Interface";
import { useAuth } from "../../context/AuthContext";

export default function InicioOperador() {
  const { usuario, sair } = useAuth();

  return (
    <Tela>
      <Titulo>Bilheteria</Titulo>
      <Texto>{usuario?.nome ?? ""}</Texto>
      <Botao titulo="Vender no balcão" aoPressionar={() => router.push("/operador/venda")} />
      <Botao titulo="Validar ingresso" aoPressionar={() => router.push("/operador/validar")} />
      <Botao titulo="Cadastrar filme" aoPressionar={() => router.push("/operador/filmes")} secundario />
      <Botao titulo="Cadastrar sala" aoPressionar={() => router.push("/operador/salas")} secundario />
      <Botao titulo="Cadastrar sessão" aoPressionar={() => router.push("/operador/sessoes")} secundario />
      <Botao titulo="Relatório de vendas" aoPressionar={() => router.push("/operador/relatorio")} secundario />
      <Botao titulo="Sair" aoPressionar={() => void sair().then(() => router.replace("/login"))} secundario />
    </Tela>
  );
}

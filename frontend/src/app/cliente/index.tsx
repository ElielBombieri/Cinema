import { router } from "expo-router";
import { Aviso, Botao, Erro, Tela, Texto, Titulo } from "../../components/Interface";
import { CartaoSessao } from "../../components/CartaoSessao";
import { useAuth } from "../../context/AuthContext";
import { useSessoes } from "../../hooks/consultas";

export default function SessoesCliente() {
  const { token, usuario, sair } = useAuth();
  const { sessoes, carregando, erro, recarregar } = useSessoes(token ?? "");

  return (
    <Tela>
      <Titulo>Olá, {usuario?.nome ?? ""}</Titulo>
      <Texto>Escolha uma sessão para ver os assentos.</Texto>
      <Botao titulo="Minhas reservas" aoPressionar={() => router.push("/cliente/reservas")} secundario />
      <Botao titulo="Meus ingressos" aoPressionar={() => router.push("/cliente/ingressos")} secundario />
      {carregando ? <Aviso texto="Carregando sessões..." /> : null}
      {erro ? <Erro texto={erro} /> : null}
      {erro ? <Botao titulo="Tentar novamente" aoPressionar={() => void recarregar()} secundario /> : null}
      {!carregando && !erro && sessoes.length === 0 ? <Aviso texto="Nenhuma sessão cadastrada." /> : null}
      {sessoes.map((sessao) => (
        <CartaoSessao
          key={sessao.id}
          sessao={sessao}
          aoPressionar={() => router.push(`/cliente/sessao/${sessao.id}`)}
        />
      ))}
      <Botao titulo="Sair" aoPressionar={() => void sair().then(() => router.replace("/login"))} secundario />
    </Tela>
  );
}

import { Aviso, Botao, Erro, Tela, Texto, Titulo } from "../../components/Interface";
import { useAuth } from "../../context/AuthContext";
import { useRelatorio } from "../../hooks/consultas";
import { dataHora, reais } from "../../services/formatar";

export default function Relatorio() {
  const { token } = useAuth();
  const { linhas, carregando, erro, recarregar } = useRelatorio(token ?? "");

  return (
    <Tela>
      <Titulo>Vendas e ocupação</Titulo>
      <Texto>A ocupação é a porcentagem de assentos vendidos em cada sessão.</Texto>
      {carregando ? <Aviso texto="Carregando relatório..." /> : null}
      {erro ? <Erro texto={erro} /> : null}
      {erro ? <Botao titulo="Tentar novamente" aoPressionar={() => void recarregar()} secundario /> : null}
      {!carregando && !erro && linhas.length === 0 ? <Aviso texto="Nenhuma sessão para mostrar." /> : null}
      {linhas.map((linha) => (
        <Texto key={`${linha.filme}-${linha.sala}-${linha.inicio}`}>
          {linha.filme} · {linha.sala} · {dataHora(linha.inicio)} · {reais(linha.preco)} · vendidos {linha.vendidos} de{" "}
          {linha.capacidade} · reservados {linha.reservados} · livres {linha.livres} · ocupação {linha.ocupacao}% ·
          total {reais(linha.totalVendas)}
        </Texto>
      ))}
    </Tela>
  );
}

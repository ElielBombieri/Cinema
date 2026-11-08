import { Aviso, Botao, Erro, Tela, Texto, Titulo } from "../../components/Interface";
import { useAuth } from "../../context/AuthContext";
import { useIngressos } from "../../hooks/consultas";
import { dataHora, reais } from "../../services/formatar";

export default function IngressosCliente() {
  const { token } = useAuth();
  const { ingressos, carregando, erro, recarregar } = useIngressos(token ?? "");

  return (
    <Tela>
      <Titulo>Meus ingressos</Titulo>
      {carregando ? <Aviso texto="Carregando ingressos..." /> : null}
      {erro ? <Erro texto={erro} /> : null}
      {erro ? <Botao titulo="Tentar novamente" aoPressionar={() => void recarregar()} secundario /> : null}
      {!carregando && !erro && ingressos.length === 0 ? <Aviso texto="Nenhum ingresso emitido." /> : null}
      {ingressos.map((ingresso) => (
        <Texto key={ingresso.codigo}>
          {ingresso.codigo} · {ingresso.filme} · {ingresso.sala} · {dataHora(ingresso.inicio)} · {ingresso.fila}
          {ingresso.numero} · {reais(ingresso.valor)}
          {ingresso.utilizadoEm ? " · já utilizado" : " · válido"}
        </Texto>
      ))}
    </Tela>
  );
}

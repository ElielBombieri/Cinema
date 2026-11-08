import { useState } from "react";
import { Aviso, Botao, Campo, Erro, Tela, Texto, Titulo } from "../../components/Interface";
import { CartaoSessao } from "../../components/CartaoSessao";
import { MapaAssentos } from "../../components/MapaAssentos";
import { useAuth } from "../../context/AuthContext";
import { useMapa, useSessoes } from "../../hooks/consultas";
import type { AssentoEscolhido, IngressoEmitido } from "../../models/cinema";
import * as cinema from "../../services/cinemaService";
import { dataHora, reais, textoDoErro } from "../../services/formatar";

function alternar(lista: AssentoEscolhido[], assento: AssentoEscolhido): AssentoEscolhido[] {
  const existe = lista.some((item) => item.fila === assento.fila && item.numero === assento.numero);
  if (existe) return lista.filter((item) => item.fila !== assento.fila || item.numero !== assento.numero);
  return [...lista, assento];
}

export default function VendaBalcao() {
  const { token } = useAuth();
  const { sessoes, carregando, erro, recarregar } = useSessoes(token ?? "");
  const [sessaoId, setSessaoId] = useState(0);
  const { mapa, carregando: carregandoMapa, erro: erroMapa, recarregar: recarregarMapa } = useMapa(token ?? "", sessaoId);
  const [escolhidos, setEscolhidos] = useState<AssentoEscolhido[]>([]);
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [ingressos, setIngressos] = useState<IngressoEmitido[] | null>(null);

  const vender = async () => {
    if (!token) return;
    setEnviando(true);
    setErroAcao(null);
    try {
      const resultado = await cinema.vender(token, email, sessaoId, escolhidos);
      setIngressos(resultado.ingressos);
      setEscolhidos([]);
      await recarregarMapa();
      await recarregar();
    } catch (e) {
      setErroAcao(textoDoErro(e));
    } finally {
      setEnviando(false);
    }
  };

  const sessao = sessoes.find((item) => item.id === sessaoId);

  return (
    <Tela>
      <Titulo>Venda no balcão</Titulo>
      {sessaoId === 0 ? <Texto>Escolha a sessão. O pagamento é simulado.</Texto> : null}
      {carregando ? <Aviso texto="Carregando sessões..." /> : null}
      {erro ? <Erro texto={erro} /> : null}
      {sessaoId === 0
        ? sessoes.map((item) => (
            <CartaoSessao
              key={item.id}
              sessao={item}
              aoPressionar={() => {
                setSessaoId(item.id);
                setEscolhidos([]);
                setIngressos(null);
                setErroAcao(null);
              }}
            />
          ))
        : null}
      {sessao && sessaoId > 0 ? (
        <>
          <Botao
            titulo="Trocar sessão"
            aoPressionar={() => {
              setSessaoId(0);
              setEscolhidos([]);
            }}
            secundario
          />
          <Texto>
            {sessao.filme.titulo} · {sessao.sala.nome} · {dataHora(sessao.inicio)} · {reais(sessao.preco)}
          </Texto>
        </>
      ) : null}
      {carregandoMapa && sessaoId > 0 ? <Aviso texto="Carregando mapa..." /> : null}
      {erroMapa ? <Erro texto={erroMapa} /> : null}
      {mapa && sessaoId > 0 ? (
        <MapaAssentos
          assentos={mapa.assentos}
          escolhidos={escolhidos}
          aoEscolher={(assento) => setEscolhidos((atual) => alternar(atual, assento))}
        />
      ) : null}
      {sessaoId > 0 ? (
        <Campo rotulo="E-mail do cliente" valor={email} aoMudar={setEmail} teclado="email-address" semMaiusculas />
      ) : null}
      {sessaoId > 0 && escolhidos.length > 0 ? (
        <Botao
          titulo={enviando ? "Vendendo..." : "Confirmar venda"}
          aoPressionar={() => void vender()}
          desabilitado={enviando}
        />
      ) : null}
      {ingressos ? (
        <>
          <Titulo>Ingressos emitidos</Titulo>
          {ingressos.map((ingresso) => (
            <Texto key={ingresso.codigo}>
              {ingresso.codigo} · {ingresso.fila}
              {ingresso.numero} · {reais(ingresso.valor)}
            </Texto>
          ))}
        </>
      ) : null}
      {erroAcao ? <Erro texto={erroAcao} /> : null}
    </Tela>
  );
}

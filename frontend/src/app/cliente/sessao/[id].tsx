import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Aviso, Botao, Erro, Tela, Texto, Titulo } from "../../../components/Interface";
import { MapaAssentos } from "../../../components/MapaAssentos";
import { useAuth } from "../../../context/AuthContext";
import { useMapa } from "../../../hooks/consultas";
import type { AssentoEscolhido, IngressoEmitido, Reserva } from "../../../models/cinema";
import * as cinema from "../../../services/cinemaService";
import { dataHora, reais, textoDoErro } from "../../../services/formatar";

function numeroDaRota(valor: string | string[] | undefined): number {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  const numero = Number(texto);
  return Number.isInteger(numero) && numero > 0 ? numero : 0;
}

function alternar(lista: AssentoEscolhido[], assento: AssentoEscolhido): AssentoEscolhido[] {
  const existe = lista.some((item) => item.fila === assento.fila && item.numero === assento.numero);
  if (existe) return lista.filter((item) => item.fila !== assento.fila || item.numero !== assento.numero);
  return [...lista, assento];
}

export default function MapaCliente() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessaoId = numeroDaRota(id);
  const { token } = useAuth();
  const { mapa, carregando, erro, recarregar } = useMapa(token ?? "", sessaoId);
  const [escolhidos, setEscolhidos] = useState<AssentoEscolhido[]>([]);
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [ingressos, setIngressos] = useState<IngressoEmitido[] | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const reservar = async () => {
    if (!token) return;
    setEnviando(true);
    setErroAcao(null);
    try {
      const criada = await cinema.reservar(token, sessaoId, escolhidos);
      setReserva(criada);
      setEscolhidos([]);
      await recarregar();
    } catch (e) {
      setErroAcao(textoDoErro(e));
    } finally {
      setEnviando(false);
    }
  };

  const pagar = async () => {
    if (!token || !reserva) return;
    setEnviando(true);
    setErroAcao(null);
    try {
      const resultado = await cinema.pagar(token, reserva.id);
      setIngressos(resultado.ingressos);
      setReserva(null);
      await recarregar();
    } catch (e) {
      setErroAcao(textoDoErro(e));
      setReserva(null);
      await recarregar();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tela>
      {carregando ? <Aviso texto="Carregando mapa..." /> : null}
      {erro ? <Erro texto={erro} /> : null}
      {erro ? <Botao titulo="Tentar novamente" aoPressionar={() => void recarregar()} secundario /> : null}
      {mapa ? (
        <>
          <Titulo>{mapa.filme.titulo}</Titulo>
          <Texto>{mapa.filme.sinopse}</Texto>
          <Texto>
            {mapa.sala.nome} · {dataHora(mapa.inicio)} · {reais(mapa.preco)}
          </Texto>
          <Texto>{mapa.filme.duracaoMinutos} minutos</Texto>
          <MapaAssentos
            assentos={mapa.assentos}
            escolhidos={escolhidos}
            aoEscolher={(assento) => setEscolhidos((atual) => alternar(atual, assento))}
          />
        </>
      ) : null}
      {escolhidos.length > 0 ? (
        <Botao
          titulo={enviando ? "Reservando..." : "Reservar assentos"}
          aoPressionar={() => void reservar()}
          desabilitado={enviando}
        />
      ) : null}
      {reserva && reserva.status === "ABERTA" ? (
        <>
          <Texto>
            Reserva até {dataHora(reserva.expiraEm)}. Total {reais(reserva.valorTotal)}.
          </Texto>
          <Texto>Assentos: {reserva.assentos.map((item) => `${item.fila}${item.numero}`).join(", ")}</Texto>
          <Botao titulo={enviando ? "Pagando..." : "Pagar"} aoPressionar={() => void pagar()} desabilitado={enviando} />
        </>
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

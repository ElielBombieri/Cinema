import { useState } from "react";
import { Aviso, Botao, Erro, Tela, Texto, Titulo } from "../../components/Interface";
import { useAuth } from "../../context/AuthContext";
import { useReservas } from "../../hooks/consultas";
import type { IngressoEmitido, Reserva } from "../../models/cinema";
import * as cinema from "../../services/cinemaService";
import { dataHora, reais, textoDoErro } from "../../services/formatar";

function statusLegivel(status: Reserva["status"]): string {
  if (status === "ABERTA") return "aberta";
  if (status === "PAGA") return "paga";
  if (status === "EXPIRADA") return "expirada";
  return "cancelada";
}

export default function ReservasCliente() {
  const { token } = useAuth();
  const { reservas, carregando, erro, recarregar } = useReservas(token ?? "");
  const [enviandoId, setEnviandoId] = useState<number | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [ingressos, setIngressos] = useState<IngressoEmitido[] | null>(null);

  const pagar = async (reservaId: number) => {
    if (!token) return;
    setEnviandoId(reservaId);
    setErroAcao(null);
    try {
      const resultado = await cinema.pagar(token, reservaId);
      setIngressos(resultado.ingressos);
      await recarregar();
    } catch (e) {
      setErroAcao(textoDoErro(e));
      await recarregar();
    } finally {
      setEnviandoId(null);
    }
  };

  return (
    <Tela>
      <Titulo>Minhas reservas</Titulo>
      {carregando ? <Aviso texto="Carregando reservas..." /> : null}
      {erro ? <Erro texto={erro} /> : null}
      {erro ? <Botao titulo="Tentar novamente" aoPressionar={() => void recarregar()} secundario /> : null}
      {!carregando && !erro && reservas.length === 0 ? <Aviso texto="Você ainda não tem reservas." /> : null}
      {reservas.map((reserva) => (
        <Texto key={reserva.id}>
          {reserva.filme} · {reserva.sala} · {dataHora(reserva.inicio)} · {statusLegivel(reserva.status)} ·{" "}
          {reserva.assentos.map((item) => `${item.fila}${item.numero}`).join(", ")}
          {reserva.status === "ABERTA" ? ` · até ${dataHora(reserva.expiraEm)} · ${reais(reserva.valorTotal)}` : ""}
        </Texto>
      ))}
      {reservas
        .filter((reserva) => reserva.status === "ABERTA")
        .map((reserva) => (
          <Botao
            key={`pagar-${reserva.id}`}
            titulo={
              enviandoId === reserva.id
                ? "Pagando..."
                : `Pagar ${reserva.filme} (${reserva.assentos.map((item) => `${item.fila}${item.numero}`).join(", ")})`
            }
            aoPressionar={() => void pagar(reserva.id)}
            desabilitado={enviandoId !== null}
          />
        ))}
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

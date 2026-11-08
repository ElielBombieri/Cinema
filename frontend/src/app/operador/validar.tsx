import { useState } from "react";
import { Botao, Campo, Erro, Tela, Texto, Titulo } from "../../components/Interface";
import { useAuth } from "../../context/AuthContext";
import type { Ingresso } from "../../models/cinema";
import * as cinema from "../../services/cinemaService";
import { dataHora, reais, textoDoErro } from "../../services/formatar";

export default function ValidarIngresso() {
  const { token } = useAuth();
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ingresso, setIngresso] = useState<Ingresso | null>(null);

  const validar = async () => {
    if (!token) return;
    setEnviando(true);
    setErro(null);
    setIngresso(null);
    try {
      const resultado = await cinema.validarIngresso(token, codigo);
      setIngresso(resultado);
      setCodigo("");
    } catch (e) {
      setErro(textoDoErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tela>
      <Titulo>Entrada</Titulo>
      <Texto>Informe o código do ingresso. Se estiver válido, ele será marcado como utilizado.</Texto>
      <Campo rotulo="Código" valor={codigo} aoMudar={setCodigo} semMaiusculas />
      <Botao titulo={enviando ? "Validando..." : "Validar"} aoPressionar={() => void validar()} desabilitado={enviando} />
      {erro ? <Erro texto={erro} /> : null}
      {ingresso ? (
        <>
          <Texto>Ingresso aceito.</Texto>
          <Texto>
            {ingresso.filme} · {ingresso.sala} · {dataHora(ingresso.inicio)}
          </Texto>
          <Texto>
            Assento {ingresso.fila}
            {ingresso.numero} · {ingresso.cliente} · {reais(ingresso.valor)}
          </Texto>
        </>
      ) : null}
    </Tela>
  );
}

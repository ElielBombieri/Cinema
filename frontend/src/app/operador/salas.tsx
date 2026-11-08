import { useState } from "react";
import { Aviso, Botao, Campo, Erro, Tela, Texto, Titulo } from "../../components/Interface";
import { useAuth } from "../../context/AuthContext";
import { useSalas } from "../../hooks/consultas";
import * as cinema from "../../services/cinemaService";
import { textoDoErro } from "../../services/formatar";

export default function Salas() {
  const { token } = useAuth();
  const { salas, carregando, erro, recarregar } = useSalas(token ?? "");
  const [nome, setNome] = useState("");
  const [filas, setFilas] = useState("");
  const [porFila, setPorFila] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const salvar = async () => {
    if (!token) return;
    setEnviando(true);
    setErroAcao(null);
    try {
      await cinema.criarSala(token, { nome, filas, assentosPorFila: porFila });
      setNome("");
      setFilas("");
      setPorFila("");
      await recarregar();
    } catch (e) {
      setErroAcao(textoDoErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tela>
      <Titulo>Salas</Titulo>
      <Texto>As filas são geradas de A em diante. Informe só o nome e o tamanho da sala.</Texto>
      <Campo rotulo="Nome da sala" valor={nome} aoMudar={setNome} />
      <Campo rotulo="Quantidade de filas" valor={filas} aoMudar={setFilas} teclado="number-pad" />
      <Campo rotulo="Assentos por fila" valor={porFila} aoMudar={setPorFila} teclado="number-pad" />
      {erroAcao ? <Erro texto={erroAcao} /> : null}
      <Botao titulo={enviando ? "Salvando..." : "Cadastrar sala"} aoPressionar={() => void salvar()} desabilitado={enviando} />
      {carregando ? <Aviso texto="Carregando salas..." /> : null}
      {erro ? <Erro texto={erro} /> : null}
      {salas.map((sala) => (
        <Texto key={sala.id}>
          {sala.nome} · {sala.assentos.length} assentos
        </Texto>
      ))}
    </Tela>
  );
}

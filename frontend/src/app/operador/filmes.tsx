import { useState } from "react";
import { Aviso, Botao, Campo, Erro, Tela, Texto, Titulo } from "../../components/Interface";
import { useAuth } from "../../context/AuthContext";
import { useFilmes } from "../../hooks/consultas";
import * as cinema from "../../services/cinemaService";
import { textoDoErro } from "../../services/formatar";

export default function Filmes() {
  const { token } = useAuth();
  const { filmes, carregando, erro, recarregar } = useFilmes(token ?? "");
  const [titulo, setTitulo] = useState("");
  const [sinopse, setSinopse] = useState("");
  const [duracao, setDuracao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const salvar = async () => {
    if (!token) return;
    setEnviando(true);
    setErroAcao(null);
    try {
      await cinema.criarFilme(token, { titulo, sinopse, duracaoMinutos: duracao });
      setTitulo("");
      setSinopse("");
      setDuracao("");
      await recarregar();
    } catch (e) {
      setErroAcao(textoDoErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tela>
      <Titulo>Filmes</Titulo>
      <Campo rotulo="Título" valor={titulo} aoMudar={setTitulo} />
      <Campo rotulo="Sinopse" valor={sinopse} aoMudar={setSinopse} variasLinhas />
      <Campo rotulo="Duração em minutos" valor={duracao} aoMudar={setDuracao} teclado="number-pad" />
      {erroAcao ? <Erro texto={erroAcao} /> : null}
      <Botao titulo={enviando ? "Salvando..." : "Cadastrar filme"} aoPressionar={() => void salvar()} desabilitado={enviando} />
      {carregando ? <Aviso texto="Carregando filmes..." /> : null}
      {erro ? <Erro texto={erro} /> : null}
      {filmes.map((filme) => (
        <Texto key={filme.id}>
          {filme.titulo} · {filme.duracaoMinutos} min · {filme.sinopse}
        </Texto>
      ))}
    </Tela>
  );
}

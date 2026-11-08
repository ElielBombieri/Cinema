import { useState } from "react";
import { Aviso, Botao, Campo, Erro, Tela, Texto, Titulo } from "../../components/Interface";
import { CartaoSessao } from "../../components/CartaoSessao";
import { useAuth } from "../../context/AuthContext";
import { useFilmes, useSalas, useSessoes } from "../../hooks/consultas";
import * as cinema from "../../services/cinemaService";
import { textoDoErro } from "../../services/formatar";

export default function Sessoes() {
  const { token } = useAuth();
  const filmes = useFilmes(token ?? "");
  const salas = useSalas(token ?? "");
  const sessoes = useSessoes(token ?? "");
  const [filmeId, setFilmeId] = useState(0);
  const [salaId, setSalaId] = useState(0);
  const [inicio, setInicio] = useState("");
  const [preco, setPreco] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const filme = filmes.filmes.find((item) => item.id === filmeId);
  const sala = salas.salas.find((item) => item.id === salaId);

  const salvar = async () => {
    if (!token || !filme || !sala) {
      setErroAcao("Escolha o filme e a sala.");
      return;
    }
    setEnviando(true);
    setErroAcao(null);
    try {
      await cinema.criarSessao(token, { filmeId: filme.id, salaId: sala.id, inicio, preco });
      setInicio("");
      setPreco("");
      await sessoes.recarregar();
    } catch (e) {
      setErroAcao(textoDoErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tela>
      <Titulo>Nova sessão</Titulo>
      <Texto>Data e hora no formato AAAA-MM-DD HH:MM. O preço é por assento.</Texto>
      <Texto>Filme: {filme ? filme.titulo : "nenhum"}</Texto>
      {filmes.carregando ? <Aviso texto="Carregando filmes..." /> : null}
      {filmes.erro ? <Erro texto={filmes.erro} /> : null}
      {filmes.filmes.map((item) => (
        <Botao
          key={item.id}
          titulo={item.titulo}
          aoPressionar={() => setFilmeId(item.id)}
          secundario={item.id !== filmeId}
        />
      ))}
      <Texto>Sala: {sala ? sala.nome : "nenhuma"}</Texto>
      {salas.carregando ? <Aviso texto="Carregando salas..." /> : null}
      {salas.erro ? <Erro texto={salas.erro} /> : null}
      {salas.salas.map((item) => (
        <Botao
          key={item.id}
          titulo={`${item.nome} (${item.assentos.length} assentos)`}
          aoPressionar={() => setSalaId(item.id)}
          secundario={item.id !== salaId}
        />
      ))}
      <Campo rotulo="Data e hora" valor={inicio} aoMudar={setInicio} semMaiusculas />
      <Campo rotulo="Preço" valor={preco} aoMudar={setPreco} teclado="decimal-pad" semMaiusculas />
      {erroAcao ? <Erro texto={erroAcao} /> : null}
      <Botao titulo={enviando ? "Salvando..." : "Cadastrar sessão"} aoPressionar={() => void salvar()} desabilitado={enviando} />
      {sessoes.carregando ? <Aviso texto="Carregando sessões..." /> : null}
      {sessoes.erro ? <Erro texto={sessoes.erro} /> : null}
      {sessoes.sessoes.map((item) => (
        <CartaoSessao key={item.id} sessao={item} />
      ))}
    </Tela>
  );
}

import { useState } from "react";
import { Aviso, Botao, BotaoIconeAcao, CabecalhoCadastro, Campo, CartaoCadastro, confirmarExclusao, Erro, Tela, Texto, Titulo } from "../../components/Interface";
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
  const [editando, setEditando] = useState<number | null>(null);

  const salvar = async () => {
    if (!token) return;
    setEnviando(true);
    setErroAcao(null);
    try {
      const dados = { titulo, sinopse, duracaoMinutos: duracao };
      if (editando === null) await cinema.criarFilme(token, dados);
      else await cinema.atualizarFilme(token, editando, dados);
      setEditando(null);
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

  const editar = (filme: (typeof filmes)[number]) => {
    setEditando(filme.id); setTitulo(filme.titulo); setSinopse(filme.sinopse); setDuracao(String(filme.duracaoMinutos)); setErroAcao(null);
  };
  const excluir = async (id: number) => {
    if (!token) return;
    if (!(await confirmarExclusao("Tem certeza de que deseja excluir este filme?"))) return;
    setEnviando(true); setErroAcao(null);
    try { await cinema.excluirFilme(token, id); await recarregar(); }
    catch (e) { setErroAcao(textoDoErro(e)); }
    finally { setEnviando(false); }
  };

  return (
    <Tela>
      <Titulo>Filmes</Titulo>
      <Campo rotulo="Título" valor={titulo} aoMudar={setTitulo} />
      <Campo rotulo="Sinopse" valor={sinopse} aoMudar={setSinopse} variasLinhas />
      <Campo rotulo="Duração em minutos" valor={duracao} aoMudar={setDuracao} teclado="number-pad" />
      {erroAcao ? <Erro texto={erroAcao} /> : null}
      <Botao titulo={enviando ? "Salvando..." : editando === null ? "Cadastrar filme" : "Salvar alterações"} aoPressionar={() => void salvar()} desabilitado={enviando} />
      {editando !== null ? <Botao titulo="Cancelar edição" secundario aoPressionar={() => { setEditando(null); setTitulo(""); setSinopse(""); setDuracao(""); }} /> : null}
      {carregando ? <Aviso texto="Carregando filmes..." /> : null}
      {erro ? <Erro texto={erro} /> : null}
      {filmes.map((filme) => (
        <CartaoCadastro key={filme.id}>
          <CabecalhoCadastro acoes={
            <>
              <BotaoIconeAcao tipo="editar" aoPressionar={() => editar(filme)} />
              <BotaoIconeAcao tipo="excluir" desabilitado={enviando} aoPressionar={() => void excluir(filme.id)} />
            </>
          }>
            <Texto>{filme.titulo}</Texto>
            <Texto>{filme.duracaoMinutos} min</Texto>
          </CabecalhoCadastro>
          <Texto>{filme.sinopse}</Texto>
        </CartaoCadastro>
      ))}
    </Tela>
  );
}

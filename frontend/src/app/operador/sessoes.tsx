import { Fragment, useState } from "react";
import { Aviso, Botao, BotaoIconeAcao, Campo, confirmarExclusao, Erro, Tela, Texto, Titulo } from "../../components/Interface";
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
  const [editando, setEditando] = useState<number | null>(null);

  const filme = filmes.filmes.find((item) => item.id === filmeId);
  const sala = salas.salas.find((item) => item.id === salaId);

  const salvar = async () => {
    if (!token || !filme || !sala) {
      setErroAcao("Escolha o filme e a sala.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(inicio)) {
      setErroAcao("Escolha a data e a hora no calendário.");
      return;
    }
    const dataHoraLocal = new Date(inicio);
    const [data] = inicio.split("T");
    if (
      Number.isNaN(dataHoraLocal.getTime()) ||
      dataHoraLocal.getFullYear() !== Number(data.slice(0, 4)) ||
      dataHoraLocal.getMonth() + 1 !== Number(data.slice(5, 7)) ||
      dataHoraLocal.getDate() !== Number(data.slice(8, 10))
    ) {
      setErroAcao("A data informada não existe. Confira dia, mês e ano.");
      return;
    }
    if (dataHoraLocal <= new Date()) {
      setErroAcao("Escolha uma data e hora futuras.");
      return;
    }
    setEnviando(true);
    setErroAcao(null);
    try {
      const dados = { filmeId: filme.id, salaId: sala.id, inicio, preco };
      if (editando === null) await cinema.criarSessao(token, dados);
      else await cinema.atualizarSessao(token, editando, dados);
      setEditando(null);
      setInicio("");
      setPreco("");
      await sessoes.recarregar();
    } catch (e) {
      setErroAcao(textoDoErro(e));
    } finally {
      setEnviando(false);
    }
  };

  const editar = (item: (typeof sessoes.sessoes)[number]) => {
    const data = new Date(item.inicio);
    const local = new Date(data.getTime() - data.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEditando(item.id); setFilmeId(item.filmeId); setSalaId(item.salaId); setInicio(local); setPreco(String(item.preco)); setErroAcao(null);
  };
  const excluir = async (id: number) => {
    if (!token) return;
    if (!(await confirmarExclusao("Tem certeza de que deseja excluir esta sessão?"))) return;
    setEnviando(true); setErroAcao(null);
    try { await cinema.excluirSessao(token, id); await sessoes.recarregar(); }
    catch (e) { setErroAcao(textoDoErro(e)); }
    finally { setEnviando(false); }
  };

  return (
    <Tela>
      <Titulo>{editando === null ? "Nova sessão" : "Editar sessão"}</Titulo>
      <Texto>Selecione a data e a hora no calendário. O preço é por assento.</Texto>
      <Texto>Entre o fim de uma sessão e o início da próxima, deixe pelo menos 1 minuto.</Texto>
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
      <Campo rotulo="Data e hora" valor={inicio} aoMudar={setInicio} tipo="datetime-local" placeholder="Selecione data e hora" />
      <Campo rotulo="Preço" valor={preco} aoMudar={setPreco} teclado="decimal-pad" semMaiusculas />
      {erroAcao ? <Erro texto={erroAcao} /> : null}
      <Botao titulo={enviando ? "Salvando..." : editando === null ? "Cadastrar sessão" : "Salvar alterações"} aoPressionar={() => void salvar()} desabilitado={enviando} />
      {editando !== null ? <Botao titulo="Cancelar edição" secundario aoPressionar={() => { setEditando(null); setInicio(""); setPreco(""); }} /> : null}
      {sessoes.carregando ? <Aviso texto="Carregando sessões..." /> : null}
      {sessoes.erro ? <Erro texto={sessoes.erro} /> : null}
      {sessoes.sessoes.map((item) => (
        <Fragment key={item.id}>
          <CartaoSessao sessao={item} acoes={
            <>
            <BotaoIconeAcao tipo="editar" aoPressionar={() => editar(item)} />
            <BotaoIconeAcao tipo="excluir" desabilitado={enviando} aoPressionar={() => void excluir(item.id)} />
            </>
          } />
        </Fragment>
      ))}
    </Tela>
  );
}

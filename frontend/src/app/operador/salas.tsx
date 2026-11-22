import { useState } from "react";
import { Aviso, Botao, BotaoIconeAcao, CabecalhoCadastro, Campo, CartaoCadastro, confirmarExclusao, Erro, Tela, Texto, Titulo } from "../../components/Interface";
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
  const [editando, setEditando] = useState<number | null>(null);

  const salvar = async () => {
    if (!token) return;
    setEnviando(true);
    setErroAcao(null);
    try {
      const dados = { nome, filas, assentosPorFila: porFila };
      if (editando === null) await cinema.criarSala(token, dados);
      else await cinema.atualizarSala(token, editando, dados);
      setEditando(null);
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

  const editar = (item: (typeof salas)[number]) => {
    const grades = new Map<string, number>();
    item.assentos.forEach((a) => grades.set(a.fila, (grades.get(a.fila) ?? 0) + 1));
    setEditando(item.id); setNome(item.nome); setFilas(String(grades.size)); setPorFila(String(grades.values().next().value ?? 0)); setErroAcao(null);
  };
  const excluir = async (id: number) => {
    if (!token) return;
    if (!(await confirmarExclusao("Tem certeza de que deseja excluir esta sala?"))) return;
    setEnviando(true); setErroAcao(null);
    try { await cinema.excluirSala(token, id); await recarregar(); }
    catch (e) { setErroAcao(textoDoErro(e)); }
    finally { setEnviando(false); }
  };

  return (
    <Tela>
      <Titulo>Salas</Titulo>
      <Texto>As filas são geradas de A em diante. Informe só o nome e o tamanho da sala.</Texto>
      <Campo rotulo="Nome da sala" valor={nome} aoMudar={setNome} />
      <Campo rotulo="Quantidade de filas" valor={filas} aoMudar={setFilas} teclado="number-pad" />
      <Campo rotulo="Assentos por fila" valor={porFila} aoMudar={setPorFila} teclado="number-pad" />
      {erroAcao ? <Erro texto={erroAcao} /> : null}
      <Botao titulo={enviando ? "Salvando..." : editando === null ? "Cadastrar sala" : "Salvar alterações"} aoPressionar={() => void salvar()} desabilitado={enviando} />
      {editando !== null ? <Botao titulo="Cancelar edição" secundario aoPressionar={() => { setEditando(null); setNome(""); setFilas(""); setPorFila(""); }} /> : null}
      {carregando ? <Aviso texto="Carregando salas..." /> : null}
      {erro ? <Erro texto={erro} /> : null}
      {salas.map((sala) => (
        <CartaoCadastro key={sala.id}>
          <CabecalhoCadastro acoes={
            <>
              <BotaoIconeAcao tipo="editar" aoPressionar={() => editar(sala)} />
              <BotaoIconeAcao tipo="excluir" desabilitado={enviando} aoPressionar={() => void excluir(sala.id)} />
            </>
          }>
            <Texto>{sala.nome}</Texto>
          </CabecalhoCadastro>
          <Texto>{sala.assentos.length} assentos</Texto>
        </CartaoCadastro>
      ))}
    </Tela>
  );
}

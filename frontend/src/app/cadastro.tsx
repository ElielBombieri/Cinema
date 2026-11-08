import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Aviso, Botao, Campo, Erro, Tela, Titulo } from "../components/Interface";
import { useAuth } from "../context/AuthContext";
import { textoDoErro } from "../services/formatar";

export default function TelaCadastro() {
  const { usuario, carregando, registrar } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (carregando) {
    return (
      <Tela>
        <Aviso texto="Carregando..." />
      </Tela>
    );
  }
  if (usuario) return <Redirect href="/" />;

  const aoCadastrar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      await registrar(nome, email, senha);
      router.replace("/");
    } catch (e) {
      setErro(textoDoErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tela>
      <Titulo>Criar conta</Titulo>
      <Campo rotulo="Nome" valor={nome} aoMudar={setNome} />
      <Campo rotulo="E-mail" valor={email} aoMudar={setEmail} teclado="email-address" semMaiusculas />
      <Campo rotulo="Senha" valor={senha} aoMudar={setSenha} seguro />
      {erro ? <Erro texto={erro} /> : null}
      <Botao
        titulo={enviando ? "Salvando..." : "Cadastrar"}
        aoPressionar={() => void aoCadastrar()}
        desabilitado={enviando}
      />
    </Tela>
  );
}

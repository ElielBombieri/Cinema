import { useState, type CSSProperties, type ReactNode } from "react";
import {
  Pressable,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";

export function Tela({ children }: { children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={estilos.pagina} keyboardShouldPersistTaps="handled">
      <View style={estilos.miolo}>{children}</View>
    </ScrollView>
  );
}

export function Titulo({ children }: { children: ReactNode }) {
  return <Text style={estilos.titulo}>{children}</Text>;
}

export function Texto({ children }: { children: ReactNode }) {
  return <Text style={estilos.texto}>{children}</Text>;
}

export function Aviso({ texto }: { texto: string }) {
  return <Text style={estilos.aviso}>{texto}</Text>;
}

export function Erro({ texto }: { texto: string }) {
  return <Text style={estilos.erro}>{texto}</Text>;
}

type CampoProps = {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  seguro?: boolean;
  teclado?: KeyboardTypeOptions;
  variasLinhas?: boolean;
  semMaiusculas?: boolean;
  placeholder?: string;
  maxLength?: number;
  tipo?: "datetime-local";
};

const estiloDataHoraWeb: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: 10,
  backgroundColor: "#ffffff",
  color: "#0f172a",
  fontSize: 16,
  fontFamily: "Arial, sans-serif",
};

export function Campo({ rotulo, valor, aoMudar, seguro, teclado, variasLinhas, semMaiusculas, placeholder, maxLength, tipo }: CampoProps) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      {tipo === "datetime-local" && Platform.OS === "web" ? (
        <input
          aria-label={rotulo}
          type="datetime-local"
          value={valor}
          onChange={(evento) => aoMudar(evento.currentTarget.value)}
          style={estiloDataHoraWeb}
        />
      ) : (
        <TextInput
          style={[estilos.input, variasLinhas ? estilos.area : null]}
          value={valor}
          onChangeText={aoMudar}
          secureTextEntry={seguro}
          keyboardType={teclado}
          placeholder={placeholder}
          maxLength={maxLength}
          autoCapitalize={semMaiusculas || seguro ? "none" : "sentences"}
          multiline={variasLinhas}
        />
      )}
    </View>
  );
}

type BotaoProps = {
  titulo: string;
  aoPressionar: () => void;
  desabilitado?: boolean;
  secundario?: boolean;
};

export function Botao({ titulo, aoPressionar, desabilitado, secundario }: BotaoProps) {
  return (
    <Pressable
      style={[estilos.botao, secundario ? estilos.botaoSecundario : null, desabilitado ? estilos.desabilitado : null]}
      onPress={aoPressionar}
      disabled={desabilitado}
    >
      <Text style={[estilos.botaoTexto, secundario ? estilos.botaoTextoSecundario : null]}>{titulo}</Text>
    </Pressable>
  );
}

export function CartaoCadastro({ children }: { children: ReactNode }) {
  return <View style={estilos.cartaoCadastro}>{children}</View>;
}

export function LinhaAcoes({ children }: { children: ReactNode }) {
  return <View style={estilos.linhaAcoes}>{children}</View>;
}

export function CabecalhoCadastro({ children, acoes }: { children: ReactNode; acoes: ReactNode }) {
  return (
    <View style={estilos.cabecalhoCadastro}>
      <View style={estilos.conteudoCabecalho}>{children}</View>
      <View style={estilos.acoesCabecalho}>{acoes}</View>
    </View>
  );
}

export function BotaoIconeAcao({
  tipo,
  aoPressionar,
  desabilitado,
}: {
  tipo: "editar" | "excluir";
  aoPressionar: () => void;
  desabilitado?: boolean;
}) {
  const [mostrarDica, setMostrarDica] = useState(false);
  const editar = tipo === "editar";
  const dica = editar ? "Editar" : "Excluir";
  return (
    <View style={estilos.acaoComDica}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dica}
        onPress={aoPressionar}
        onHoverIn={() => setMostrarDica(true)}
        onHoverOut={() => setMostrarDica(false)}
        disabled={desabilitado}
        style={({ pressed }) => [
          estilos.botaoIcone,
          editar ? estilos.botaoEditar : estilos.botaoExcluir,
          pressed ? estilos.iconePressionado : null,
          desabilitado ? estilos.desabilitado : null,
        ]}
      >
        {editar ? (
          <Text style={[estilos.glyphAcao, estilos.glyphEditar]}>✎</Text>
        ) : (
          <View style={estilos.lixeiraIcone}>
            <View style={estilos.lixeiraTampa} />
            <View style={estilos.lixeiraCorpo}><View style={estilos.linhaLixeira} /><View style={estilos.linhaLixeira} /><View style={estilos.linhaLixeira} /></View>
          </View>
        )}
      </Pressable>
      {mostrarDica ? <Text style={estilos.dicaAcao}>{dica}</Text> : null}
    </View>
  );
}

export function confirmarExclusao(mensagem: string): Promise<boolean> {
  if (Platform.OS === "web") return Promise.resolve(window.confirm(mensagem));
  return new Promise((resolver) => {
    Alert.alert("Confirmar exclusão", mensagem, [
      { text: "Cancelar", style: "cancel", onPress: () => resolver(false) },
      { text: "Excluir", style: "destructive", onPress: () => resolver(true) },
    ]);
  });
}

const estilos = StyleSheet.create({
  pagina: {
    backgroundColor: "#f8fafc",
    padding: 16,
    flexGrow: 1,
  },
  miolo: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    gap: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  texto: {
    fontSize: 16,
    color: "#334155",
  },
  aviso: {
    fontSize: 16,
    color: "#475569",
  },
  erro: {
    fontSize: 15,
    color: "#b91c1c",
  },
  campo: {
    gap: 4,
  },
  rotulo: {
    fontSize: 14,
    color: "#334155",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  area: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  botao: {
    backgroundColor: "#1d4ed8",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  botaoSecundario: {
    backgroundColor: "#e2e8f0",
  },
  desabilitado: {
    opacity: 0.5,
  },
  botaoTexto: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  botaoTextoSecundario: {
    color: "#0f172a",
  },
  cartaoCadastro: {
    backgroundColor: "#ffffff",
    borderColor: "#d7e2f0",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    shadowColor: "#1e3a5f",
    shadowOpacity: 0.045,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  linhaAcoes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  cabecalhoCadastro: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  conteudoCabecalho: {
    flex: 1,
    flexShrink: 1,
  },
  acoesCabecalho: {
    flexDirection: "row",
    gap: 6,
    flexShrink: 0,
    marginTop: -4,
    marginRight: -4,
  },
  acaoComDica: {
    position: "relative",
    zIndex: 2,
  },
  botaoIcone: {
    width: 38,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoEditar: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  botaoExcluir: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  iconePressionado: {
    opacity: 0.65,
  },
  glyphAcao: {
    fontSize: 22,
    lineHeight: 25,
    fontWeight: "700",
  },
  glyphEditar: {
    color: "#1d4ed8",
  },
  glyphExcluir: {
    color: "#be123c",
  },
  lixeiraIcone: {
    width: 18,
    height: 22,
    alignItems: "center",
  },
  lixeiraTampa: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#be123c",
    marginBottom: 2,
  },
  lixeiraCorpo: {
    width: 14,
    height: 16,
    borderWidth: 2,
    borderColor: "#be123c",
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingTop: 3,
  },
  linhaLixeira: {
    width: 1,
    height: 9,
    backgroundColor: "#be123c",
  },
  dicaAcao: {
    position: "absolute",
    bottom: 42,
    left: -12,
    backgroundColor: "#0f172a",
    color: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 12,
    overflow: "hidden",
    zIndex: 10,
  },
});

import type { CSSProperties, ReactNode } from "react";
import {
  Pressable,
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
});

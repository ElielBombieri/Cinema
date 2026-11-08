import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AssentoEscolhido, AssentoMapa } from "../models/cinema";

type Props = {
  assentos: AssentoMapa[];
  escolhidos: AssentoEscolhido[];
  aoEscolher: (assento: AssentoEscolhido) => void;
};

function escolhido(lista: AssentoEscolhido[], assento: AssentoMapa): boolean {
  return lista.some((item) => item.fila === assento.fila && item.numero === assento.numero);
}

export function MapaAssentos({ assentos, escolhidos, aoEscolher }: Props) {
  const filas = [...new Set(assentos.map((assento) => assento.fila))];

  return (
    <View style={estilos.bloco}>
      <View style={estilos.legenda}>
        <Text style={estilos.legendaItem}>Livre</Text>
        <Text style={estilos.legendaItem}>Escolhido</Text>
        <Text style={estilos.legendaItem}>Meu</Text>
        <Text style={estilos.legendaItem}>Reservado</Text>
        <Text style={estilos.legendaItem}>Vendido</Text>
      </View>
      {filas.map((fila) => (
        <View key={fila} style={estilos.fila}>
          <Text style={estilos.letra}>{fila}</Text>
          {assentos
            .filter((assento) => assento.fila === fila)
            .map((assento) => {
              const marcado = escolhido(escolhidos, assento);
              const livre = assento.status === "LIVRE";
              const textoClaro = marcado || !livre;
              return (
                <Pressable
                  key={`${assento.fila}-${assento.numero}`}
                  disabled={!livre}
                  onPress={() => aoEscolher({ fila: assento.fila, numero: assento.numero })}
                  style={[
                    estilos.assento,
                    assento.status === "RESERVADO" && assento.meu ? estilos.meu : null,
                    assento.status === "RESERVADO" && !assento.meu ? estilos.reservado : null,
                    assento.status === "VENDIDO" ? estilos.vendido : null,
                    marcado ? estilos.marcado : null,
                  ]}
                >
                  <Text style={textoClaro ? estilos.numeroMarcado : estilos.numero}>{assento.numero}</Text>
                </Pressable>
              );
            })}
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: {
    gap: 8,
  },
  legenda: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendaItem: {
    fontSize: 13,
    color: "#475569",
  },
  fila: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  letra: {
    width: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  assento: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  marcado: {
    backgroundColor: "#1d4ed8",
  },
  meu: {
    backgroundColor: "#7c3aed",
  },
  reservado: {
    backgroundColor: "#f59e0b",
  },
  vendido: {
    backgroundColor: "#94a3b8",
  },
  numero: {
    color: "#0f172a",
    fontSize: 13,
  },
  numeroMarcado: {
    color: "#ffffff",
    fontSize: 13,
  },
});

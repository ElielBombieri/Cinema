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
        <View style={estilos.legendaItem}><View style={[estilos.amostra, estilos.livre]} /><Text style={estilos.textoLegenda}>Livre</Text></View>
        <View style={estilos.legendaItem}><View style={[estilos.amostra, estilos.escolhido]} /><Text style={estilos.textoLegenda}>Escolhido</Text></View>
        <View style={estilos.legendaItem}><View style={[estilos.amostra, estilos.amostraMeu]} /><Text style={estilos.textoLegenda}>Meu reservado</Text></View>
        <View style={estilos.legendaItem}><View style={[estilos.amostra, estilos.amostraReservado]} /><Text style={estilos.textoLegenda}>Reservado</Text></View>
        <View style={estilos.legendaItem}><View style={[estilos.amostra, estilos.amostraVendido]} /><Text style={estilos.textoLegenda}>Vendido</Text></View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  textoLegenda: {
    fontSize: 13,
    color: "#475569",
  },
  amostra: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  livre: { backgroundColor: "#e2e8f0" },
  escolhido: { backgroundColor: "#1d4ed8" },
  amostraMeu: { backgroundColor: "#7c3aed" },
  amostraReservado: { backgroundColor: "#f59e0b" },
  amostraVendido: { backgroundColor: "#94a3b8" },
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

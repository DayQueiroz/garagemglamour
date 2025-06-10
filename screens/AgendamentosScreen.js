import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { Calendar } from "react-native-calendars";

export default function AgendamentosScreen() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [datasMarcadas, setDatasMarcadas] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "agendamentos"), snapshot => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAgendamentos(lista);


      const marcacoes = {};
      lista.forEach(item => {
        if (item.data) {
          const dataFormatada = item.data.split("/").reverse().join("-");
          marcacoes[dataFormatada] = {
            marked: true,
            dotColor: "#4E73DF"
          };
        }
      });
      setDatasMarcadas(marcacoes);
    });

    return () => unsubscribe();
  }, []);

  const agendamentosDoDia = dataSelecionada
    ? agendamentos.filter((ag) => {
      if (!ag.data) return false; // segurança contra undefined
      const partes = ag.data.split("/");
      if (partes.length !== 3) return false; // segurança contra dados mal formatados
      const [dia, mes, ano] = partes;
      const dataAgendamento = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
      return dataAgendamento === dataSelecionada;
    })
    : [];



  const formatarParaBR = (dataISO) => {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={dia => setDataSelecionada(dia.dateString)}
        markedDates={{
          ...datasMarcadas,
          ...(dataSelecionada && {
            [dataSelecionada]: {
              selected: true,
              selectedColor: "#4E73DF",
              marked: true
            }
          })
        }}
        theme={{
          selectedDayBackgroundColor: "#4E73DF",
          todayTextColor: "#4E73DF",
          arrowColor: "#4E73DF"
        }}
      />

      <Text style={styles.tituloLista}>
        {dataSelecionada
          ? `Agendamentos de ${formatarParaBR(dataSelecionada)}`
          : "Selecione um dia"}
      </Text>

      <FlatList
        data={agendamentosDoDia}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.texto}>Cliente: {item.cliente}</Text>
            <Text style={styles.texto}>Serviço: {item.servico}</Text>
            <Text style={styles.texto}>Profissional: {item.profissional}</Text>
            <Text style={styles.texto}>Hora: {item.hora}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.texto}>Nenhum agendamento</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff"
  },
  tituloLista: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "center"
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd"
  },
  texto: {
    color: "#000"
  }
});

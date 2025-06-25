import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Linking, TouchableOpacity, ScrollView } from "react-native";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons"; // ícone de "+"
import CabecalhoComLogo from "../components/CabecalhoComLogo";
import { cores } from "../theme";

LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};

LocaleConfig.defaultLocale = 'pt-br';

export default function AgendamentosScreen({ navigation }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [datasMarcadas, setDatasMarcadas] = useState({});
  const [aniversariantes, setAniversariantes] = useState([]);
  const [clientesInativos, setClientesInativos] = useState([]); // agora será um array de objetos: { nome, telefone }
  const [mostrarCardAniversario, setMostrarCardAniversario] = useState(true);
  const [mostrarCardInativos, setMostrarCardInativos] = useState(true);



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

  useEffect(() => {
    const verificarAniversariantes = async () => {
      const hoje = new Date();
      const diaHoje = hoje.getDate().toString().padStart(2, "0");
      const mesHoje = (hoje.getMonth() + 1).toString().padStart(2, "0");

      const snapshot = await getDocs(collection(db, "clientes"));
      const aniversariantes = [];

      snapshot.forEach((doc) => {
        const cliente = doc.data();
        if (cliente.dataNascimento) {
          const [ano, mes, dia] = cliente.dataNascimento.split("-");
          if (dia === diaHoje && mes === mesHoje) {
            aniversariantes.push(cliente.nome);
          }
        }
      });

      setAniversariantes(aniversariantes); // novo
      if (aniversariantes.length > 0) {
        Alert.alert(
          "🎉 Aniversário hoje!",
          `Hoje é aniversário de: ${aniversariantes.join(", ")}`,
          [{ text: "Ok" }]
        );
      }
    };

    verificarAniversariantes();
  }, []);

  useEffect(() => {
    const verificarInativos = async () => {
      const clientesSnapshot = await getDocs(collection(db, "clientes"));
      const agendamentosSnapshot = await getDocs(collection(db, "agendamentos"));

      const hoje = new Date();
      const clientesInativos = [];

      clientesSnapshot.forEach((doc) => {
        const cliente = doc.data();
        if (!cliente.nome) return;

        // pega os agendamentos da cliente
        const agendamentosDoCliente = agendamentosSnapshot.docs.filter((agDoc) => {
          const ag = agDoc.data();
          return ag.cliente === cliente.nome && ag.data;
        });

        // pega o último agendamento
        const datas = agendamentosDoCliente.map((ag) => {
          const partes = ag.data.split("/");
          return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`); // converte DD/MM/AAAA para Date
        });

        const ultimaData = datas.sort((a, b) => b - a)[0]; // mais recente

        // se não tiver nenhum ou passou de 30 dias
        if (!ultimaData || (hoje - ultimaData) / (1000 * 60 * 60 * 24) > 30) {
          clientesInativos.push({ nome: cliente.nome, telefone: cliente.telefone || "" });
        }
      });

      setClientesInativos(clientesInativos); // novo
      if (clientesInativos.length > 0) {
        Alert.alert(
          "📋 Clientes inativos",
          `Essas clientes estão há mais de 30 dias sem agendar:\n\n${clientesInativos.map(c => c.nome).join(", ")}`,
          [{ text: "Ok" }]
        );

      }

    };

    verificarInativos();
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
      .sort((a, b) => {
        // ordena os horários no formato HH:mm
        const horaA = a.hora || "00:00";
        const horaB = b.hora || "00:00";
        return horaA.localeCompare(horaB);
      })
    : [];



  const formatarParaBR = (dataISO) => {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>


      <TouchableOpacity
        onPress={() => navigation.navigate("Clientes")}
        style={{ alignSelf: "flex-start", marginTop: 12 }}
      >
        <Text style={{ color: "#4E73DF", fontWeight: "bold" }}>👥 Clientes</Text>
      </TouchableOpacity>

      <CabecalhoComLogo />

      {mostrarCardAniversario && aniversariantes.length > 0 && (
        <View style={styles.cardAviso}>
          <View style={styles.cardTopo}>
            <Text style={styles.cardTitulo}>🎉 Aniversariantes de hoje:</Text>
            <TouchableOpacity onPress={() => setMostrarCardAniversario(false)}>
              <Text style={styles.fechar}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardTexto}>{aniversariantes.join(", ")}</Text>
        </View>
      )}


      {mostrarCardInativos && clientesInativos.length > 0 && (
        <View style={styles.cardAviso}>
          <View style={styles.cardTopo}>
            <Text style={styles.cardTitulo}>📋 Clientes inativas (30+ dias):</Text>
            <TouchableOpacity onPress={() => setMostrarCardInativos(false)}>
              <Text style={styles.fechar}>✕</Text>
            </TouchableOpacity>
          </View>
          {clientesInativos.map((cliente, index) => (
            <View key={index} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <Text style={{ color: "#555" }}>{cliente.nome}</Text>
              {cliente.telefone ? (
                <TouchableOpacity
                  onPress={() => {
                    const numero = "55" + cliente.telefone.replace(/\D/g, "");
                    const mensagem = `Olá ${cliente.nome}, sentimos sua falta! Que tal marcar um horário conosco? 💅`;
                    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
                    Linking.openURL(url).catch(() =>
                      Alert.alert("Erro", "Não foi possível abrir o WhatsApp")
                    );
                  }}
                >
                  <Text style={{ color: "#4E73DF" }}>EnviarMensagem</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: "#aaa" }}>Sem telefone</Text>
              )}
            </View>
          ))}

        </View>
      )}



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

      {agendamentosDoDia.length > 0 ? (
        agendamentosDoDia.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate("EditarAgendamento", { id: item.id })}
          >
            <View style={styles.card}>
              <Text style={styles.texto}>Cliente: {item.cliente}</Text>
              <Text style={styles.texto}>Serviço: {item.servico}</Text>
              <Text style={styles.texto}>Profissional: {item.profissional}</Text>
              <Text style={styles.texto}>Hora: {item.hora}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.texto}>Nenhum agendamento</Text>
      )}

      <TouchableOpacity
        style={styles.botaoFlutuante}
        onPress={() => navigation.navigate("NovoAgendamento")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: cores.fundo
  },
  tituloLista: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "center",
    color: cores.primario
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: cores.cinzaClaro,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  texto: {
    color: cores.texto
  },
  botaoFlutuante: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4E73DF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5
  },
  botao: {
    backgroundColor: cores.primario,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  cardAviso: {
    backgroundColor: "#fffbe6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f1c40f",
  },

  cardTitulo: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333"
  },

  cardTexto: {
    color: "#555"
  },
  cardTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  fechar: {
    fontSize: 18,
    color: "#888",
    paddingHorizontal: 8
  }



});

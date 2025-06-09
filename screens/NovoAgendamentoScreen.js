import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useColorScheme } from "react-native";
import { TouchableOpacity } from "react-native";


export default function NovoAgendamentoScreen({ navigation }) {
    const tema = useColorScheme();
    const [cliente, setCliente] = useState("");
    const [profissional, setProfissional] = useState("");
    const [servico, setServico] = useState("");
    const [data, setData] = useState(new Date());
    const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
    const [modo, setModo] = useState("date");


    const salvarAgendamento = async () => {
        if (!cliente || !profissional || !servico) {
            Alert.alert("Preencha todos os campos!");
            return;
        }

        try {
            await addDoc(collection(db, "agendamentos"), {
                cliente,
                profissional,
                servico,
                data: data.toLocaleDateString(),
                hora: data.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });

            Alert.alert("Sucesso", "Agendamento criado com sucesso!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Erro", error.message);
        }
    };

    <Text style={styles.titulo}>Novo Agendamento</Text>


    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Nome do Cliente"
                value={cliente}
                onChangeText={setCliente}
                style={styles.input}
            />
            <TextInput
                placeholder="Profissional"
                value={profissional}
                onChangeText={setProfissional}
                style={styles.input}
            />
            <TextInput
                placeholder="Serviço"
                value={servico}
                onChangeText={setServico}
                style={styles.input}
            />

            <TouchableOpacity style={styles.botao} onPress={() => { setModo("date"); setMostrarDatePicker(true); }}>
                <Text style={styles.textoBotao}>Selecionar Data</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botao} onPress={() => { setModo("time"); setMostrarDatePicker(true); }}>
                <Text style={styles.textoBotao}>Selecionar Hora</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botao} onPress={salvarAgendamento}>
                <Text style={styles.textoBotao}>Salvar Agendamento</Text>
            </TouchableOpacity>


            <Text style={styles.info}>
                {`Data: ${data.toLocaleDateString()} - Hora: ${data.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })}`}
            </Text>

            <DateTimePickerModal
                isVisible={mostrarDatePicker}
                mode={modo}
                date={data}
                locale="pt-BR"
                is24Hour={true}
                display="default"
                buttonTextColorIOS="#007AFF"
                pickerStyleIOS={{
                    backgroundColor: "#fff",
                }}
                onConfirm={(valorSelecionado) => {
                    setMostrarDatePicker(false);
                    const novaData = new Date(data);
                    if (modo === "date") {
                        novaData.setFullYear(
                            valorSelecionado.getFullYear(),
                            valorSelecionado.getMonth(),
                            valorSelecionado.getDate()
                        );
                    } else {
                        novaData.setHours(valorSelecionado.getHours(), valorSelecionado.getMinutes());
                    }
                    setData(novaData);
                }}
                onCancel={() => setMostrarDatePicker(false)}
            />




            <Button title="Salvar Agendamento" onPress={salvarAgendamento} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
        padding: 20
    },
    titulo: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 24,
        color: "#333"
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        borderColor: "#ccc",
        borderWidth: 1,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    info: {
        fontSize: 16,
        textAlign: "center",
        marginVertical: 12,
        color: "#444"
    },
    botao: {
        backgroundColor: "#4E73DF",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12
    },
    textoBotao: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    }
});


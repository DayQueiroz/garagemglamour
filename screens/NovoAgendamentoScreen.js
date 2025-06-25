import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { db } from "../firebaseConfig";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { useColorScheme } from "react-native";
import { TouchableOpacity } from "react-native";
import { Linking } from 'react-native';
import CabecalhoComLogo from "../components/CabecalhoComLogo";
import { cores } from "../theme";
import Autocomplete from "react-native-autocomplete-input";



export default function NovoAgendamentoScreen({ navigation }) {
    const tema = useColorScheme();
    const [cliente, setCliente] = useState("");
    const [profissional, setProfissional] = useState("");
    const [servico, setServico] = useState("");
    const [data, setData] = useState(new Date());
    const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
    const [modo, setModo] = useState("date");
    const [numeroTelefone, setNumeroTelefone] = useState("");
    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "clientes"), (snapshot) => {
            const lista = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setClientes(lista);
        });

        return () => unsubscribe();
    }, [])


    const salvarAgendamento = async () => {
        if (!cliente || !profissional || !servico || !numeroTelefone) {
            Alert.alert("Preencha todos os campos!");
            return;
        }

        try {
            await addDoc(collection(db, "agendamentos"), {
                cliente,
                profissional,
                servico,
                telefone: numeroTelefone,
                data: data.toLocaleDateString(),
                hora: data.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });

            Alert.alert("Sucesso", "Agendamento criado com sucesso!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Erro", error.message);
        }
    };
    const enviarWhatsApp = () => {
        if (!numeroTelefone || !cliente || !profissional || !servico) {
            Alert.alert("Atenção", "Preencha todos os campos e o número do cliente.");
            return;
        }

        const numero = "55" + numeroTelefone.replace(/\D/g, "");
        const mensagem = `Olá ${cliente}, seu agendamento para ${servico} com ${profissional} está confirmado para ${data.toLocaleDateString()} às ${data.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`;

        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

        Linking.openURL(url).catch(() =>
            Alert.alert("Erro", "Não foi possível abrir o WhatsApp")
        );
    };


    return (
        <View style={styles.container}>
            <CabecalhoComLogo />
            <Text style={styles.titulo}>Novo Agendamento</Text>

            <Text style={{ marginBottom: 8, fontWeight: "bold", color: "#555" }}>
                Cliente
            </Text>

            <Autocomplete
                data={
                    cliente.length > 0
                        ? clientes.filter((item) =>
                            item.nome.toLowerCase().includes(cliente.toLowerCase())
                        )
                        : []
                }
                defaultValue={cliente}
                onChangeText={setCliente}
                placeholder="Digite o nome da cliente"
                containerStyle={styles.autocompleteContainer}
                inputContainerStyle={styles.autocompleteInput}
                listStyle={styles.autocompleteList}
                flatListProps={{
                    keyExtractor: (item) => item.id,
                    renderItem: ({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                setCliente(item.nome);
                                setNumeroTelefone(item.telefone); // ← já preenche o telefone também
                                setClientes([]); // força a lista a sumir visualmente
                            }}
                        >
                            <Text style={{ padding: 10 }}>{item.nome}</Text>
                        </TouchableOpacity>
                    ),
                }}
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
            <TextInput
                placeholder="Telefone do Cliente (com DDD)"
                value={numeroTelefone}
                onChangeText={setNumeroTelefone}
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

            <TouchableOpacity
                style={[styles.botao, { backgroundColor: "#25D366" }]}
                onPress={enviarWhatsApp}
            >
                <Text style={styles.textoBotao}>Confirmar por WhatsApp</Text>
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





        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cores.fundo,
        padding: 16
    },
    titulo: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 24,
        color: "#333"
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
    texto: {
        color: cores.texto
    },
    autocompleteContainer: {
        marginBottom: 16,
        zIndex: 10, // garante que fique acima dos outros campos
        position: "relative",
    },

    autocompleteInput: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#ccc",
        height: 50,
        justifyContent: "center",
    },

    autocompleteList: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        maxHeight: 150,
        position: "absolute",
        top: 50,
        width: "100%",
        zIndex: 20,
    }
});


import React, { useEffect, useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Linking } from 'react-native';
import CabecalhoComLogo from "../components/CabecalhoComLogo"
import { cores } from "../theme";
import { ScrollView } from "react-native";



export default function EditarAgendamentoScreen({ route, navigation }) {
    const { id } = route.params;
    const [cliente, setCliente] = useState("");
    const [profissional, setProfissional] = useState("");
    const [servico, setServico] = useState("");
    const [data, setData] = useState(new Date());
    const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
    const [modo, setModo] = useState("date");
    const [numeroTelefone, setNumeroTelefone] = useState("");


    useEffect(() => {
        const carregarAgendamento = async () => {
            const ref = doc(db, "agendamentos", id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const agendamento = snap.data();
                setCliente(agendamento.cliente || "");
                setProfissional(agendamento.profissional || "");
                setServico(agendamento.servico || "");

                const [dia, mes, ano] = agendamento.data.split("/");
                const [hora, minuto] = agendamento.hora.split(":");
                const dataCompleta = new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}`);
                setData(dataCompleta);
            }
        };

        carregarAgendamento();
    }, [id]);

    const salvarEdicao = async () => {
        if (!cliente || !profissional || !servico) {
            Alert.alert("Preencha todos os campos!");
            return;
        }

        try {
            await updateDoc(doc(db, "agendamentos", id), {
                cliente,
                profissional,
                servico,
                data: data.toLocaleDateString(),
                hora: data.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });

            Alert.alert("Sucesso", "Agendamento atualizado!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Erro", error.message);
        }
    };

    const excluirAgendamento = async () => {
        Alert.alert("Confirmação", "Deseja excluir este agendamento?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                    await deleteDoc(doc(db, "agendamentos", id));
                    Alert.alert("Excluído com sucesso!");
                    navigation.goBack();
                }
            }
        ]);
    };

    const enviarWhatsApp = () => {
        if (!numeroTelefone) {
            Alert.alert("Atenção", "Informe o número de telefone do cliente.");
            return;
        }

        const numero = "55" + numeroTelefone.replace(/\D/g, ""); // remove traços, parênteses etc.
        const mensagem = `Olá ${cliente}, seu agendamento para ${servico} com ${profissional} está confirmado para ${data.toLocaleDateString()} às ${data.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`;

        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

        Linking.openURL(url).catch(() =>
            Alert.alert("Erro", "Não foi possível abrir o WhatsApp")
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <CabecalhoComLogo />
            <Text style={styles.titulo}>Editar Agendamento</Text>

            <TextInput
                placeholder="Cliente"
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

            <Text style={styles.info}>
                {`Data: ${data.toLocaleDateString()} - Hora: ${data.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </Text>

            <TouchableOpacity style={styles.botao} onPress={salvarEdicao}>
                <Text style={styles.textoBotao}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.botao, { backgroundColor: "#F44336" }]} onPress={excluirAgendamento}>
                <Text style={styles.textoBotao}>Excluir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.botao, { backgroundColor: "#888" }]} onPress={() => navigation.goBack()}>
                <Text style={styles.textoBotao}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.botao, { backgroundColor: "#25D366" }]}
                onPress={enviarWhatsApp}
            >
                <Text style={styles.textoBotao}>Confirmar por WhatsApp</Text>
            </TouchableOpacity>

            <DateTimePickerModal
                isVisible={mostrarDatePicker}
                mode={modo}
                date={data}
                locale="pt-BR"
                is24Hour={true}
                display="default"
                onConfirm={(nova) => {
                    setMostrarDatePicker(false);
                    const novaData = new Date(data);
                    if (modo === "date") {
                        novaData.setFullYear(nova.getFullYear(), nova.getMonth(), nova.getDate());
                    } else {
                        novaData.setHours(nova.getHours(), nova.getMinutes());
                    }
                    setData(novaData);
                }}
                onCancel={() => setMostrarDatePicker(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cores.fundo,
        padding: 16
    },
    tituloLista: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 12,
        textAlign: "center",
        color: cores.primario
    },
    titulo: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 24,
        color: "#333"
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
        borderWidth: 1
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
    info: {
        fontSize: 16,
        textAlign: "center",
        marginVertical: 12,
        color: "#444"
    },
    texto: {
        color: cores.texto
    }
});

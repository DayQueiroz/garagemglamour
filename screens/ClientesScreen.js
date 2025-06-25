import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert, Modal } from "react-native";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { cores } from "../theme";
import CabecalhoComLogo from "../components/CabecalhoComLogo";

export default function ClientesScreen() {
    const [clientes, setClientes] = useState([]);
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "clientes"), snapshot => {
            const lista = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setClientes(lista);
        });

        return () => unsubscribe();
    }, []);

    const limparCampos = () => {
        setNome("");
        setTelefone("");
        setDataNascimento("");
        setEditandoId(null);
    };

    const salvarCliente = async () => {
        if (!nome || !telefone || !dataNascimento) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        try {
            if (editandoId) {
                const clienteRef = doc(db, "clientes", editandoId);
                await updateDoc(clienteRef, { nome, telefone, dataNascimento });
            } else {
                await addDoc(collection(db, "clientes"), { nome, telefone, dataNascimento });
            }
            limparCampos();
            setModalVisible(false);
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
        }
    };

    const editarCliente = (cliente) => {
        setNome(cliente.nome);
        setTelefone(cliente.telefone);
        setDataNascimento(cliente.dataNascimento);
        setEditandoId(cliente.id);
        setModalVisible(true);
    };

    const excluirCliente = (id) => {
        Alert.alert("Excluir", "Tem certeza que deseja excluir este cliente?", [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, "clientes", id));
                    } catch (error) {
                        console.error("Erro ao excluir:", error);
                    }
                },
            },
        ]);
    };

    const formatarDataBR = (dataISO) => {
        if (!dataISO) return "";
        const [ano, mes, dia] = dataISO.split("-");
        return `${dia}/${mes}/${ano}`;
    };


    return (
        <View style={styles.container}>
            <CabecalhoComLogo />
            <Text style={styles.titulo}>Clientes Cadastrados</Text>

            <FlatList
                data={clientes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.texto}>Nome: {item.nome}</Text>
                        <Text style={styles.texto}>Telefone: {item.telefone}</Text>
                        <Text style={styles.texto}>Nascimento: {formatarDataBR(item.dataNascimento)}</Text>

                        <View style={styles.botoesCard}>
                            <TouchableOpacity onPress={() => editarCliente(item)} style={styles.botaoEditar}>
                                <Text style={styles.textoBotao}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => excluirCliente(item.id)} style={styles.botaoExcluir}>
                                <Text style={styles.textoBotao}>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.texto}>Nenhum cliente cadastrado.</Text>}
            />

            <TouchableOpacity style={styles.botaoAdicionar} onPress={() => setModalVisible(true)}>
                <Text style={styles.textoBotao}>+ Novo Cliente</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalConteudo}>
                        <Text style={styles.titulo}>Cadastro de Cliente</Text>

                        <TextInput
                            placeholder="Nome"
                            placeholderTextColor="#666"
                            value={nome}
                            onChangeText={setNome}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Telefone"
                            placeholderTextColor="#666"
                            value={telefone}
                            onChangeText={setTelefone}
                            keyboardType="phone-pad"
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Data de nascimento (Ex: 20/05/1990)"
                            placeholderTextColor="#666"
                            value={dataNascimento}
                            onChangeText={(texto) => {
                                // Se digitarem com barra, vamos converter para ISO
                                if (texto.includes("/") && texto.length === 10) {
                                    const partes = texto.split("/");
                                    if (partes.length === 3) {
                                        const [dia, mes, ano] = partes;
                                        const formatado = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
                                        setDataNascimento(formatado);
                                    } else {
                                        setDataNascimento(texto);
                                    }
                                } else {
                                    setDataNascimento(texto);
                                }
                            }}
                            style={styles.input}
                        />

                        <TouchableOpacity style={styles.botaoSalvar} onPress={salvarCliente}>
                            <Text style={styles.textoBotao}>Salvar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { setModalVisible(false); limparCampos(); }}>
                            <Text style={{ color: cores.primario, marginTop: 12, textAlign: "center" }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: cores.fundo
    },
    titulo: {
        fontSize: 18,
        fontWeight: "bold",
        color: cores.primario,
        marginBottom: 12,
        textAlign: "center"
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderColor: cores.cinzaClaro,
        borderWidth: 1
    },
    texto: {
        color: cores.texto
    },
    botoesCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8
    },
    botaoEditar: {
        backgroundColor: "#4E73DF",
        padding: 8,
        borderRadius: 6
    },
    botaoExcluir: {
        backgroundColor: "#e74c3c",
        padding: 8,
        borderRadius: 6
    },
    textoBotao: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center"
    },
    botaoAdicionar: {
        backgroundColor: "#4E73DF",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 12
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#000000aa",
        justifyContent: "center"
    },
    modalConteudo: {
        backgroundColor: "#fff",
        margin: 20,
        padding: 20,
        borderRadius: 10
    },
    input: {
        backgroundColor: "#f1f1f1",
        padding: 10,
        marginTop: 10,
        borderRadius: 6
    },
    botaoSalvar: {
        backgroundColor: "#4E73DF",
        padding: 14,
        borderRadius: 8,
        marginTop: 16,
        alignItems: "center"
    }
});

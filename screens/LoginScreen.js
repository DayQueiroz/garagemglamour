import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import CabecalhoComLogo from "../components/CabecalhoComLogo";
import { cores } from "../theme";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch } from 'react-native';


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvarLogin, setSalvarLogin] = useState(false);

  const fazerLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      if (salvarLogin) {
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("senha", senha);
      } else {
        await AsyncStorage.removeItem("email");
        await AsyncStorage.removeItem("senha");
      }
      navigation.navigate("Agendamentos");
    } catch (erro) {
      Alert.alert("Erro", "Verifique seus dados");
    }
  };


  useEffect(() => {
    const carregarLoginSalvo = async () => {
      const emailSalvo = await AsyncStorage.getItem("email");
      const senhaSalva = await AsyncStorage.getItem("senha");
      if (emailSalvo && senhaSalva) {
        setEmail(emailSalvo);
        setSenha(senhaSalva);
        setSalvarLogin(true);
      }
    };
    carregarLoginSalvo();
  }, []);


  return (
    <View style={styles.container}>
      <CabecalhoComLogo />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        style={styles.input}
        secureTextEntry
      />
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Switch value={salvarLogin} onValueChange={setSalvarLogin} />
        <Text style={{ marginLeft: 8 }}>Salvar login</Text>
      </View>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      <Button title="Entrar" onPress={fazerLogin} />
    </View>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: 16,
    justifyContent: "center"
  },
  titulo: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    color: "#000"
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
  input: {
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    color: "#000"
  },
  erro: {
    color: "red",
    textAlign: "center",
    marginBottom: 10
  }
});

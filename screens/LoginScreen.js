import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const fazerLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigation.replace("Agendamentos");
    } catch (err) {
      setErro("Erro: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
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
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      <Button title="Entrar" onPress={fazerLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center"
  },
  titulo: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    color: "#000"
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

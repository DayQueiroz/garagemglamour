import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function CabecalhoComLogo() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo_salao.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff"
  },
  logo: {
    width: 180,
    height: 100
  }
});

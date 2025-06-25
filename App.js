import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import AgendamentosScreen from "./screens/AgendamentosScreen";
import NovoAgendamentoScreen from "./screens/NovoAgendamentoScreen";
import EditarAgendamentoScreen from './screens/EditarAgendamentoScreen';
import ClientesScreen from "./screens/ClientesScreen";



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Agendamentos" component={AgendamentosScreen} />
        <Stack.Screen name="NovoAgendamento" component={NovoAgendamentoScreen} />
        <Stack.Screen name="EditarAgendamento" component={EditarAgendamentoScreen} />
        <Stack.Screen name="Clientes" component={ClientesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

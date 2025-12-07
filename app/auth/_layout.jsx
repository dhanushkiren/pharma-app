// app/auth/_layout.js
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./login";
import RegisterScreen from "./register";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
        animationEnabled: true,
      }}
    >
      <Stack.Screen 
        name="login" 
        component={LoginScreen}
        options={{ title: "Login" }}
      />
      <Stack.Screen 
        name="register" 
        component={RegisterScreen}
        options={{ title: "Register" }}
      />
    </Stack.Navigator>
  );
}
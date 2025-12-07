// app/_layout.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

import CustomHeader from "@/components/CustomHeader";
import { toastConfig } from "@/components/ToastConfig";
import Toast from "react-native-toast-message";
import "../app/i18n";
import { ToastProvider } from "../context/ToastContext";
import { ThemeContext, ThemeProviderCustom } from "./theme-context";

function NavigationWrapper() {
  const { theme } = React.useContext(ThemeContext);
  const { isLoggedIn, authToken, loading: authLoading } = useAuth();
  const [languageSelected, setLanguageSelected] = useState(null);
  const [checkingLanguage, setCheckingLanguage] = useState(true);

  // Check if language was previously selected
  useEffect(() => {
    checkLanguageStatus();
  }, []);

  const checkLanguageStatus = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      setLanguageSelected(!!savedLanguage);
    } catch (err) {
      console.error("Error checking language:", err);
      setLanguageSelected(false);
    } finally {
      setCheckingLanguage(false);
    }
  };

  // Wait for both auth and language check to complete
  if (authLoading || checkingLanguage) return null;

  return (
    <CartProvider authToken={authToken} isLoggedIn={isLoggedIn}>
      <SafeAreaProvider>
        <ToastProvider>
          <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack
              screenOptions={{
                header: (props) => (
                  <CustomHeader
                    title={props.options.title}
                    canGoBack={props.navigation.canGoBack()}
                    onBack={props.navigation.goBack}
                    rightIcon={props.options.rightIcon}
                    onRightPress={props.options.onRightPress}
                  />
                ),
              }}
            >
              {/* Show language screen only if not previously selected */}
              {!languageSelected && (
                <Stack.Screen
                  name="language"
                  options={{
                    title: "Select Language",
                    headerShown: false,
                  }}
                />
              )}

              <Stack.Screen name="(tabs)" options={{ title: "Pharma App" }} />

              {/* Auth Screens */}
              <Stack.Group screenOptions={{ presentation: "modal" }}>
                <Stack.Screen name="auth/login" options={{ title: "Login" }} />
                <Stack.Screen
                  name="auth/register"
                  options={{ title: "Register" }}
                />
              </Stack.Group>
            </Stack>
            <Toast config={toastConfig} />
          </ThemeProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </CartProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <AuthProvider>
        <NavigationWrapper />
      </AuthProvider>
    </ThemeProviderCustom>
  );
}
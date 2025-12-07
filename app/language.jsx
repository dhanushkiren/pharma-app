// app/language.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import i18n from "./i18n";
import { useTheme } from "@react-navigation/native";

export default function LanguageScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  // Check if language is already selected on mount
  useEffect(() => {
    checkLanguageSelection();
  }, []);

  const checkLanguageSelection = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        // Language already selected, skip to home
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("Error checking language:", err);
    }
  };

  const selectLanguage = async (lng) => {
    try {
      i18n.changeLanguage(lng);
      await AsyncStorage.setItem("language", lng);
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Error saving language:", err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {i18n.t("select_language")}
      </Text>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={() => selectLanguage("en")}
      >
        <Text style={styles.btntxt}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={() => selectLanguage("hi")}
      >
        <Text style={styles.btntxt}>हिन्दी</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={() => selectLanguage("kn")}
      >
        <Text style={styles.btntxt}>ಕನ್ನಡ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  btn: {
    width: "80%",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
  },
  btntxt: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
});
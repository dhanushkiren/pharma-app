import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomHeader({ title, canGoBack, onBack, rightIcon, onRightPress }) {
  const colors = useTheme();

  return (
    <SafeAreaView 
      edges={['top']} 
      style={[styles.safe, { backgroundColor: colors.colors.card }]}
    >
      <View style={styles.container}>
        
        {/* Back Button */}
        {canGoBack ? (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onBack}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={24} color={colors.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}

        {/* Title */}
        <Text 
          style={[styles.title, { color: colors.colors.text }]} 
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        {/* Right Icon */}
        {rightIcon ? (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onRightPress}
            activeOpacity={0.6}
          >
            <Ionicons name={rightIcon} size={24} color={colors.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 8,
  },
});
// components/CustomAlertModal.js
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomAlertModal({
  visible,
  onClose,
  title,
  message,
  type = "info", // 'success', 'error', 'warning', 'info'
  buttons = [], // Array of button objects: [{ text, onPress, style }]
  showCloseIcon = true,
}) {
  const { colors } = useTheme();

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return { icon: "checkmark-circle", color: "#27AE60" };
      case "error":
        return { icon: "close-circle", color: "#E74C3C" };
      case "warning":
        return { icon: "warning", color: "#F39C12" };
      default:
        return { icon: "information-circle", color: "#4A90E2" };
    }
  };

  const { icon, color } = getIconAndColor();

  // Default button if none provided
  const defaultButtons = [
    {
      text: "OK",
      onPress: onClose,
      style: "primary",
    },
  ];

  const renderButtons = buttons.length > 0 ? buttons : defaultButtons;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Close Icon */}
          {showCloseIcon && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={64} color={color} />
          </View>

          {/* Title */}
          {title && (
            <Text style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
          )}

          {/* Message */}
          {message && (
            <Text style={[styles.message, { color: colors.text + "CC" }]}>
              {message}
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {renderButtons.map((button, index) => {
              const buttonStyle =
                button.style === "cancel"
                  ? styles.cancelButton
                  : button.style === "destructive"
                  ? styles.destructiveButton
                  : styles.primaryButton;

              const textStyle =
                button.style === "cancel"
                  ? [styles.cancelButtonText, { color: colors.primary }]
                  : styles.primaryButtonText;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    buttonStyle,
                    button.style === "cancel" && { borderColor: colors.primary },
                    renderButtons.length === 1 && styles.singleButton,
                  ]}
                  onPress={() => {
                    button.onPress?.();
                    onClose();
                  }}
                >
                  <Text style={textStyle}>{button.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  singleButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#4A90E2",
  },
  destructiveButton: {
    backgroundColor: "#E74C3C",
  },
  cancelButton: {
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
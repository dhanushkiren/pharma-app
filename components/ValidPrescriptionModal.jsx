import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

export default function ValidPrescriptionModal({ visible, close }) {
  const { t } = useTranslation();

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={close}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.title}>{t("valid_guide_title")}</Text>

            <TouchableOpacity onPress={close}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              source={require("../assets/images/prescription.png")}
              style={styles.image}
            />

            <Text style={styles.heading}>{t("valid_guide_heading")}</Text>

            <Text style={styles.text}>{t("valid_guide_description")}</Text>

            <TouchableOpacity style={styles.button} onPress={close}>
              <Text style={styles.buttonText}>{t("valid_guide_okay")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalBox: {
    height: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  image: { width: "100%", height: 260, resizeMode: "contain", marginTop: 16 },
  heading: { fontSize: 18, fontWeight: "700", marginTop: 20 },
  text: { fontSize: 14, color: "#444", marginTop: 10, lineHeight: 22 },
  button: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700", fontSize: 16 },
});


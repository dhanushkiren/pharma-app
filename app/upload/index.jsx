import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlertModal from "../../components/CustomAlertModal";
import ValidPrescriptionModal from "../../components/ValidPrescriptionModal";
import { API } from "../../constants/constant";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const API_URL = API;

export default function PrescriptionUploadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { authToken } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [whatsappModalVisible, setWhatsappModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Custom alert modal states
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    buttons: [],
  });

  const showAlertModal = (title, message, type = "info", buttons = []) => {
    setAlertModal({
      visible: true,
      title,
      message,
      type,
      buttons,
    });
  };

  const closeAlertModal = () => {
    setAlertModal({ ...alertModal, visible: false });
  };

  const handleUploadToServer = async () => {
    if (!selectedImage) {
      showAlertModal(
        "Error",
        "Please select an image",
        "error"
      );
      return;
    }

    setUploading(true);

    try {
      console.log("API URL:", API_URL);
      console.log("Auth Token:", authToken ? "Present" : "Missing");

      const fileName = selectedImage.uri.split("/").pop() || `prescription_${Date.now()}.jpg`;
      const uriParts = selectedImage.uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1];
      
      let mimeType = 'image/jpeg';
      if (fileExtension === 'png') {
        mimeType = 'image/png';
      } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
        mimeType = 'image/jpeg';
      }

      const formData = new FormData();
      formData.append("file", {
        uri: selectedImage.uri,
        name: fileName,
        type: mimeType,
      });

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      };
      
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const res = await fetch(`${API_URL}/prescriptions/upload`, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      const data = await res.json();

      // Check if user is not logged in
      if (!data.logged_in && !data.success) {
        showAlertModal(
          "Login Required",
          data.message || "The prescription will not be stored without login. Please login to save your prescription securely.",
          "warning",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Login", 
              style: "primary",
              onPress: () => router.push("/login")
            }
          ]
        );
        return;
      }

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Upload failed");
      }
      
      showAlertModal(
        "Success",
        "Prescription uploaded successfully!",
        "success",
        [
          {
            text: "OK",
            style: "primary",
            onPress: () => setSelectedImage(null)
          }
        ]
      );
      
    } catch (err) {
      console.error("Upload error:", err);
      
      let errorMessage = "Failed to upload prescription";
      
      if (err.message === "Network request failed") {
        errorMessage = `Cannot connect to server. Please check:\n\n1. Backend is running\n2. Your device can reach the server\n3. Network permissions are enabled`;
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      showAlertModal("Upload Error", errorMessage, "error");
    } finally {
      setUploading(false);
    }
  };

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPermission.status !== "granted" || libraryPermission.status !== "granted") {
      showAlertModal(
        "Permissions Required",
        "Please allow access to camera and gallery to upload prescriptions.",
        "warning"
      );
      return false;
    }
    return true;
  };

  const handleUploadPress = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    showAlertModal(
      "Select Source",
      "Choose where to pick the prescription from",
      "info",
      [
        {
          text: "Camera",
          style: "primary",
          onPress: pickFromCamera,
        },
        {
          text: "Gallery",
          style: "primary",
          onPress: pickFromGallery,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const pickFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        showToast("Image selected from camera", "success");
      }
    } catch (error) {
      console.error("Camera error:", error);
      showAlertModal("Error", "Failed to pick image from camera", "error");
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        showToast("Image selected from gallery", "success");
      }
    } catch (error) {
      console.error("Gallery error:", error);
      showAlertModal("Error", "Failed to pick image from gallery", "error");
    }
  };

  const handleSendRequest = async () => {
    if (!selectedImage) {
      showAlertModal("Error", "Please select an image first", "error");
      return;
    }
    setWhatsappModalVisible(true);
  };

  const proceedToWhatsApp = async () => {
    try {
      setSending(true);
      setWhatsappModalVisible(false);

      const phoneNumber = "919360637367";
      const message = encodeURIComponent(
        "Hi! I would like to share my prescription with you. Please review it and prepare my medicines. Thank you!"
      );

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        showAlertModal("Error", "WhatsApp is not installed on your device", "error");
      }
    } catch (error) {
      console.error("WhatsApp error:", error);
      showAlertModal("Error", "Failed to open WhatsApp", "error");
    } finally {
      setSending(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    showToast("Image removed", "info");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("upload_title") || "Upload Prescription"}
        </Text>

        <Text style={[styles.subtitle, { color: colors.text + "99" }]}>
          {t("upload_subtitle") || "Share your prescription with us"}
        </Text>

        {!authToken && (
          <View style={[styles.warningBanner, { backgroundColor: "#FFF3CD", borderColor: "#FFC107" }]}>
            <Ionicons name="warning" size={20} color="#856404" />
            <Text style={[styles.warningText, { color: "#856404" }]}>
              The prescription will not be stored without login. Please login to save securely.
            </Text>
          </View>
        )}

        {!selectedImage ? (
          <>
            <View style={styles.centerImage}>
              <Image
                source={require("../../assets/images/prescription.png")}
                style={styles.image}
              />
            </View>

            <TouchableOpacity
              style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
              onPress={handleUploadPress}
            >
              <Text style={styles.uploadText}>
                {t("upload_button") || "Select Prescription"}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.description, { color: colors.text + "CC" }]}>
              {t("upload_description") ||
                "Take a clear photo of your prescription or select from gallery"}
            </Text>

            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={[styles.link, { color: colors.primary }]}>
                {t("upload_valid_guide_link") || "What makes a valid prescription?"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.previewContainer}>
            <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />

              <View style={styles.previewInfo}>
                <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                <Text style={[styles.previewText, { color: colors.text }]}>
                  Prescription selected
                </Text>
                <Text style={[styles.previewFileName, { color: colors.text + "99" }]}>
                  {selectedImage.uri.split("/").pop()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.sendRequestBtn,
                { backgroundColor: "#007BFF", opacity: uploading ? 0.6 : 1 },
              ]}
              onPress={handleUploadToServer}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <ActivityIndicator color="white" />
                  <Text style={styles.sendRequestText}>Uploading...</Text>
                </>
              ) : (
                <Text style={styles.sendRequestText}>Upload to Server</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendRequestBtn,
                { backgroundColor: "#25D366", opacity: sending ? 0.6 : 1 },
              ]}
              onPress={handleSendRequest}
              disabled={sending}
            >
              <Ionicons name="logo-whatsapp" size={20} color="white" />
              <Text style={styles.sendRequestText}>Send Request via WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.changeImageBtn, { borderColor: colors.primary }]}
              onPress={handleRemoveImage}
            >
              <Ionicons name="refresh" size={18} color={colors.primary} />
              <Text style={[styles.changeImageText, { color: colors.primary }]}>
                Select Different Image
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertModal.visible}
        onClose={closeAlertModal}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        buttons={alertModal.buttons}
      />

      {/* Valid Prescription Modal */}
      <ValidPrescriptionModal
        visible={modalVisible}
        close={() => setModalVisible(false)}
      />

      {/* WhatsApp Instructions Modal */}
      <Modal
        visible={whatsappModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setWhatsappModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="information-circle" size={48} color="#25D366" />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Send via WhatsApp
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalText, { color: colors.text }]}>
                You need to manually send the prescription document in WhatsApp by:
              </Text>

              <View style={styles.instructionsList}>
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#25D366" />
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    Opening your gallery or camera in WhatsApp
                  </Text>
                </View>
                
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#25D366" />
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    Selecting your prescription image
                  </Text>
                </View>
                
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#25D366" />
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    Sending it to our pharmacy
                  </Text>
                </View>
              </View>

              <Text style={[styles.modalNote, { color: colors.text + "99" }]}>
                We'll open WhatsApp for you. Please attach the prescription image using the attachment button (📎) in the chat.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.primary }]}
                onPress={() => setWhatsappModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.primary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.proceedButton, { backgroundColor: "#25D366" }]}
                onPress={proceedToWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={20} color="white" />
                <Text style={styles.proceedButtonText}>Open WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  warningText: { flex: 1, fontSize: 13, lineHeight: 18 },
  centerImage: { alignItems: "center", marginVertical: 20 },
  image: { width: 160, height: 160, resizeMode: "contain" },
  uploadBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: { color: "#fff", fontWeight: "700", textAlign: "center", fontSize: 16 },
  description: { fontSize: 14, marginTop: 20, lineHeight: 22 },
  link: { fontSize: 15, marginTop: 16, fontWeight: "600" },
  previewContainer: { marginTop: 20 },
  previewCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  previewImage: { width: "100%", height: 280, resizeMode: "cover" },
  previewInfo: { padding: 16, alignItems: "center" },
  previewText: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  previewFileName: { fontSize: 12, marginTop: 4 },
  sendRequestBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sendRequestText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  changeImageBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  changeImageText: { fontWeight: "700", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: { alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: "700", marginTop: 12 },
  modalBody: { marginBottom: 24 },
  modalText: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  instructionsList: { gap: 12, marginBottom: 16 },
  instructionItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  instructionText: { flex: 1, fontSize: 14, lineHeight: 20 },
  modalNote: { fontSize: 13, lineHeight: 18, fontStyle: "italic" },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: { borderWidth: 2 },
  cancelButtonText: { fontWeight: "600", fontSize: 15 },
  proceedButton: { flexDirection: "row", gap: 6 },
  proceedButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
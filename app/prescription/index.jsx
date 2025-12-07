// app/my-prescriptions.js or screens/MyPrescriptionsScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlertModal from "../../components/CustomAlertModal";
import { API } from "../../constants/constant"; 
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const API_URL = API;

export default function MyPrescriptionsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { authToken } = useAuth();
  const { showToast } = useToast();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Alert modal state
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

  useEffect(() => {
    if (authToken) {
      fetchPrescriptions();
    } else {
      showAlertModal(
        "Login Required",
        "Please login to view your prescriptions",
        "warning",
        [
          {
            text: "Login",
            style: "primary",
            onPress: () => router.push("/login"),
          },
        ]
      );
    }
  }, [authToken]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/prescriptions/my-prescriptions`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      showToast("Failed to load prescriptions", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrescriptions();
  };

  const handleDelete = (prescriptionId) => {
    showAlertModal(
      "Delete Prescription",
      "Are you sure you want to delete this prescription? This action cannot be undone.",
      "warning",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDelete(prescriptionId),
        },
      ]
    );
  };

  const confirmDelete = async (prescriptionId) => {
    try {
      setDeletingId(prescriptionId);

      await axios.delete(`${API_URL}/prescriptions/${prescriptionId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Remove from local state
      setPrescriptions((prev) =>
        prev.filter((item) => item._id !== prescriptionId)
      );

      showToast("Prescription deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting prescription:", error);
      showToast(
        error.response?.data?.detail || "Failed to delete prescription",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#27AE60";
      case "rejected":
        return "#E74C3C";
      case "pending":
      default:
        return "#F39C12";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      case "pending":
      default:
        return "time";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderPrescriptionItem = ({ item }) => (
    <View style={[styles.prescriptionCard, { backgroundColor: colors.card }]}>
      {/* Image */}
      <Image
        source={{ uri: `${API_URL}${item.file_path}` }}
        style={styles.prescriptionImage}
        resizeMode="cover"
      />

      {/* Info Section */}
      <View style={styles.infoSection}>
        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Ionicons
            name={getStatusIcon(item.status)}
            size={16}
            color={getStatusColor(item.status)}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>

        {/* File Name */}
        <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
          {item.original_filename}
        </Text>

        {/* Upload Date */}
        <Text style={[styles.uploadDate, { color: colors.text + "99" }]}>
          Uploaded: {formatDate(item.uploaded_at)}
        </Text>

        {/* File Size */}
        <Text style={[styles.fileSize, { color: colors.text + "80" }]}>
          Size: {(item.file_size / 1024).toFixed(2)} KB
        </Text>

        {/* Notes if any */}
        {item.notes && (
          <View style={[styles.notesContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.notesLabel, { color: colors.text }]}>Notes:</Text>
            <Text style={[styles.notesText, { color: colors.text + "CC" }]}>
              {item.notes}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.viewButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              // You can implement a full-screen image viewer here
              showAlertModal(
                "View Prescription",
                "Full image viewer coming soon!",
                "info"
              );
            }}
          >
            <Ionicons name="eye" size={18} color="#fff" />
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              {
                backgroundColor: "#E74C3C",
                opacity: deletingId === item._id ? 0.6 : 1,
              },
            ]}
            onPress={() => handleDelete(item._id)}
            disabled={deletingId === item._id}
          >
            {deletingId === item._id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="trash" size={18} color="#fff" />
                <Text style={styles.buttonText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color={colors.text + "40"} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Prescriptions Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text + "99" }]}>
        Upload your first prescription to get started
      </Text>
      <TouchableOpacity
        style={[styles.uploadButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/upload")}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.uploadButtonText}>Upload Prescription</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading prescriptions...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity> */}
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          My Prescriptions
        </Text>
        {/* <TouchableOpacity
          onPress={() => router.push("/upload")}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity> */}
      </View>

      {/* Prescriptions List */}
      <FlatList
        data={prescriptions}
        renderItem={renderPrescriptionItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContainer,
          prescriptions.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertModal.visible}
        onClose={closeAlertModal}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        buttons={alertModal.buttons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  prescriptionCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prescriptionImage: {
    width: "100%",
    height: 200,
  },
  infoSection: {
    padding: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  uploadDate: {
    fontSize: 13,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    marginBottom: 12,
  },
  notesContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  viewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
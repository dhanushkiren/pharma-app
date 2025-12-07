import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API } from "../../constants/constant";
import { useToast } from "../../context/ToastContext";

export default function EditProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    address: user?.address || "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = t("edit_profile.validation.username_required");
    } else if (formData.username.trim().length < 3) {
      newErrors.username = t("edit_profile.validation.username_min");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("edit_profile.validation.email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("edit_profile.validation.email_invalid");
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = t("edit_profile.validation.mobile_required");
    } else if (!/^\d{10,15}$/.test(formData.mobile.replace(/\D/g, ""))) {
      newErrors.mobile = t("edit_profile.validation.mobile_invalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await updateProfile(formData);
      // Alert.alert(
      //   t("edit_profile.success"),
      //   t("edit_profile.success_message")
      // );
      showToast(t("edit_profile.success_message"), t("edit_profile.success"));
      navigation?.goBack();
    } catch (error) {
      // Alert.alert(
      //   t("edit_profile.error"),
      //   error?.message || t("edit_profile.error_message")
      // );
      showToast(t("edit_profile.error_message"), t("edit_profile.error"));
      console.error("Update profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const renderInput = (label, field, placeholder, keyboardType = "default") => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: errors[field] ? "#E53935" : colors.border,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.text + "80"}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        keyboardType={keyboardType}
        editable={!loading}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("edit_profile.title")}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View
          style={[
            styles.avatarPlaceholder,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Ionicons name="person" size={50} color={colors.primary} />
        </View>
      </View>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        {renderInput(
          t("edit_profile.username"),
          "username",
          t("edit_profile.username_placeholder")
        )}
        {renderInput(
          t("edit_profile.email"),
          "email",
          t("edit_profile.email_placeholder"),
          "email-address"
        )}
        {renderInput(
          t("edit_profile.mobile"),
          "mobile",
          t("edit_profile.mobile_placeholder"),
          "phone-pad"
        )}
        {renderInput(
          t("edit_profile.address"),
          "address",
          t("edit_profile.address_placeholder"),
          "default"
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.cancelBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => navigation?.goBack()}
          disabled={loading}
        >
          <Text style={[styles.cancelBtnText, { color: colors.text }]}>
            {t("edit_profile.cancel")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 },
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveBtnText}>{t("edit_profile.save")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
  },

  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  formContainer: {
    marginBottom: 30,
  },

  fieldContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: "500",
  },

  errorText: {
    color: "#E53935",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },

  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  saveBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
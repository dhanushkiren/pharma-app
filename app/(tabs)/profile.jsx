import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import i18n from "../i18n";
import { ThemeContext } from "../theme-context";

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const router = useRouter();
  const { colors } = useTheme();
  const { logout, loading, user, isLoggedIn } = useAuth();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी" },
    { code: "kn", name: "ಕನ್ನಡ" },
  ];

  const handleLanguageSelect = async (languageCode) => {
    try {
      i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      await AsyncStorage.setItem("language", languageCode);
      setShowLanguageDropdown(false);
    } catch (err) {
      console.error("Error changing language:", err);
    }
  };

  const getLanguageName = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang ? lang.name : "English";
  };

  // Menu items shown only when authenticated
  const authenticatedMenuItems = [
    {
      id: "edit-profile",
      icon: "person",
      label: t("profile.edit_profile"),
      color: "#667EEA",
      onPress: () => router.push("edit-profile"),
    },
    {
      id: "my-prescriptions",
      icon: "document-text",
      label: t("profile.my_prescriptions") || "My Prescriptions",
      color: "#4CAF50",
      onPress: () => router.push("prescription"),
    },
    // {
    //   id: "change-password",
    //   icon: "lock-closed",
    //   label: t("profile.change_password"),
    //   color: "#5B7CFA",
    //   onPress: () => navigation?.navigate("ChangePassword"),
    // },
  ];

  // Menu items shown for all users
  const commonMenuItems = [
    {
      id: "change-language",
      icon: "globe",
      label: t("profile.change_language"),
      color: "#748BFF",
      onPress: () => setShowLanguageDropdown(true),
    },
    {
      id: "change-theme",
      icon: theme === "dark" ? "sunny" : "moon",
      label: t("profile.change_theme"),
      color: "#845EF7",
      onPress: toggleTheme,
    },
  ];

  // Menu items based on authentication status
  const authMenuItems = isLoggedIn
    ? [
        {
          id: "logout",
          icon: "log-out",
          label: t("profile.logout"),
          color: "#E53935",
          onPress: logout,
          isLogout: true,
        },
      ]
    : [
        {
          id: "login",
          icon: "log-in",
          label: t("profile.login"),
          color: "#4CAF50",
          onPress: () => router.push("auth/login"),
        },
        {
          id: "signup",
          icon: "person-add",
          label: t("profile.signup"),
          color: "#2196F3",
          onPress: () => router.push("auth/register"),
        },
      ];

  const menuItems = [
    ...authenticatedMenuItems.filter(() => isLoggedIn),
    ...commonMenuItems,
    ...authMenuItems,
  ];

  const renderLanguageOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.languageOption,
        {
          backgroundColor: currentLanguage === item.code ? colors.primary + "20" : colors.card,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <Text style={[styles.languageOptionText, { color: colors.text }]}>
        {item.name}
      </Text>
      {currentLanguage === item.code && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={item.onPress}
      disabled={loading && item.isLogout}
      activeOpacity={0.6}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: item.color + "20" },
          ]}
        >
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        <Text style={[styles.menuItemText, { color: colors.text }]}>
          {item.label}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={22}
        color={colors.text}
        style={{ opacity: 0.5 }}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("profile.settings")}
        </Text>
      </View>

      {/* User Profile Card - Only shown when authenticated */}
      {isLoggedIn && user && (
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="person" size={30} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.username || t("profile.user")}
            </Text>
            <Text
              style={[styles.editAccount, { color: colors.primary }]}
              onPress={() => router.push("edit-profile")}
            >
              {t("profile.edit_account")}
            </Text>
          </View>
        </View>
      )}

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.border },
              ]}
            />
          )}
        />
      </View>

      {/* Language Dropdown Modal */}
      <Modal
        visible={showLanguageDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageDropdown(false)}
        >
          <View
            style={[
              styles.dropdownContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.dropdownHeader}>
              <Text style={[styles.dropdownTitle, { color: colors.text }]}>
                {t("select_language")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowLanguageDropdown(false)}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              renderItem={renderLanguageOption}
              keyExtractor={(item) => item.code}
              scrollEnabled={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },

  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  editAccount: {
    fontSize: 14,
    fontWeight: "500",
  },

  menuContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },

  separator: {
    height: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  dropdownContainer: {
    width: "80%",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    maxHeight: 250,
  },

  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },

  dropdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
  },

  languageOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
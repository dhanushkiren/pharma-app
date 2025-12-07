// app/auth/register.js
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const validateForm = () => {
    if (!username.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a username",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }

    if (username.trim().length < 3) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Username must be at least 3 characters",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }

    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter an email",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid email",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }

    if (!password.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a password",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Password must be at least 6 characters",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Passwords do not match",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsRegistering(true);
      console.log('🔵 Starting registration...');

      const result = await register(
        username.trim(),
        email.trim(),
        password,
        mobile.trim(),
        address.trim()
      );

      console.log('🔵 Registration result:', result);

      if (!result || !result.success) {
        console.log('🔴 Registration failed:', result?.error);
        setIsRegistering(false);
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: result?.error || "Unable to create account",
          position: "top",
          visibilityTime: 3000,
        });
        return;
      }

      // Registration successful
      console.log('🟢 Registration successful!');
      
      if (result.autoLogin) {
        // Auto-login successful
        Toast.show({
          type: "success",
          text1: "Account Created! 🎉",
          text2: "Welcome to Pharma App!",
          position: "top",
          visibilityTime: 2000,
        });

        // Navigate to home after showing toast
        setTimeout(() => {
          console.log('🟢 Navigating to home...');
          setIsRegistering(false);
          router.replace("/(tabs)");
        }, 1500);
      } else {
        // Registration success but auto-login failed
        setIsRegistering(false);
        Toast.show({
          type: "success",
          text1: "Account Created! ✅",
          text2: "Please login to continue",
          position: "top",
          visibilityTime: 2000,
        });

        setTimeout(() => {
          router.replace("/auth/login");
        }, 1500);
      }

    } catch (error) {
      console.error('🔴 Registration exception:', error);
      setIsRegistering(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/auth/login");
    }
  };

  const themedStyles = styles(colors);
  const isDisabled = isRegistering;

  return (
    <>
      <ScrollView
        style={[themedStyles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={themedStyles.header}>
          {/* <TouchableOpacity onPress={handleGoBack} disabled={isDisabled}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity> */}
          <View style={themedStyles.logoSection}>
          <View
            style={[
              themedStyles.logoCircle,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="medkit" size={40} color="#fff" />
          </View>
          </View>
          <Text style={[themedStyles.title, { color: colors.text }]}>
            Create Account
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <View style={themedStyles.form}>
          {/* Username Input */}
          <View style={themedStyles.inputGroup}>
            <Text style={[themedStyles.label, { color: colors.text }]}>
              Username <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <View
              style={[
                themedStyles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.text + "80"}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={[themedStyles.input, { color: colors.text }]}
                placeholder="Min 3 characters"
                placeholderTextColor={colors.text + "80"}
                value={username}
                onChangeText={setUsername}
                editable={!isDisabled}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={themedStyles.inputGroup}>
            <Text style={[themedStyles.label, { color: colors.text }]}>
              Email <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <View
              style={[
                themedStyles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.text + "80"}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={[themedStyles.input, { color: colors.text }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.text + "80"}
                value={email}
                onChangeText={setEmail}
                editable={!isDisabled}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Mobile Input (Optional) */}
          <View style={themedStyles.inputGroup}>
            <Text style={[themedStyles.label, { color: colors.text }]}>
              Mobile <Text style={[themedStyles.optional, { color: colors.text + "60" }]}>(Optional)</Text>
            </Text>
            <View
              style={[
                themedStyles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.text + "80"}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={[themedStyles.input, { color: colors.text }]}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.text + "80"}
                value={mobile}
                onChangeText={setMobile}
                editable={!isDisabled}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Address Input (Optional) */}
          <View style={themedStyles.inputGroup}>
            <Text style={[themedStyles.label, { color: colors.text }]}>
              Address <Text style={[themedStyles.optional, { color: colors.text + "60" }]}>(Optional)</Text>
            </Text>
            <View
              style={[
                themedStyles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.text + "80"}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={[themedStyles.input, { color: colors.text }]}
                placeholder="Enter your address"
                placeholderTextColor={colors.text + "80"}
                value={address}
                onChangeText={setAddress}
                editable={!isDisabled}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={themedStyles.inputGroup}>
            <Text style={[themedStyles.label, { color: colors.text }]}>
              Password <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <View
              style={[
                themedStyles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text + "80"}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={[themedStyles.input, { color: colors.text }]}
                placeholder="Min 6 characters"
                placeholderTextColor={colors.text + "80"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isDisabled}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 8 }}
                disabled={isDisabled}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color={colors.text + "80"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={themedStyles.inputGroup}>
            <Text style={[themedStyles.label, { color: colors.text }]}>
              Confirm Password <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <View
              style={[
                themedStyles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text + "80"}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={[themedStyles.input, { color: colors.text }]}
                placeholder="Confirm password"
                placeholderTextColor={colors.text + "80"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isDisabled}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ padding: 8 }}
                disabled={isDisabled}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color={colors.text + "80"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              themedStyles.registerButton,
              { 
                backgroundColor: colors.primary,
                opacity: isDisabled ? 0.6 : 1 
              },
            ]}
            onPress={handleRegister}
            disabled={isDisabled}
          >
            {isRegistering ? (
              <View style={themedStyles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[themedStyles.registerButtonText, { marginLeft: 10 }]}>
                  Creating Account...
                </Text>
              </View>
            ) : (
              <Text style={themedStyles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={themedStyles.loginContainer}>
            <Text style={[themedStyles.loginText, { color: colors.text + "80" }]}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/auth/login")}
              disabled={isDisabled}
            >
              <Text style={[themedStyles.loginLink, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Requirements */}
        {/* <View
          style={[
            themedStyles.requirementsBox,
            { backgroundColor: colors.card, borderLeftColor: colors.primary },
          ]}
        >
          <Text
            style={[themedStyles.requirementsTitle, { color: colors.primary }]}
          >
            ✓ Requirements
          </Text>
          <Text style={[themedStyles.reqText, { color: colors.text + "80" }]}>
            • Username: min 3 chars (required)
          </Text>
          <Text style={[themedStyles.reqText, { color: colors.text + "80" }]}>
            • Email: valid format (required)
          </Text>
          <Text style={[themedStyles.reqText, { color: colors.text + "80" }]}>
            • Password: min 6 chars (required)
          </Text>
          <Text style={[themedStyles.reqText, { color: colors.text + "80" }]}>
            • Mobile & Address: optional fields
          </Text>
        </View> */}
      </ScrollView>

      {/* Full Screen Loading Overlay */}
      {isRegistering && (
        <View style={themedStyles.fullScreenLoader}>
          <View style={[themedStyles.loaderCard, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[themedStyles.loaderText, { color: colors.text }]}>
              Creating your account...
            </Text>
            <Text style={[themedStyles.loaderSubtext, { color: colors.text + "80" }]}>
              Please wait
            </Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 40,
    },

    header: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32,
    },

    title: {
      fontSize: 24,
      fontWeight: "bold",
    },

    form: {
      marginBottom: 32,
    },

    inputGroup: {
      marginBottom: 18,
    },

    label: {
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 8,
    },

    optional: {
      fontSize: 11,
      fontWeight: "400",
    },

    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 3,
    },

    input: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      borderWidth: 0,
    },

    registerButton: {
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 16,
      marginTop: 8,
    },

    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    registerButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },

    loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    loginText: {
      fontSize: 13,
    },

    loginLink: {
      fontSize: 13,
      fontWeight: "bold",
    },

    requirementsBox: {
      padding: 14,
      borderRadius: 10,
      borderLeftWidth: 4,
    },

    requirementsTitle: {
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 10,
    },

    reqText: {
      fontSize: 11,
      marginBottom: 6,
      lineHeight: 18,
    },

    // Full Screen Loader Styles
    fullScreenLoader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },

    loaderCard: {
      padding: 30,
      borderRadius: 16,
      alignItems: "center",
      minWidth: 200,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },

    loaderText: {
      fontSize: 16,
      fontWeight: "600",
      marginTop: 16,
    },

    loaderSubtext: {
      fontSize: 13,
      marginTop: 4,
    },

    logoSection: {
      alignItems: "center",
      marginBottom: 8,
    },

    logoCircle: {
      width: 70,
      height: 70,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
  });
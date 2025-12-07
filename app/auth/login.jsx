// app/auth/login.js
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
  View
} from "react-native";
import Toast from "react-native-toast-message";

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const { login, loading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter username and password",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setIsLoggingIn(true);
      // console.log('Starting login process...');

      const result = await login(username, password);
      
      // console.log('Login result:', result);

      if (!result || !result.success) {
        // console.log('Login failed:', result?.error);
        // Login failed - stop loading and show error
        setIsLoggingIn(false);
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: result?.error || "Invalid credentials",
          position: "top",
          visibilityTime: 3000,
        });

        return;
      }

      // Login successful - show success toast
      // console.log('Login successful!');
      Toast.show({
        type: "success",
        text1: "Login Successful! 🎉",
        text2: "Welcome back!",
        position: "top",
        visibilityTime: 2000,
      });

      // Wait for toast to be visible, then navigate
      setTimeout(() => {
        // console.log('Navigating to home...');
        setIsLoggingIn(false);
        router.replace("/(tabs)");
      }, 1500);

    } catch (error) {
      // console.error('Login exception:', error);
      setIsLoggingIn(false);
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
    // Check if we can go back, otherwise go to home
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const themedStyles = styles(colors);
  const isDisabled = loading || isLoggingIn;

  return (
    <>
      <ScrollView
        style={[themedStyles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        {/* <TouchableOpacity
          style={themedStyles.backButton}
          onPress={handleGoBack}
          disabled={isDisabled}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity> */}

        {/* Logo/Header */}
        <View style={themedStyles.logoSection}>
          <View
            style={[
              themedStyles.logoCircle,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="medkit" size={60} color="#fff" />
          </View>
          <Text style={[themedStyles.appTitle, { color: colors.text }]}>
            Pharma App
          </Text>
          <Text style={[themedStyles.subtitle, { color: colors.text + "80" }]}>
            Sign in to your account
          </Text>
        </View>

        {/* Form */}
        <View style={themedStyles.form}>
          {/* Username Input */}
          <View style={themedStyles.inputGroup}>
            <Text style={[themedStyles.label, { color: colors.text }]}>
              Username or Email
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
                placeholder="Enter username or email"
                placeholderTextColor={colors.text + "80"}
                value={username}
                onChangeText={setUsername}
                editable={!isDisabled}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={themedStyles.inputGroup}>
            <Text style={[themedStyles.label, { color: colors.text }]}>
              Password
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
                placeholder="Enter your password"
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

          {/* Forgot Password */}
          <TouchableOpacity 
            style={themedStyles.forgotButton}
            disabled={isDisabled}
          >
            <Text style={[themedStyles.forgotText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              themedStyles.loginButton,
              { 
                backgroundColor: colors.primary,
                opacity: isDisabled ? 0.6 : 1 
              }
            ]}
            onPress={handleLogin}
            disabled={isDisabled}
          >
            {isLoggingIn ? (
              <View style={themedStyles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[themedStyles.loginButtonText, { marginLeft: 10 }]}>
                  Signing In...
                </Text>
              </View>
            ) : (
              <Text style={themedStyles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={themedStyles.dividerContainer}>
            <View
              style={[
                themedStyles.dividerLine,
                { backgroundColor: colors.border },
              ]}
            />
            <Text style={[themedStyles.dividerText, { color: colors.text + "80" }]}>
              OR
            </Text>
            <View
              style={[
                themedStyles.dividerLine,
                { backgroundColor: colors.border },
              ]}
            />
          </View>

          {/* Sign Up Link */}
          <View style={themedStyles.signupContainer}>
            <Text style={[themedStyles.signupText, { color: colors.text + "80" }]}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/auth/register")}
              disabled={isDisabled}
            >
              <Text style={[themedStyles.signupLink, { color: colors.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Info */}
        {/* <View
          style={[
            themedStyles.infoBox,
            { backgroundColor: colors.card, borderLeftColor: colors.primary },
          ]}
        >
          <Text style={[themedStyles.infoTitle, { color: colors.primary }]}>
            💡 Demo Credentials
          </Text>
          <Text style={[themedStyles.infoText, { color: colors.text + "80" }]}>
            Username: demo_user
          </Text>
          <Text style={[themedStyles.infoText, { color: colors.text + "80" }]}>
            Password: password123
          </Text>
        </View> */}
      </ScrollView>

      {/* Full Screen Loading Overlay */}
      {isLoggingIn && (
        <View style={themedStyles.fullScreenLoader}>
          <View style={[themedStyles.loaderCard, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[themedStyles.loaderText, { color: colors.text }]}>
              Logging you in...
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
      paddingTop: 10,
      paddingBottom: 40,
    },

    backButton: {
      marginBottom: 16,
      padding: 8,
      alignSelf: "flex-start",
    },

    logoSection: {
      alignItems: "center",
      marginBottom: 40,
    },

    logoCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },

    appTitle: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 14,
    },

    form: {
      marginBottom: 32,
    },

    inputGroup: {
      marginBottom: 20,
    },

    label: {
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 8,
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

    forgotButton: {
      alignSelf: "flex-end",
      marginBottom: 24,
    },

    forgotText: {
      fontSize: 13,
      fontWeight: "600",
    },

    loginButton: {
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 20,
    },

    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    loginButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },

    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },

    dividerLine: {
      flex: 1,
      height: 1,
    },

    dividerText: {
      marginHorizontal: 12,
      fontSize: 12,
      fontWeight: "600",
    },

    signupContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    signupText: {
      fontSize: 14,
    },

    signupLink: {
      fontSize: 14,
      fontWeight: "bold",
    },

    infoBox: {
      padding: 14,
      borderRadius: 10,
      borderLeftWidth: 4,
    },

    infoTitle: {
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 8,
    },

    infoText: {
      fontSize: 11,
      marginBottom: 4,
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
  });
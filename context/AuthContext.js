// context/AuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { API } from '../constants/constant';

const AuthContext = createContext();
const API_URL = API;

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on app startup
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setAuthToken(token);
          setUser(JSON.parse(userData));
          setIsLoggedIn(true);
          console.log('✅ Token verified on app start');
        } catch (err) {
          console.log('❌ Token expired or invalid');
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
          setIsLoggedIn(false);
          setAuthToken(null);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Error bootstrapping auth:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (usernameOrEmail, password) => {
    try {
      setError(null);

      console.log('🔐 Login attempt with:', { usernameOrEmail });

      const response = await axios.post(`${API_URL}/auth/token`, {
        username: usernameOrEmail,
        password: password,
      });

      console.log('✅ Login response received');

      const { access_token } = response.data;

      if (!access_token) {
        console.error('❌ No access token in response');
        return { success: false, error: 'No access token received' };
      }

      // Get user info with the token
      const userResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const userData = userResponse.data.user;

      // Store token and user data
      await AsyncStorage.setItem('authToken', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setAuthToken(access_token);
      setUser(userData);
      setIsLoggedIn(true);

      console.log('✅ Login successful, user:', userData.username);
      return { success: true, data: userData };
      
    } catch (err) {
      console.error('❌ Login error:', err.response?.data || err.message);
      
      setIsLoggedIn(false);
      setAuthToken(null);
      setUser(null);
      
      let errorMessage = 'Login failed';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username, email, password, mobile = "", address = "") => {
    try {
      setError(null);

      console.log('📝 Register attempt with:', { username, email });

      // Step 1: Register the user
      const registerResponse = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
        mobile: mobile || "",
        address: address || "",
      });

      console.log('✅ Registration response:', registerResponse.data);

      // Step 2: Auto-login after successful registration
      console.log('🔐 Auto-login after registration...');
      
      const loginResponse = await axios.post(`${API_URL}/auth/token`, {
        username: username,
        password: password,
      });

      const { access_token } = loginResponse.data;

      if (!access_token) {
        console.error('❌ No access token in login response');
        return { 
          success: true, 
          autoLogin: false,
          message: 'Registration successful but auto-login failed. Please login manually.',
          data: registerResponse.data.user 
        };
      }

      // Step 3: Get user info with the token
      const userResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const userData = userResponse.data.user;

      // Step 4: Store token and user data
      await AsyncStorage.setItem('authToken', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Step 5: Update state
      setAuthToken(access_token);
      setUser(userData);
      setIsLoggedIn(true);

      console.log('✅ Registration and auto-login successful');
      return { 
        success: true, 
        autoLogin: true,
        data: userData 
      };

    } catch (err) {
      console.error('❌ Register error:', err.response?.data || err.message);
      
      let errorMessage = 'Registration failed';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.detail || 'Username or email already exists';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Clear stored data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');

      // Update state
      setAuthToken(null);
      setUser(null);
      setIsLoggedIn(false);
      setError(null);

      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.put(
        `${API_URL}/auth/profile`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const updatedUser = response.data.user || response.data;

      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, data: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      if (!authToken) return { success: false };

      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const newToken = response.data.access_token;

      // Store new token
      await AsyncStorage.setItem('authToken', newToken);
      setAuthToken(newToken);

      return { success: true, token: newToken };
    } catch (err) {
      // If refresh fails, logout user
      await logout();
      return { success: false };
    }
  };

  const value = {
    isLoggedIn,
    authToken,
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    bootstrapAsync,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
import { API } from '../../constants/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "@react-navigation/native";
import axios from 'axios';
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useToast } from "../../context/ToastContext";

const API_URL = API; // Replace with your API URL

export default function AddPartnerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { showToast } = useToast();

  const partnerTypes = ['Pharmacy', 'Hospital', 'Clinic', 'Diagnostic Center', 'Other'];

  const [formData, setFormData] = useState({
    name: '',
    type: 'Pharmacy',
    address: '',
    phone: '',
    email: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.type || !formData.address || !formData.phone) {
      // Alert.alert('Error', 'Please fill in all required fields');
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Validate phone number (basic)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      // Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    // Validate email if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        // Alert.alert('Error', 'Please enter a valid email address');
        showToast('Please enter a valid email address', 'error');
        return;
      }
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/partners/`,
        {
          name: formData.name,
          type: formData.type,
          address: formData.address,
          phone: formData.phone,
          email: formData.email || null,
          image: formData.image || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Alert.alert('Success', 'Partner added successfully!', [
      //   { text: 'OK', onPress: () => router.back() }
      // ]);
      showToast('Partner added successfully!', 'success');

      // Reset form
      setFormData({
        name: '',
        type: 'Pharmacy',
        address: '',
        phone: '',
        email: '',
        image: ''
      });
    } catch (error) {
      console.error('Error adding partner:', error);
      // Alert.alert(
      //   'Error',
      //   error.response?.data?.detail || 'Failed to add partner'
      // );
      showToast('Failed to add partner', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Add New Partner
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Partner Name *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text,
              },
            ]}
            placeholder="e.g., Apollo Pharmacy"
            placeholderTextColor={colors.text + '80'}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Partner Type *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.typeGroup}>
              {partnerTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    {
                      borderColor: colors.border,
                      backgroundColor:
                        formData.type === type ? '#27AE60' : colors.card,
                    },
                  ]}
                  onPress={() => handleInputChange('type', type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color: formData.type === type ? '#fff' : colors.text,
                      },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Address *
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text,
              },
            ]}
            placeholder="Enter complete address..."
            placeholderTextColor={colors.text + '80'}
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Phone Number *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text,
              },
            ]}
            placeholder="e.g., 9876543210"
            placeholderTextColor={colors.text + '80'}
            keyboardType="phone-pad"
            maxLength={10}
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Email (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text,
              },
            ]}
            placeholder="e.g., contact@partner.com"
            placeholderTextColor={colors.text + '80'}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Logo/Image URL (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text,
              },
            ]}
            placeholder="https://example.com/logo.jpg"
            placeholderTextColor={colors.text + '80'}
            value={formData.image}
            onChangeText={(value) => handleInputChange('image', value)}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Partner</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  typeGroup: { flexDirection: 'row', gap: 10 },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeText: { fontSize: 14, fontWeight: '600' },
  submitButton: {
    backgroundColor: '#27AE60',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
});
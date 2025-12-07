import { useTheme } from "@react-navigation/native";
import axios from 'axios';
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { API } from '../../constants/constant';
import { useToast } from "../../context/ToastContext";

const API_URL = API; // Replace with your API URL

export default function AddProductScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: 'In Stock',
    image: null,
    description: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    setFormData(prev => ({
      ...prev,
      image: result.assets[0]  // store full file details
    }));
  }
};

React.useEffect(() => {
  (async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      // Alert.alert("Permission denied", "Please allow gallery access.");
      showToast("Gallery access is required to pick images.", "error");
    }
  })();
}, []);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  
  const handleSubmit = async () => {
  if (!formData.name || !formData.price || !formData.category || !formData.quantity) {
    // Alert.alert("Error", "Please fill required fields");
    showToast("Please fill required fields", "error");
    return;
  }

  try {
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("brandname", formData.category);
    data.append("quantity", formData.quantity);
    data.append("price", String(formData.price));
    data.append("description", formData.description ?? "");

    if (formData.image) {
      data.append("image", {
        uri: formData.image.uri,
        type: "image/jpeg",
        name: "product.jpg"
      });
    }

    console.log("Sending: ", {
  name: formData.name,
  brandname: formData.category,
  quantity: formData.quantity,
  price: formData.price,
  description: formData.description,
  image: formData.image ? "image selected" : "no image",
});

    const response = await axios.post(`${API_URL}/products/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Alert.alert("Success", "Product added successfully!");
    showToast("Product added successfully!", "success");
    router.back();

  } catch (error) {
    console.log("Upload error:", error.response?.data || error);
    // Alert.alert("Error", "Failed to upload product");
    showToast("Failed to upload product", "error");
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
          Add New Product
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Product Name *
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
            placeholder="e.g., Paracetamol 500mg"
            placeholderTextColor={colors.text + '80'}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Price (₹) *
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
            placeholder="e.g., 25"
            placeholderTextColor={colors.text + '80'}
            keyboardType="decimal-pad"
            value={formData.price}
            onChangeText={(value) => handleInputChange('price', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            brand Name *
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
            placeholder="e.g., Pain Relief"
            placeholderTextColor={colors.text + '80'}
            value={formData.category}
            onChangeText={(value) => handleInputChange('category', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Quantity *
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
            placeholder="e.g., 25"
            placeholderTextColor={colors.text + '80'}
            value={formData.quantity}
            onChangeText={(value) => handleInputChange('quantity', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Stock Status *
          </Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                {
                  borderColor: colors.border,
                  backgroundColor:
                    formData.stock === 'In Stock' ? '#4A90E2' : colors.card,
                },
              ]}
              onPress={() => handleInputChange('stock', 'In Stock')}
            >
              <Text
                style={[
                  styles.radioText,
                  {
                    color:
                      formData.stock === 'In Stock' ? '#fff' : colors.text,
                  },
                ]}
              >
                In Stock
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioButton,
                {
                  borderColor: colors.border,
                  backgroundColor:
                    formData.stock === 'Out of Stock' ? '#E74C3C' : colors.card,
                },
              ]}
              onPress={() => handleInputChange('stock', 'Out of Stock')}
            >
              <Text
                style={[
                  styles.radioText,
                  {
                    color:
                      formData.stock === 'Out of Stock' ? '#fff' : colors.text,
                  },
                ]}
              >
                Out of Stock
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Image URL *
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
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={colors.text + '80'}
            value={formData.image}
            onChangeText={(value) => handleInputChange('image', value)}
            autoCapitalize="none"
          />
        </View> */}

        <TouchableOpacity
  onPress={pickImage}
  style={{
    padding: 12,
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    marginBottom: 10
  }}
>
  <Text style={{ color: "#fff", textAlign: "center" }}>
    Pick Image
  </Text>
</TouchableOpacity>

{formData.image && (
  <Image
    source={{ uri: formData.image.uri }}
    style={{ width: 120, height: 120, borderRadius: 10, marginBottom: 20 }}
  />
)}

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Description (Optional)
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
            placeholder="Enter product description..."
            placeholderTextColor={colors.text + '80'}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={4}
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
            <Text style={styles.submitButtonText}>Add Product</Text>
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
  textArea: { height: 100, textAlignVertical: 'top' },
  radioGroup: { flexDirection: 'row', gap: 12 },
  radioButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  radioText: { fontSize: 14, fontWeight: '600' },
  submitButton: {
    backgroundColor: '#4A90E2',
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
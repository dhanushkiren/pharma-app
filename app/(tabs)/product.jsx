
import { useTheme } from "@react-navigation/native";
import axios from 'axios';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { API } from '../../constants/constant';
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

const API_URL = API;

export default function ProductScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brandname?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [search, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products/`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Alert.alert('Error', 'Failed to load products');
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleAddToCart = async (product) => {
    try {
      setAddingToCart(product._id);
      
      // Check stock
      if (product.quantity < 1) {
        // Alert.alert('Out of Stock', 'This product is not available');
        showToast('Product is out of stock', 'error');
        return;
      }

      await addToCart(product, 1);
      // Alert.alert('Success', 'Product added to cart');
      showToast('Product added to cart', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Alert.alert('Error', 'Failed to add product to cart');
      showToast('Failed to add product to cart', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  const renderProduct = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {item.image_url ? (
        <Image 
          source={{ uri: `${API_URL}${item.image_url}` }} 
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.productImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
      
      {item.quantity < 1 && (
        <View style={styles.outOfStockOverlay}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}

      <View style={styles.productInfo}>
        <Text style={[styles.brandname, { color: colors.text + 'AA' }]}>
          {item.brandname}
        </Text>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.quantity, { color: '#27AE60' }]}>
          Stock: {item.quantity}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          ₹ {item.price}
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.addButton,
            { 
              opacity: item.quantity < 1 ? 0.5 : 1,
              backgroundColor: addingToCart === item._id ? '#3a7bc8' : '#4A90E2'
            }
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={item.quantity < 1 || addingToCart === item._id}
        >
          {addingToCart === item._id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        placeholder={t("search_product") || "Search products..."}
        placeholderTextColor={colors.text + "80"}
        style={[
          styles.searchInput,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            color: colors.text,
          },
        ]}
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading products...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.noData}>
              <Text style={[styles.noDataText, { color: colors.text }]}>
                No products found
              </Text>
              <Text style={[styles.noDataSubtext, { color: colors.text + '80' }]}>
                Try adjusting your search
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  searchInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
  },

  card: {
    width: "48%",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },

  productImage: {
    width: '100%',
    height: 140,
  },

  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    fontSize: 48,
  },

  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  outOfStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  productInfo: {
    padding: 12,
  },

  brandname: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '600',
  },

  name: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginBottom: 6,
    minHeight: 40,
  },

  quantity: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },

  price: { 
    fontSize: 18, 
    fontWeight: "bold",
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },

  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },

  noData: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingVertical: 40,
  },

  noDataText: { 
    fontSize: 18, 
    fontWeight: "600",
    marginBottom: 8,
  },

  noDataSubtext: {
    fontSize: 14,
  },
});
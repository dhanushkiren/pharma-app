import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "@react-navigation/native";
import axios from 'axios';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { API } from '../../constants/constant';
import { useCart } from "../../context/CartContext";
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');
const API_URL = API;


export default function HomeScreen() {
  const { colors } = useTheme();
    const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef(null);
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const { showToast } = useToast();
  const [addingToCart, setAddingToCart] = useState(null);
  const router = useRouter();
  const { t } = useTranslation();

  const carouselSlides = [
    { 
      id: 1,
      emoji: '⚡',
      title: t("home_carousel.slide1_title"),
      subtitle: t("home_carousel.slide1_sub"),
      bgColor: '#4A90E2'
    },
    { 
      id: 2,
      emoji: '❤️',
      title: t("home_carousel.slide2_title"),
      subtitle: t("home_carousel.slide2_sub"),
      bgColor: '#E74C3C'
    },
    { 
      id: 3,
      emoji: '🏥',
      title: t("home_carousel.slide3_title"),
      subtitle: t("home_carousel.slide3_sub"),
      bgColor: '#27AE60'
    },
    { 
      id: 4,
      emoji: '👵',
      title: t("home_carousel.slide4_title"),
      subtitle: t("home_carousel.slide4_sub"),
      bgColor: '#8E44AD'
    },
    { 
      id: 5,
      emoji: '✨',
      title: t("home_carousel.slide5_title"),
      subtitle: t("home_carousel.slide5_sub"),
      bgColor: '#F39C12'
    }
  ];

  // Fetch user info and products on mount
  useEffect(() => {
    fetchUserInfo();
    fetchProducts();
  }, []);

  // Fetch current user info to get role
  const fetchUserInfo = async () => {
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserRole(response.data.user.role);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
    // setUserRole('admin'); 
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products?limit=6`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % carouselSlides.length;
      setCurrentSlide(nextSlide);
      flatListRef.current?.scrollToIndex({ index: nextSlide, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  // const handleAddToCart = (id) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const handleIncrement = (id) => setCart(prev => ({ ...prev, [id]: prev[id] + 1 }));
  const handleDecrement = (id) => {
    setCart(prev => {
      const newCount = prev[id] - 1;
      if (newCount === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newCount };
    });
  };

  const renderCarouselItem = ({ item }) => (
    <View style={[styles.carouselCard, { backgroundColor: item.bgColor }]}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.carouselTitle}>{item.title}</Text>
      <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderProductItem = ({ item }) => (
    <View style={[styles.productCard, { backgroundColor: colors.card }]}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={[styles.productCategory, { color: colors.text }]}>{item.category}</Text>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.productStock, { color: '#27AE60' }]}>{item.stock}</Text>
        <View style={styles.productBottom}>
          <Text style={[styles.productPrice, { color: colors.text }]}>₹{item.price}</Text>
          {!cart[item._id] ? (
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
                        <Text style={styles.addButtonText}>Add</Text>
                      )}
                    </TouchableOpacity>
          ) : (
            <View style={styles.quantityControl}>
              <TouchableOpacity style={styles.quantityButton} onPress={() => handleDecrement(item._id)}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{cart[item._id]}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => handleIncrement(item._id)}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={carouselSlides}
          keyExtractor={item => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={renderCarouselItem}
          onMomentumScrollEnd={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentSlide(index);
          }}
        />
        <View style={styles.dotsContainer}>
          {carouselSlides.map((_, i) => (
            <View key={i} style={[styles.dot, currentSlide === i && styles.activeDot]} />
          ))}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.prescriptionButton]} onPress={() => router.push("/upload")}>
          <Text style={styles.actionButtonIcon}>📋</Text>
          <Text style={styles.actionButtonText}>{t("prescription_upload") || "Prescription Upload"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.productButton]} onPress={() => router.push("/(tabs)/product")}>
          <Text style={styles.actionButtonIcon}>🛒</Text>
          <Text style={styles.actionButtonText}>{t("browse_products") || "Browse Products"}</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Buttons - Only visible for admin users */}
      {userRole === 'admin' && (
        <View style={styles.adminSection}>
          <Text style={[styles.adminSectionTitle, { color: colors.text }]}>Admin Controls</Text>
          <View style={styles.adminButtons}>
            <TouchableOpacity 
              style={[styles.adminButton, { backgroundColor: '#4A90E2' }]} 
              onPress={() => router.push("/add-product")}
            >
              <Text style={styles.adminButtonIcon}>➕</Text>
              <Text style={styles.adminButtonText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.adminButton, { backgroundColor: '#27AE60' }]} 
              onPress={() => router.push("/add-partner")}
            >
              <Text style={styles.adminButtonIcon}>🤝</Text>
              <Text style={styles.adminButtonText}>Add Partner</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Medicines</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item._id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carouselContainer: { marginVertical: 16 },
  carouselCard: { width: width - 20, height: 180, justifyContent: 'center', alignItems: 'center', borderRadius: 12, padding: 20, marginHorizontal: 10 },
  emoji: { fontSize: 48, marginBottom: 12 },
  carouselTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  carouselSubtitle: { fontSize: 14, color: '#fff', textAlign: 'center', opacity: 0.9 },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DDD', marginHorizontal: 4 },
  activeDot: { width: 24, backgroundColor: '#1e1c1cff' },
  actionButtons: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  actionButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  prescriptionButton: { backgroundColor: '#E8F4FD' },
  productButton: { backgroundColor: '#E8F8F0' },
  actionButtonIcon: { fontSize: 32, marginBottom: 8 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#333' },
  adminSection: { paddingHorizontal: 16, marginBottom: 20 },
  adminSectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  adminButtons: { flexDirection: 'row', gap: 12 },
  adminButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  adminButtonIcon: { fontSize: 28, marginBottom: 6 },
  adminButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  productsSection: { paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  viewAllText: { fontSize: 14, color: '#4A90E2', fontWeight: '600' },
  productRow: { justifyContent: 'space-between', marginBottom: 12 },
  productCard: { width: (width - 44) / 2, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  productImage: { width: '100%', height: 140, resizeMode: 'cover' },
  productInfo: { padding: 12 },
  productCategory: { fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  productName: { fontSize: 14, fontWeight: '600', marginBottom: 4, minHeight: 40 },
  productStock: { fontSize: 11, marginBottom: 8 },
  productBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 18, fontWeight: 'bold' },
  addButton: { backgroundColor: '#4A90E2', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4A90E2', borderRadius: 6, overflow: 'hidden' },
  quantityButton: { paddingHorizontal: 10, paddingVertical: 6 },
  quantityButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  quantityText: { color: '#fff', fontSize: 14, fontWeight: 'bold', paddingHorizontal: 8 },
});
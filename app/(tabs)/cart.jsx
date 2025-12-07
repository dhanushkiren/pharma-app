// app/(tabs)/cart.js
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlertModal from "../../components/CustomAlertModal";
import { API, WHATSAPP_NUMBER } from '../../constants/constant';
import { useToast } from "../../context/ToastContext";

const API_URL = API;

export default function CartScreen({  }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { 
    cartItems, 
    loading, 
    removeFromCart, 
    updateQuantity,
    getTotalPrice,
    clearCart 
  } = useCart();
  const { showToast } = useToast();
  const { isLoggedIn, user } = useAuth(); // Get user data from AuthContext

  const [deleting, setDeleting] = useState(null);
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

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  const handleIncrement = (id) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecrement = (id) => {
    const item = cartItems.find(i => i.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const handleRemove = (id) => {

  showAlertModal(
  "Confirm Delete",
  "Are you sure you want to delete this cart item?",
  "warning",
  [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => {
            try {
              setDeleting(id);
              await removeFromCart(id);
            } catch (error) {
              // Alert.alert('Error', 'Failed to remove item');
              showToast('Failed to remove item', 'error');
            } finally {
              setDeleting(null);
            }
          } }
  ]
);
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      // Redirect to login with alert
    showAlertModal(
      "Login Required",
      "Please log in to proceed with checkout",
      "info",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("auth/login")}
      ]
    );
    } else {
      console.log('User Info:', user);
      // Check if user has required details
      if (!user?.username || !user?.mobile || !user?.address) {

          showAlertModal(
            "Incomplete Profile",
            "Please complete your profile with name, mobile number, and address before ordering.",
            "info",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Update Profile", onPress: () => router.push("profile")}
            ]
          );
        return;
      }

      // Generate WhatsApp message
      try {
        const message = generateWhatsAppMessage();
        const phoneNumber = WHATSAPP_NUMBER;
        
        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Create WhatsApp URL
        const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
        
        // Check if WhatsApp can be opened
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          // Fallback to web WhatsApp
          const webWhatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
          await Linking.openURL(webWhatsappUrl);
        }
      } catch (error) {
        console.error('Error opening WhatsApp:', error);
        // Alert.alert('Error', 'Could not open WhatsApp. Please make sure it is installed.');
        showToast('Could not open WhatsApp. Please make sure it is installed.', 'error');
      }
    }
  };

  const generateWhatsAppMessage = () => {
    let message = '🛒 *New Order Request*\n\n';
    
    // Customer Details
    message += '👤 *Customer Details:*\n';
    message += `Name: ${user?.username || 'N/A'}\n`;
    message += `Mobile: ${user?.mobile || user?.phone || 'N/A'}\n`;
    message += `Address: ${user?.address || 'N/A'}\n`;
    if (user?.email) {
      message += `Email: ${user.email}\n`;
    }
    message += '\n━━━━━━━━━━━━━━━━\n\n';
    
    // Order Details
    message += '📦 *Order Details:*\n';
    
    // Add each product
    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: ₹${item.price} × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    message += '━━━━━━━━━━━━━━━━\n';
    message += `💰 *Subtotal:* ₹${subtotal.toFixed(2)}\n`;
    message += `🚚 *Delivery Fee:* ₹${deliveryFee}\n`;
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `✅ *Total Amount:* ₹${total.toFixed(2)}\n\n`;
    message += 'Please confirm my order. Thank you!';
    
    return message;
  };

  const themedStyles = styles(colors);

  if (loading) {
    return (
      <View style={[themedStyles.container, themedStyles.emptyContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[themedStyles.emptyTitle, { marginTop: 16 }]}>
          Loading cart...
        </Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={[themedStyles.container, themedStyles.emptyContainer]}>
        <Ionicons name="cart-outline" size={80} color={colors.text + "80"} />
        <Text style={[themedStyles.emptyTitle, { color: colors.text, marginTop: 16 }]}>
          Your Cart is Empty
        </Text>
        <Text style={[themedStyles.emptySubtitle, { color: colors.text + "80" }]}>
          Add items to continue
        </Text>
        <TouchableOpacity 
          style={[themedStyles.shopNowButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("product")}
        >
          <Text style={themedStyles.shopNowButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      {/* Header with Clear Button */}
      <View style={[themedStyles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[themedStyles.headerTitle, { color: colors.text }]}>
            My Cart
          </Text>
          <Text style={[themedStyles.headerSubtitle, { color: colors.text + "80" }]}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {cartItems.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                "Clear Cart",
                "Remove all items?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => clearCart(),
                  },
                ]
              );
            }}
          >
            <Text style={[themedStyles.clearButtonText, { color: colors.primary }]}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={themedStyles.scrollContainer}
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Items */}
        <View style={themedStyles.cartItemsContainer}>
          {cartItems.map(item => (
            <View 
              key={item.id} 
              style={[themedStyles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Image 
                source={{ 
                  uri: item.image_url ? `${API_URL}${item.image_url}` : 'https://via.placeholder.com/80' 
                }} 
                style={themedStyles.itemImage} 
              />

              <View style={themedStyles.itemDetails}>
                <Text style={[themedStyles.itemCategory, { color: colors.text + "80" }]}>
                  {item.category || item.brandname || 'Product'}
                </Text>
                <Text style={[themedStyles.itemName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[themedStyles.itemPrice, { color: colors.primary }]}>
                  ₹{item.price}
                </Text>
              </View>

              <View style={themedStyles.itemActions}>
                <View style={[themedStyles.quantityControl, { backgroundColor: colors.border }]}>
                  <TouchableOpacity
                    style={[themedStyles.quantityButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleDecrement(item.id)}
                    disabled={deleting === item.id}
                  >
                    <Text style={themedStyles.quantityButtonText}>−</Text>
                  </TouchableOpacity>

                  <Text style={[themedStyles.quantityText, { color: colors.text }]}>
                    {item.quantity}
                  </Text>

                  <TouchableOpacity
                    style={[themedStyles.quantityButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleIncrement(item.id)}
                    disabled={deleting === item.id}
                  >
                    <Text style={themedStyles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={themedStyles.removeButton}
                  onPress={() => handleRemove(item.id)}
                  disabled={deleting === item.id}
                >
                  {deleting === item.id ? (
                    <ActivityIndicator size="small" color="red" />
                  ) : (
                    <Ionicons name="trash-outline" size={20} color="red" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={[themedStyles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[themedStyles.summaryTitle, { color: colors.text }]}>
            Price Details
          </Text>

          <View style={themedStyles.summaryRow}>
            <Text style={[themedStyles.summaryLabel, { color: colors.text + "80" }]}>
              Subtotal
            </Text>
            <Text style={[themedStyles.summaryValue, { color: colors.text }]}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>

          <View style={themedStyles.summaryRow}>
            <Text style={[themedStyles.summaryLabel, { color: colors.text + "80" }]}>
              Delivery Fee
            </Text>
            <Text style={[themedStyles.summaryValue, { color: colors.text }]}>
              ₹{deliveryFee}
            </Text>
          </View>

          <View style={[themedStyles.divider, { backgroundColor: colors.border }]} />

          <View style={themedStyles.summaryRow}>
            <Text style={[themedStyles.totalLabel, { color: colors.text }]}>
              Total
            </Text>
            <Text style={[themedStyles.totalValue, { color: colors.primary }]}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Checkout Bar */}
      <View 
        style={[
          themedStyles.checkoutContainer, 
          { backgroundColor: colors.card, borderTopColor: colors.border }
        ]}
      >
        <View style={themedStyles.checkoutInfo}>
          <Text style={[themedStyles.checkoutTotal, { color: colors.text }]}>
            ₹{total.toFixed(2)}
          </Text>
          <Text style={[themedStyles.checkoutSubtext, { color: colors.text + "80" }]}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            themedStyles.checkoutButton,
            { backgroundColor: colors.primary }
          ]}
          onPress={handleCheckout}
        >
          <Text style={themedStyles.checkoutButtonText}>
            {isLoggedIn ? "Order via WhatsApp" : "Login & Order"}
          </Text>
        </TouchableOpacity>
      </View>

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

const styles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  emptyContainer: { 
    justifyContent: "center", 
    alignItems: "center" 
  },

  emptyTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: colors.text,
    marginTop: 16,
  },

  emptySubtitle: { 
    color: colors.text + "80",
    marginTop: 8,
  },

  shopNowButton: { 
    padding: 14, 
    borderRadius: 8,
    marginTop: 24,
  },

  shopNowButtonText: { 
    color: "#fff", 
    fontWeight: "bold",
    textAlign: "center",
  },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: { 
    fontSize: 24, 
    fontWeight: "bold",
  },

  headerSubtitle: { 
    fontSize: 14,
    marginTop: 4,
  },

  clearButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },

  scrollContainer: { 
    flex: 1 
  },

  scrollContent: { 
    padding: 16 
  },

  cartItemsContainer: {},

  cartItem: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },

  itemImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },

  itemDetails: { 
    flex: 1, 
    marginLeft: 12, 
    justifyContent: "center" 
  },

  itemCategory: { 
    fontSize: 10,
    fontWeight: '500',
  },

  itemName: { 
    fontSize: 16, 
    fontWeight: "600",
    marginTop: 4,
  },

  itemPrice: { 
    fontSize: 18, 
    fontWeight: "bold",
    marginTop: 6,
  },

  itemActions: { 
    justifyContent: "space-between", 
    alignItems: "flex-end",
    gap: 8,
  },

  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
  },

  quantityButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6,
  },

  quantityButtonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },

  quantityText: { 
    fontSize: 16, 
    paddingHorizontal: 10 
  },

  removeButton: {
    minWidth: 40,
    alignItems: 'center',
  },

  summaryCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginTop: 8,
  },

  summaryTitle: { 
    fontSize: 18, 
    fontWeight: "bold",
    marginBottom: 12,
  },

  summaryRow: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    marginBottom: 8,
  },

  summaryLabel: { 
    fontSize: 13,
  },

  summaryValue: { 
    fontWeight: '500',
  },

  divider: { 
    height: 1,
    marginVertical: 12 
  },

  totalLabel: { 
    fontWeight: "bold",
    fontSize: 14,
  },

  totalValue: { 
    fontWeight: "bold",
    fontSize: 16,
  },

  checkoutContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 12,
  },

  checkoutInfo: { 
    flex: 1 
  },

  checkoutTotal: { 
    fontSize: 20, 
    fontWeight: "bold",
  },

  checkoutSubtext: { 
    fontSize: 12,
    marginTop: 2,
  },

  checkoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },

  checkoutButtonText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 14,
  },
});
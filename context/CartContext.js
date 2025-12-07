import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { API } from '../constants/constant';

const CartContext = createContext();
const API_URL = API;

export const CartProvider = ({ children, authToken, isLoggedIn }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const previousAuthState = useRef({ isLoggedIn: false, authToken: null });

  // Initialize cart on mount or when auth status changes
  useEffect(() => {
    const authChanged = 
      previousAuthState.current.isLoggedIn !== isLoggedIn ||
      previousAuthState.current.authToken !== authToken;

    if (authChanged) {
      previousAuthState.current = { isLoggedIn, authToken };
      loadCart();
    }
  }, [isLoggedIn, authToken]);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isLoggedIn && authToken) {
        // User just logged in - migrate in background
        // Don't wait for migration to complete
        migrateLocalCartToBackendAsync(authToken);
        
        // Load backend cart immediately
        await fetchCartFromBackend(authToken);
      } else {
        // Load from local storage
        await loadCartFromLocalStorage();
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Async migration that doesn't block the UI
  const migrateLocalCartToBackendAsync = async (token) => {
    try {
      // Get local cart
      const localCart = await loadCartFromLocalStorageSilent();

      if (localCart && localCart.length > 0) {
        // Run migration in background without blocking
        setTimeout(async () => {
          try {
            // Get backend cart
            const backendCart = await fetchCartFromBackendSilent(token);

            if (backendCart && backendCart.length > 0) {
              // Merge carts
              await mergeCartsToBackend(token, localCart, backendCart);
            } else {
              // Add all local items to backend
              for (const item of localCart) {
                try {
                  await axios.post(
                    `${API_URL}/cart/add`,
                    {
                      product_id: item.id || item._id,
                      quantity: item.quantity,
                    },
                    {
                      headers: { Authorization: `Bearer ${token}` },
                      timeout: 5000, // 5 second timeout
                    }
                  );
                } catch (err) {
                  console.error(`Error migrating item ${item.id}:`, err);
                }
              }
            }

            // Clear local storage after successful migration
            await AsyncStorage.removeItem('cart');
            
            // Refresh cart from backend
            await fetchCartFromBackend(token);
          } catch (err) {
            console.error('Background migration error:', err);
          }
        }, 100); // Small delay to not block login flow
      }
    } catch (err) {
      console.error('Error in async migration:', err);
    }
  };

  const mergeCartsToBackend = async (token, localCart, backendCart) => {
    try {
      const backendIds = backendCart.map(item => item.product_id || item.id);

      // Process items in parallel for faster migration
      const promises = localCart.map(async (localItem) => {
        const itemId = localItem.id || localItem._id;

        try {
          if (backendIds.includes(itemId)) {
            // Update quantity
            const backendItem = backendCart.find(
              item => (item.product_id || item.id) === itemId
            );
            const newQuantity = (backendItem?.quantity || 0) + localItem.quantity;

            await axios.put(
              `${API_URL}/cart/update`,
              { product_id: itemId, quantity: newQuantity },
              {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000,
              }
            );
          } else {
            // Add new item
            await axios.post(
              `${API_URL}/cart/add`,
              { product_id: itemId, quantity: localItem.quantity },
              {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000,
              }
            );
          }
        } catch (err) {
          console.error(`Error merging item ${itemId}:`, err);
        }
      });

      // Wait for all operations to complete
      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Error merging carts:', err);
    }
  };

  const fetchCartFromBackendSilent = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      return response.data.items || [];
    } catch (err) {
      console.error('Silent backend fetch error:', err);
      return [];
    }
  };

  const loadCartFromLocalStorageSilent = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Silent local storage error:', err);
      return [];
    }
  };

  const fetchCartFromBackend = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      });

      const items = response.data.items.map(item => ({
        id: item.product_id,
        ...item.product,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      setCartItems(items);
    } catch (err) {
      console.error('Error fetching cart from backend:', err);
      // Don't throw error, just log it
      setCartItems([]);
    }
  };

  const loadCartFromLocalStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error loading cart from local storage:', err);
      setCartItems([]);
    }
  };

  const saveCartToLocalStorage = async (items) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
    } catch (err) {
      console.error('Error saving cart to local storage:', err);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      setError(null);

      if (isLoggedIn && authToken) {
        // Add to backend
        await axios.post(
          `${API_URL}/cart/add`,
          {
            product_id: product._id || product.id,
            quantity,
          },
          {
            headers: { Authorization: `Bearer ${authToken}` },
            timeout: 8000,
          }
        );

        // Refresh cart from backend
        await fetchCartFromBackend(authToken);
      } else {
        // Add to local storage
        const existingItem = cartItems.find(
          item => item.id === (product._id || product.id)
        );

        let updatedItems;
        if (existingItem) {
          updatedItems = cartItems.map(item =>
            item.id === (product._id || product.id)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [
            ...cartItems,
            {
              ...product,
              id: product._id || product.id,
              quantity,
            },
          ];
        }

        setCartItems(updatedItems);
        await saveCartToLocalStorage(updatedItems);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setError(null);

      if (isLoggedIn && authToken) {
        // Remove from backend
        await axios.delete(`${API_URL}/cart/remove/${productId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 8000,
        });

        // Refresh cart
        await fetchCartFromBackend(authToken);
      } else {
        // Remove from local storage
        const updatedItems = cartItems.filter(item => item.id !== productId);
        setCartItems(updatedItems);
        await saveCartToLocalStorage(updatedItems);
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setError(null);

      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (isLoggedIn && authToken) {
        // Update in backend
        await axios.put(
          `${API_URL}/cart/update`,
          {
            product_id: productId,
            quantity,
          },
          {
            headers: { Authorization: `Bearer ${authToken}` },
            timeout: 8000,
          }
        );

        // Refresh cart
        await fetchCartFromBackend(authToken);
      } else {
        // Update in local storage
        const updatedItems = cartItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        );
        setCartItems(updatedItems);
        await saveCartToLocalStorage(updatedItems);
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      setError(err.message);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);

      if (isLoggedIn && authToken) {
        // Clear in backend
        await axios.delete(`${API_URL}/cart/clear`, {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 8000,
        });
      }

      setCartItems([]);
      await saveCartToLocalStorage([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      throw err;
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
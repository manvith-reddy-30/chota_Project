import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const url = BACKEND_URL;

  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  // Update cart in state + localStorage
  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  // Clear the cart completely
  const clearCart = () => {
    updateCart({});
  };

  // Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodList(response.data.data);
    } catch (err) {
      console.error('Error fetching food list:', err);
    }
  };

  // Check login status via httpOnly cookie
  const checkLoginStatus = async () => {
    try {
      const res = await axios.get(`${url}/api/user/check-auth`, { withCredentials: true });
      setLoggedIn(res.data.loggedIn);
      
      return res.data.loggedIn;
    } catch (err) {
      console.error('Error checking login status:', err);
      setLoggedIn(false);
      return false;
    }
  };

  // Load cart from server if logged in
  const loadCartData = async () => {
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) return;

    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        { withCredentials: true }
      );
      const serverCart = response.data.cartData || {};
      updateCart(serverCart);
    } catch (err) {
      console.error('Error loading server cart:', err);
    }
  };

  // Add item to cart locally and server
  const addToCart = async (itemId) => {
    const newQty = (cartItems[itemId] || 0) + 1;
    const newCart = { ...cartItems, [itemId]: newQty };
    updateCart(newCart);

    if (loggedIn) {
      try {
        await axios.post(`${url}/api/cart/add`, { itemId }, { withCredentials: true });
      } catch (err) {
        console.error('Error adding to server cart:', err);
      }
    }
  };

  // Remove item from cart locally and server
  const removeFromCart = async (itemId) => {
    const newQty = (cartItems[itemId] || 0) - 1;
    const newCart = { ...cartItems };
    if (newQty > 0) newCart[itemId] = newQty;
    else delete newCart[itemId];
    updateCart(newCart);

    if (loggedIn) {
      try {
        await axios.post(`${url}/api/cart/remove`, { itemId }, { withCredentials: true });
      } catch (err) {
        console.error('Error removing from server cart:', err);
      }
    }
  };

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const food = food_list.find((f) => f._id === itemId);
        if (food) total += food.price * cartItems[itemId];
      }
    }
    return total;
  };

  // On app load: hydrate local cart, fetch foods, check login, load server cart
  useEffect(() => {
    const saved = localStorage.getItem('cartItems');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch {
        localStorage.removeItem('cartItems');
      }
    }

    const init = async () => {
      await fetchFoodList();
      await loadCartData();
    };
    init();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    updateCart,
    clearCart,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    loggedIn,
    checkLoginStatus,
    loadCartData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

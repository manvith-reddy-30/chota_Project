import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const url = BACKEND_URL;

  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState('');

  // Helper to update cart in state + localStorage
  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  // Helper to clear the cart completely
  const clearCart = () => {
    updateCart({});
  };

  // Fetch list of foods
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodList(response.data.data);
    } catch (err) {
      console.error('Error fetching food list:', err);
    }
  };

  // Load cart from server (for logged‑in users)
  const loadCartData = async (authToken) => {
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { token: authToken } }
      );
      const serverCart = response.data.cartData || {};
      updateCart(serverCart);
    } catch (err) {
      console.error('Error loading server cart:', err);
    }
  };

  // Add an item locally + server if logged in
  const addToCart = async (itemId) => {
    const newQty = (cartItems[itemId] || 0) + 1;
    const newCart = { ...cartItems, [itemId]: newQty };
    updateCart(newCart);

    if (token) {
      try {
        await axios.post(`${url}/api/cart/add`, { itemId }, { headers: { token } });
      } catch (err) {
        console.error('Error adding to server cart:', err);
      }
    }
  };

  // Remove an item locally + server if logged in
  const removeFromCart = async (itemId) => {
    const newQty = (cartItems[itemId] || 0) - 1;
    const newCart = { ...cartItems };
    if (newQty > 0) newCart[itemId] = newQty;
    else delete newCart[itemId];
    updateCart(newCart);

    if (token) {
      try {
        await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token } });
      } catch (err) {
        console.error('Error removing from server cart:', err);
      }
    }
  };

  // Compute total cart amount
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

  // On app load: hydrate from localStorage, fetch foods, then if logged in load server cart
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const saved = localStorage.getItem('cartItems');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch {
        localStorage.removeItem('cartItems');
      }
    }

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }

    const init = async () => {
      await fetchFoodList();
      if (savedToken) {
        await loadCartData(savedToken);
      }
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
    token,
    setToken,
    loadCartData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

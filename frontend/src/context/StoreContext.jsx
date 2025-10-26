// StoreContext.jsx (COMPLETE CODE)
import axios from 'axios';
import { createContext, useState, useEffect, useRef } from 'react';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const url = BACKEND_URL;

  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  
  // 💡 NEW STATE: Trigger for refreshing orders on pages like MyOrders
  const [orderUpdateTrigger, setOrderUpdateTrigger] = useState(0); 

  const ws = useRef(null);
  const [wsStatus, setWsStatus] = useState('closed');

  // Fetch food list (defined here for use in ws.onmessage)
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodList(response.data.data);
    } catch (err) {
      console.error('Error fetching food list:', err);
    }
  };

  // Check login status (defined here for use in loadCartData)
  const checkLoginStatus = async () => {
    try {
      const res = await axios.get(`${url}/api/user/check-auth`, { withCredentials: true });
      const isLoggedIn = res.data.loggedIn;
      setLoggedIn(isLoggedIn);
      
      // 💡 NEW: Connect WebSocket ONLY if logged in
      if (isLoggedIn && ws.current === null) {
          connectWebSocket();
      }

      return isLoggedIn;
    } catch (err) {
      console.error('Error checking login status:', err);
      setLoggedIn(false);
      return false;
    }
  };

  // Load cart from server (defined here for use in init)
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
      setCartItems(serverCart);
    } catch (err) {
      console.error('Error loading server cart:', err);
    }
  };


  // 💡 Function to connect to the WebSocket server
  const connectWebSocket = () => {
    const wsUrl = url.startsWith('https') 
      ? `wss://${new URL(url).host}` 
      : `ws://${new URL(url).host}`;

    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => {
      console.log('WebSocket Connected!');
      setWsStatus('open');
    };

    ws.current.onmessage = (event) => {
      console.log('WS Message received:', event.data);
      try {
        const message = JSON.parse(event.data);
        
        // 💡 Handle FOOD_UPDATE: Refresh food list for all users
        if (message.type === 'FOOD_UPDATE') {
          console.log(`Real-Time Food Update received: ${message.data.message}`);
          fetchFoodList(); 
        }

        // 💡 Handle ORDER_UPDATE: Trigger MyOrders page refresh
        if (message.type === 'ORDER_UPDATE') {
          console.log(`Real-Time Order Update: ${message.data.newStatus}`);
          setOrderUpdateTrigger(prev => prev + 1); // Increment trigger
        }
        
      } catch (e) {
        console.error('Failed to parse WS message:', e);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected.');
      setWsStatus('closed');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setWsStatus('error');
    };
  };

  // Update cart in state + localStorage
  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  // Clear the cart completely
  const clearCart = () => {
    updateCart({});
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
      
      // 💡 Connect the WebSocket after other initialization
      //connectWebSocket();
    };
    init();

    // 💡 Cleanup function to close WebSocket when the component unmounts
    return () => {
        if (ws.current) {
            ws.current.close();
        }
    };
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
    wsStatus,
    checkLoginStatus,
    loadCartData,
    orderUpdateTrigger, // 💡 EXPOSE THE TRIGGER
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
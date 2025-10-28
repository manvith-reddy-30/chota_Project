// client/src/context/StoreContext.jsx (COMPLETE CODE)

import axios from 'axios';
import { createContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify'; // <-- NEW: Import Toastify

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const url = BACKEND_URL;

  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // <-- NEW STATE for RBAC
  
  // Trigger for refreshing orders on pages like MyOrders
  const [orderUpdateTrigger, setOrderUpdateTrigger] = useState(0); 

  const ws = useRef(null);
  const [wsStatus, setWsStatus] = useState('closed');

  // Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodList(response.data.data);
    } catch (err) {
      console.error('Error fetching food list:', err);
      toast.error("Failed to load menu items."); // ADDED TOAST
    }
  };

  // Check login status (MODIFIED to fetch user role)
  const checkLoginStatus = async () => {
    try {
      const res = await axios.get(`${url}/api/user/check-auth`, { withCredentials: true });
      const isLoggedIn = res.data.loggedIn;
      setLoggedIn(isLoggedIn);
      
      if (isLoggedIn) {
          // Fetch Role from the new backend endpoint
          try {
              const roleRes = await axios.get(`${url}/api/user/role`, { withCredentials: true });
              setUserRole(roleRes.data.role); 
          } catch (error) {
              console.error('Error fetching user role:', error);
              setUserRole(null); 
              toast.error("Could not fetch user permissions."); // ADDED TOAST
          }
          
          if (ws.current === null) {
              connectWebSocket();
          }
      } else {
          setUserRole(null); // Clear role if not logged in
      }

      return isLoggedIn;
    } catch (err) {
      console.error('Error checking login status:', err);
      setLoggedIn(false);
      setUserRole(null); // Clear role on failure
      return false;
    }
  };

  // Load cart from server
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
      toast.error("Failed to sync cart with server."); // ADDED TOAST
    }
  };


  // Function to connect to the WebSocket server (remains largely the same)
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
        
        // Handle FOOD_UPDATE: Refresh food list for all users
        if (message.type === 'FOOD_UPDATE') {
          console.log(`Real-Time Food Update received: ${message.data.message}`);
          fetchFoodList(); 
        }

        // Handle ORDER_UPDATE: Trigger MyOrders page refresh
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
  
  // Add item to cart locally and server (ADDED TOASTS)
  const addToCart = async (itemId) => {
    const newQty = (cartItems[itemId] || 0) + 1;
    const newCart = { ...cartItems, [itemId]: newQty };
    updateCart(newCart);

    if (loggedIn) {
      try {
        await axios.post(`${url}/api/cart/add`, { itemId }, { withCredentials: true });
        // Optional: toast.info("Cart updated on server.");
      } catch (err) {
        console.error('Error adding to server cart:', err);
        toast.error("Failed to update cart on server."); // ADDED TOAST
      }
    } else {
        toast.info("Item added to cart locally. Log in to save it."); // ADDED TOAST
    }
  };

  // Remove item from cart locally and server (ADDED TOASTS)
  const removeFromCart = async (itemId) => {
    const newQty = (cartItems[itemId] || 0) - 1;
    const newCart = { ...cartItems };
    if (newQty > 0) newCart[itemId] = newQty;
    else delete newCart[itemId];
    updateCart(newCart);

    if (loggedIn) {
      try {
        await axios.post(`${url}/api/cart/remove`, { itemId }, { withCredentials: true });
        // Optional: toast.info("Cart updated on server.");
      } catch (err) {
        console.error('Error removing from server cart:', err);
        toast.error("Failed to remove item from server cart."); // ADDED TOAST
      }
    }
  };

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const food = food_list.find((f) => f._id === itemId);
        // Ensure food exists before accessing price
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
        // Fallback if local storage item is corrupted
        console.error("Corrupted local cart data found.");
        localStorage.removeItem('cartItems');
      }
    }

    const init = async () => {
      await fetchFoodList();
      // loadCartData internally calls checkLoginStatus, which fetches the user role
      await loadCartData(); 
    };
    init();

    // Cleanup function to close WebSocket when the component unmounts
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
    userRole, // <-- EXPOSED: The key for RBAC
    wsStatus,
    checkLoginStatus,
    loadCartData,
    orderUpdateTrigger,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
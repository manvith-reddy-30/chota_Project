// client/src/pages/MyOrders/MyOrders.jsx (FINAL MODIFIED)

import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
// Correct path for StoreContext (one level up)
import { StoreContext } from '../../context/StoreContext'; 
// Correct path for assets (two levels up)
import { assets } from '../../assets/assets'; 
import { toast } from 'react-toastify'; // NEW: Import Toastify

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Consuming url and the real-time trigger
  const { url, orderUpdateTrigger } = useContext(StoreContext); 
  
  // NOTE: Assuming currency symbol is part of the context or hardcoded (using ₹ for now)
  const currencySymbol = '₹';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${url}/api/order/userorders`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
          // Sort by latest order date/ID if backend doesn't handle it
          const sortedData = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setData(sortedData || []);
      } else {
          toast.error(response.data.message || "Failed to retrieve orders."); // ADDED TOAST
          setData([]);
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("A network error occurred while fetching orders."); // ADDED TOAST
    } finally {
      setLoading(false);
    }
  };

  // CRUCIAL: Effect listens to the URL (on mount) and the trigger (for WS updates)
  useEffect(() => {
    fetchOrders();
  }, [url, orderUpdateTrigger]); 

  if (loading) {
    return (
      <div className='my-orders'>
        <h2>My Orders</h2>
        <p>Loading your order history...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className="container">
        {data.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          data.map((order, index) => (
            <div key={index} className='my-orders-order'>
              <img src={assets.parcel_icon} alt="Order Parcel Icon" />
              <p>
                {order.items
                  .map(item => `${item.name} x ${item.quantity}`)
                  .join(', ')}
              </p>
              {/* Using ₹ as currency symbol for consistency */}
              <p>{currencySymbol}{order.amount.toFixed(2)}</p> 
              <p>Items: {order.items.length}</p>
              <p>
                <span>&#x25cf;</span> <b>{order.status}</b>
              </p>
              <button disabled>Track Order</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
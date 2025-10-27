// MyOrders.jsx (COMPLETE CODE)
import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 💡 Consume the new trigger
  const { url, currency, orderUpdateTrigger } = useContext(StoreContext); 

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${url}/api/order/userorders`, {}, {
        withCredentials: true
      });
      setData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // 💡 CRUCIAL CHANGE: Listen to the trigger for automatic refresh
  useEffect(() => {
    fetchOrders();
    // Re-fetch whenever url changes (on mount) OR when the trigger increments (on WS message)
  }, [url, orderUpdateTrigger]); 

  if (loading) {
    return (
      <div className='my-orders'>
        <h2>My Orders</h2>
        <p>Loading your orders...</p>
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
              <p>{currency}{order.amount.toFixed(2)}</p>
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
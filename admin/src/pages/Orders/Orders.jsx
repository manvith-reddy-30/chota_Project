import React, { useState, useEffect } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from "axios";
import { assets } from "../../assets/assets";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        let fetchedOrders = response.data.data;
        
        // 🚨 CHANGE: Sorting Logic Added Here
        // Sorts from latest date (descending) to oldest date.
        // new Date(b.date) - new Date(a.date) results in a positive number if b > a,
        // which sorts b before a (descending order).
        fetchedOrders.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        setOrders(fetchedOrders);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: event.target.value
      });
      if (response.data.success) {
        // Re-fetch orders to update the list and re-sort
        await fetchAllOrders(); 
      } else {
        toast.error("Error updating status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating status");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='order-list'>
          {orders.map((order) => (
            <div key={order._id} className='order-item'>
              <img src={assets.parcel_icon} alt="Parcel" />
              <div>
                <p className='order-item-food'>
                  {order.items.map((item, index) => (
                    <span key={item._id || index}>
                      {item.name} x{item.quantity}
                      {index < order.items.length - 1 && ", "}
                    </span>
                  ))}
                </p>
                <p className='order-item-name'>
                  {order.address.firstName} {order.address.lastName}
                </p>
                <div className='order-item-address'>
                  <p>{order.address.street},</p>
                  <p>{order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</p>
                </div>
                <p className='order-item-phone'>{order.address.phone}</p>
                <div>
                  <p>Items: {order.items.length}</p>
                  <p>₹{order.amount}</p>
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                  >
                    <option value="Food Processing">Food Processing</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
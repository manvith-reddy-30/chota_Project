// client/src/pages/PlaceOrder/PlaceOrder.jsx (FINAL MODIFIED)

import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
// Correct path for StoreContext (one level up)
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // NEW: Import Toastify

const PlaceOrder = () => {
  const { getTotalCartAmount, food_list, cartItems, url } = useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    state: "",
    street: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if cart is empty on mount or if a user tries to access this page directly
    const totalAmount = getTotalCartAmount();
    if (totalAmount === 0) {
      toast.error("Your cart is empty. Redirecting to cart.");
      navigate('/cart');
    }
  }, [getTotalCartAmount, navigate]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
      // Basic check for required fields (assuming HTML 'required' attributes handle empty strings)
      // This is for more complex validation or a final check.
      const requiredFields = ['firstName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
      
      for (const field of requiredFields) {
          if (!data[field]) {
              toast.error(`Please fill out the required field: ${field}.`);
              return false;
          }
      }

      // Basic pattern check reminder (HTML pattern attribute is primary)
      if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
           toast.error("Please enter a valid 10-digit phone number.");
           return false;
      }
      
      return true;
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    
    // Validate form using Toastify before proceeding
    if (!validateForm()) {
        return; 
    }

    const orderItems = [];
    
    // Construct order items list
    food_list.forEach(item => {
      if (cartItems[item._id] > 0) {
        orderItems.push({
          name: item.name,
          price: item.price,
          _id: item._id,
          quantity: cartItems[item._id]
        });
      }
    });

    const orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2 // Total amount includes delivery fee
    };

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        withCredentials: true
      });

      if (response.data.success) {
        // Success: Redirect to payment session URL
        const { session_url } = response.data;
        window.location.replace(session_url);
      } else {
        // REPLACED ALERT
        toast.error(response.data.message || "Error placing order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      // REPLACED ALERT
      toast.error("Something went wrong. Please check your connection and try again.");
    }
  };

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          {/* Note: All inputs use the 'required' attribute for built-in browser validation */}
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          {/* Added pattern for pincode validation */}
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" pattern="[0-9]{5,6}" placeholder='Pin code' /> 
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        {/* Added pattern for phone validation */}
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="tel" pattern="[0-9]{10}" placeholder='Phone' /> 
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
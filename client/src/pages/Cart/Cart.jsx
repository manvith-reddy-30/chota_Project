// client/src/pages/Cart/Cart.jsx (FINAL MODIFIED)

import React, { useContext, useEffect } from 'react';
import './Cart.css';
// Context path remains correct relative to its location in pages/Cart/
import { StoreContext } from '../../context/StoreContext'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify'; // <-- NEW: Import Toastify

const Cart = () => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    checkLoginStatus // Used to ensure login status before checkout
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = async () => {
    const total = getTotalCartAmount();
    if (total === 0) {
      // REPLACED ALERT
      toast.error('Your cart is empty. Please add items to proceed!');
      navigate('/');
      return;
    }

    // Ensure login status is up to date before checkout
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
      // REPLACED ALERT
      toast.error('Please login to continue!');
      // Navigate to login, storing current path to redirect back after success
      navigate('/login', { state: { from: location } }); 
      return;
    }

    navigate('/order');
  };
  
  // New function to handle promo code submission using Toastify
  const handlePromoCode = () => {
      const inputElement = document.getElementById('promoCodeInput');
      const code = inputElement.value.toUpperCase();
      
      // Simple validation example
      if (code === "SAVE10") {
          toast.success("Promo code applied! Enjoy your discount.");
          // Add logic to apply discount here
      } else if (!code) {
          toast.info("Please enter a promo code.");
      }
      else {
          toast.error("Invalid promo code or already used.");
      }
      inputElement.value = ""; // Clear input after submission
  };


  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr />

        {food_list.map((item) => {
          const qty = cartItems[item._id] || 0;
          if (qty > 0) {
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                  {/* Image source remains the same using the url from context */}
                  <img src={`${url}/images/${item.image}`} alt={item.name} />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{qty}</p>
                  <p>₹{item.price * qty}</p>
                  <p
                    onClick={() => removeFromCart(item._id)}
                    className="cross"
                  >
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="cart-bottom">
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
              <b>
                ₹
                {getTotalCartAmount() === 0
                  ? 0
                  : getTotalCartAmount() + 2}
              </b>
            </div>
          </div>
          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className="cart-promocode-input">
              {/* Added ID for function access */}
              <input type="text" placeholder="promo code" id="promoCodeInput"/> 
              {/* Added handler */}
              <button onClick={handlePromoCode}>Submit</button> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
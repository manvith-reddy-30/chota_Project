// src/pages/Cart/Cart.jsx

import React, { useContext, useEffect } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate, useLocation } from 'react-router-dom'

const Cart = () => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    token
  } = useContext(StoreContext)

  const navigate = useNavigate()
  const location = useLocation()

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleCheckout = () => {
    const total = getTotalCartAmount()
    if (total === 0) {
      // Cart empty → prompt and send to menu section
      alert('Your cart is empty. Please add items to proceed!')
      navigate('/')
      return
    }
    if (!token) {
      // Not logged in → prompt and send to login
      alert('Please login to continue!')
      navigate('/login', { state: { from: location } })
      return
    }

    if (total === 0) {
      // Cart empty → prompt and send to menu section
      alert('Your cart is empty. Please add items to proceed!')
      navigate('/')
      return
    }

    // Logged in & has items → proceed to checkout
    navigate('/order')
  }

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
          const qty = cartItems[item._id] || 0
          if (qty > 0) {
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
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
            )
          }
          return null
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
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

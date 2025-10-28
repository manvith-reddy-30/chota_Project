// client/src/components/FoodItem/FoodItem.jsx (FINAL MODIFIED)

import React, { useContext } from 'react';
import './FoodItem.css';
// CORRECTED PATH: assets is one level up from components/FoodItem
import { assets } from '../../assets/assets'; 
// CORRECTED PATH: StoreContext is two levels up from components/FoodItem
import { StoreContext } from '../../context/StoreContext'; 

const FoodItem = ({ id, name, price, description, image }) => {
  // Destructure needed functions and state from the unified context
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
 
  // Safely determine item count
  const itemCount = cartItems && cartItems[id] ? cartItems[id] : 0;
  
  // NOTE: Assuming the base URL (url) is needed to construct the image path 
  // for items loaded from the backend (which typically stores only the file name).

  return (
    <div className='food-item'>
      <div className='food-item-img-cont'>
        {/* Construct image URL using the backend URL */}
        <img className='food-item-image' src={`${url}/images/${image}`} alt={name} />
        
        {itemCount === 0 ? (
          <img 
            className='add' 
            onClick={() => addToCart(id)} 
            src={assets.add_icon_white} 
            alt="Add to Cart" 
          />
        ) : (
          <div className='food-item-counter'>
            <img 
              onClick={() => removeFromCart(id)} 
              src={assets.remove_icon_red} 
              alt="Remove from Cart" 
            />
            <p>{itemCount}</p>
            <img 
              onClick={() => addToCart(id)} 
              src={assets.add_icon_green} 
              alt="Add more" 
            />
          </div>
        )}
      </div>
      <div className='food-item-info'>
        <div className='food-item-name-rating'>
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating" />
        </div>
        <p className='food-item-desc'>{description}</p>
        {/* Cleaned up currency display */}
        <p className='food-item-price'>₹{price}</p> 
      </div>
    </div>
  );
};

export default FoodItem;
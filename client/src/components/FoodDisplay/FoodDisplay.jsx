// client/src/components/FoodDisplay/FoodDisplay.jsx (FINAL CODE)

import React, { useContext } from 'react';
import './FoodDisplay.css'
// Correct path relative to components/FoodDisplay
import { StoreContext } from '../../context/StoreContext'; 
import FoodItem from '../FoodItem/FoodItem'; // Correct path relative to components/FoodDisplay

const FoodDisplay = ({ category, searchTerm }) => {
  // Use food_list from the unified context
  const { food_list } = useContext(StoreContext); 

  // Filter logic based on category and search term
  const filteredList = food_list.filter((item) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search);

    return category === "All"
      ? matchesSearch
      : (item.category === category && matchesSearch);
  });

  return (
    <div className='food-display' id='food-display'>
      <h2 style={{ marginTop: '30px', color: 'orange' }}>
        {searchTerm ? `Search Results for "${searchTerm}"` : 'Top Dishes Near You'}
      </h2>
      <div className='food-display-list'>
        {filteredList.length > 0 ? (
          filteredList.map((item, index) => (
            <FoodItem
              key={index}
              id={item._id}
              name={item.name}
              image={item.image}
              description={item.description}
              price={item.price}
            />
          ))
        ) : (
          <p className="no-results">
            {/* Display appropriate message if search yields no results */}
            {searchTerm 
                ? `No items found matching "${searchTerm}" in the selected category.`
                : `No items found in the ${category === 'All' ? 'menu' : category} category.`}
          </p>
        )}
      </div>
    </div>
  );
}

export default FoodDisplay;
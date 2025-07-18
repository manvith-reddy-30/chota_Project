import React, { useContext } from 'react';
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({category,searchTerm}) => {

  const { food_list} = useContext(StoreContext)
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
    <div className='food-display' id ='food-display'>
      <h2>Top dishes near you</h2>
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
          <p className="no-results">No items found for "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
}

export default FoodDisplay;

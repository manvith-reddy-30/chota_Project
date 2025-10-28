// client/src/pages/Admin/List/List.jsx (MODIFIED)

import React, { useState, useEffect, useContext } from 'react'; // ADD useContext
import './List.css';
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from '../../../context/StoreContext'; // ADD StoreContext

// Remove 'url' prop
const List = () => {
  const { url } = useContext(StoreContext); // GET URL from context

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`,{ withCredentials: true });
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching food list");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching food list");
    } finally {
      setLoading(false);
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId },{ withCredentials: true });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error("Error removing food");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while removing food");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='list-table'>
          <div className="list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Action</b>
          </div>
          {list.map((item) => (
            <div key={item._id} className='list-table-format'>
              <img src={`${url}/images/${item.image}`} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>₹{item.price}</p>
              <p className='cursor' onClick={() => removeFood(item._id)}>x</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default List;

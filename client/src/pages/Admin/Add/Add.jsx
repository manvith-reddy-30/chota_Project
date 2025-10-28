// client/src/pages/Admin/Add/Add.jsx (MODIFIED)

import React, { useState, useContext } from 'react'; // ADD useContext
import './Add.css';
import axios from 'axios';
import { toast } from 'react-toastify';
// ADJUSTED PATH: Assumes assets.js is 3 levels up (client/src/assets/assets.js)
import { assets } from '../../../assets/assets'; 
import { StoreContext } from '../../../context/StoreContext'; // ADD StoreContext

// Remove 'url' prop
const Add = () => { 
  const { url } = useContext(StoreContext); // GET URL from context
  
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad"
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error('Image not selected');
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", parseFloat(data.price) || 0);
      formData.append("category", data.category);
      formData.append("image", image);

      const response = await axios.post(`${url}/api/food/add`, formData,{ withCredentials: true });

      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad"
        });
        setImage(null);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error("Server error. Please try again.");
    }
  };

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className='add-img-upload flex-col'>
          <p>Upload image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="Upload Preview" />
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            required
            accept="image/*"
          />
        </div>

        <div className='add-product-name flex-col'>
          <p>Product name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            name='name'
            type="text"
            placeholder='Type here'
            required
          />
        </div>

        <div className='add-product-description flex-col'>
          <p>Product description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name='description'
            rows={6}
            placeholder='Write content here'
            required
          />
        </div>

        <div className='add-category-price'>
          <div className='add-category flex-col'>
            <p>Product category</p>
            <select
              onChange={onChangeHandler}
              name='category'
              value={data.category}
              required
            >
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>

          <div className='add-price flex-col'>
            <p>Product Price</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              name='price'
              placeholder='₹25'
              min="0"
              required
            />
          </div>
        </div>

        <button type='submit' className='add-btn'>ADD</button>
      </form>
    </div>
  );
};

export default Add;

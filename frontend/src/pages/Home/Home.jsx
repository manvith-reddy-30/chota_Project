import React, { useState, useEffect, useContext } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import AppDownload from '../../components/AppDownlaod/AppDownload';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Home = () => {
  const [category, setCategory] = useState("All");
  const { url } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState([]);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get(url); 
        setLoading(false);
      } catch (error) {
        console.error("Backend not responding:", error);
        setLoading(false);
      }
    };

    checkBackend();
  }, [url]);

  return (
    <>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />

      {loading ? (
        <div className="loader">
          Loading...
        </div>
      ) : (
        <FoodDisplay category={category}/>
      )}

      <AppDownload />
    </>
  );
};

export default Home;

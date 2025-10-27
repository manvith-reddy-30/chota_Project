import React, { useState, useEffect, useContext } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import AppDownload from '../../components/AppDownlaod/AppDownload';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';

const Home = () => {
  const [category, setCategory] = useState('All');
  const { url } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get(url);
        setIsLoading(false);
      } catch (error) {
        console.error('Backend not responding:', error);
        setBackendError('Our servers are currently down. Please try again later.');
        setIsLoading(false);
      }
    };

    checkBackend();
  }, [url]);

  return (
    <>
      <Header />
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ExploreMenu category={category} setCategory={setCategory} />

      {isLoading ? (
        <div className="loader">Loading...</div>
      ) : backendError ? (
        <div className="error">{backendError}</div>
      ) : (
        <FoodDisplay category={category} searchTerm={searchTerm} />
      )}

      <AppDownload />
    </>
  );
};

export default Home;

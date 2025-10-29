// client/src/pages/Home/Home.jsx (MODIFIED)

import React, { useState, useEffect, useContext } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import AppDownload from '../../components/AppDownlaod/AppDownload';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify'; // <-- NEW: Import Toastify

// NOTE: Navbar import and usage is removed because it should be part of the outer AppLayout, 
// not the Home page itself, to maintain a consistent header across all user pages.

const Home = () => {
  const [category, setCategory] = useState('All');
  const { url } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // This check is mainly for development; in production, backend issues 
    // are usually handled by the individual API calls in FoodDisplay/ExploreMenu.
    // However, keeping it for initial server availability check.
    const checkBackend = async () => {
      try {
        // Simple ping to ensure the server root is reachable
        await axios.get(url); 
        setIsLoading(false);
      } catch (error) {
        console.error('Backend not responding:', error);
        const errorMessage = 'Our servers are currently unreachable. Please try again later.';
        setBackendError(errorMessage);
        setIsLoading(false);
        toast.error(errorMessage); // <-- NEW: Toastify Feedback
      }
    };

    checkBackend();
  }, [url]);

  return (
    <>
      <Header />
      {/* REMOVED: <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> 
          The Navbar should be rendered in the parent UserLayout.
          We will assume search state management moves to the Navbar component itself 
          or a shared context if needed globally. If search is *only* used here,
          you must manage it in the parent Navbar and pass it down, or include the
          Navbar component back here if it is dynamic to the home page. 
          For now, I'm removing the redundant import/component call.
      */}
      
      <ExploreMenu category={category} setCategory={setCategory} />

      {isLoading ? (
        <div className="loader">Loading menu...</div>
      ) : backendError ? (
        <div className="error">{backendError}</div>
      ) : (
        // Pass searchTerm down to filter food items
        <FoodDisplay category={category} searchTerm={searchTerm} /> 
      )}

      <AppDownload />
    </>
  );
};

export default Home;
// client/src/components/Admin/Navbar/Navbar.jsx (UPDATED WITH LOGOUT)
import React, { useContext } from 'react';
import './Navbar.css';
import { assets } from '../../../assets/assets';
import { StoreContext } from '../../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { url, clearCart, checkLoginStatus } = useContext(StoreContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get(`${url}/api/user/logout`, { withCredentials: true });
      clearCart();

      await checkLoginStatus(); 

      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Admin logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img className="logo" src={assets.logo} alt="Admin Logo" />
        <h2 className="admin-title">Admin Panel</h2>
      </div>

      <div className="navbar-right">
        <img className="profile" src={assets.profile_icon} alt="Profile" />
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;

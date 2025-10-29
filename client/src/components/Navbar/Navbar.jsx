// client/src/components/Navbar/Navbar.jsx (FINAL MODIFIED)

import React, { useContext, useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
// CORRECTED PATH: assets is one level up from components/Navbar
import { assets } from "../../assets/assets"; 
// CORRECTED PATH: StoreContext is two levels up from components/Navbar
import { StoreContext } from "../../context/StoreContext"; 
import axios from "axios";
import { toast } from "react-toastify"; // NEW: Import Toastify

const Navbar = (props) => {
  const [menu, setMenu] = useState("home");
  const {
    getTotalCartAmount,
    checkLoginStatus,
    loggedIn,
    userRole, // NEW: Consume userRole for RBAC checks
    url,
    clearCart      
  } = useContext(StoreContext);
  
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  // Search props are passed down from the parent (Home.jsx or App.jsx)
  // Assuming the search term logic is now managed in the parent Home.jsx, 
  // though managing it here is simpler if the Home component doesn't need the state.
  const { searchTerm, setSearchTerm } = props; 

  const scroll = () => {
    // Scroll to the main content wrapper (assumed to be ID 'home')
    const homeid = document.getElementById("home"); 
    if (homeid) {
      homeid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    // Check status on mount to hydrate context, which fetches role
    checkLoginStatus(); 
  }, [checkLoginStatus]);

  const logout = async () => {
    try {
      await axios.get(`${url}/api/user/logout`, { withCredentials: true });
      clearCart();
      // Ensure local state and context state are reset
      await checkLoginStatus(); 
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        // NOTE: You need a backend endpoint /api/user/name 
        // that uses authMiddleware to return the user's name
        const response = await axios.get(`${url}/api/profile/get`, { // Using profile endpoint if available
          withCredentials: true,
        });
        // Assuming response.data.data has the user details
        setUserName(response.data.data.name || response.data.userName); 
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("User"); // Fallback
      }
    };
    if (loggedIn) fetchUserName();
  }, [loggedIn, url]);

  return (
    <div className="navbar">
      <div className="logo">
        <Link to="/" className="logo-link" onClick={() => { setMenu("Home"); scroll(); }}>
          {/* Ensure assets.cusinecraze is the correct logo path in your assets.js */}
          <img src={assets.cusinecraze} alt="Logo" className="logopng" /> 
          <h1 className="logoname">CUISINECRAZE</h1>
        </Link>
      </div>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => { setMenu("Home"); scroll(); }}
          className={menu === "Home" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("Menu")}
          className={menu === "Menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("Contact-Us")}
          className={menu === "Contact-Us" ? "active" : ""}
        >
          Contact-Us
        </a>
      </ul>
      
      <div className={`navbar-right ${showSearch ? 'search-active' : ''}`}>
        <div className="navbar-search">
          {!showSearch ? (
            <img
              src={assets.search_icon}
              alt="Search"
              className="clickable-icon"
              onClick={() => setShowSearch(true)}
            />
          ) : (
            <div className="navbar-search">
              <div className="search-container">
                {/* Search input is managed here, and state is passed up via props */}
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input stylish-search-input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                       // Custom scroll to menu section on Enter
                       const exploreMenu = document.getElementById("explore-menu");
                       if (exploreMenu) {
                         exploreMenu.scrollIntoView({ behavior: "smooth", block: "start" });
                       }
                    }
                  }}
                />
                {searchTerm ? (
                  <img
                    src={assets.cross_icon}
                    alt="Clear"
                    className="search-action-icon"
                    onClick={() => setSearchTerm("")}
                  />
                ) : (
                  <img
                    src={assets.search_icon}
                    alt="Search"
                    className="search-action-icon"
                    onClick={() => {
                       // Scroll to food display on icon click
                       const foodDisplay = document.getElementById("food-display");
                       if (foodDisplay) {
                         foodDisplay.scrollIntoView({ behavior: "smooth", block: "start" });
                       }
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="navbar-cart-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="Cart" />
          </Link>
          {getTotalCartAmount() > 0 && <div className="dot" />}
        </div>

        {!loggedIn ? (
          <Link to="/login" className="login-button">Sign In</Link>
        ) : (
          <div className="navbar-profile">
            <div className="profile-content">
              <img className="imgp" src={assets.profile_icon} alt="Profile Icon" />
              <ul className="navbar-profile-dropdown">
                {/* 1. Admin Dashboard Link (RBAC) */}
                {userRole === 'admin' && (
                   <>
                       <li onClick={() => navigate("/admin")}>
                          <img src={assets.parcel_icon} alt="Admin Icon" />
                          <p>Admin Dashboard</p>
                        </li>
                        <hr />
                   </>
                )}
                
                {/* 2. Profile Link */}
                <li onClick={() => navigate("/profile")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    className="bi bi-person-fill" viewBox="0 0 16 16" style={{ color: "orange" }}>
                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                  </svg>
                  <p>Profile</p>
                </li>
                <hr />
                
                {/* 3. Orders Link */}
                <li onClick={() => navigate("/myorders")}>
                  <img src={assets.bag_icon} alt="Orders Icon" />
                  <p>Orders</p>
                </li>
                <hr />
                
                {/* 4. Logout Link */}
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="Logout Icon" />
                  <p>Logout</p>
                </li>
              </ul>
            </div>
            <div className="profile-username">
              <p className="name-of-person">{userName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
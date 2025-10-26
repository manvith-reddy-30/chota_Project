import React, { useContext, useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const Navbar = (props) => {
  const [menu, setMenu] = useState("home");
  const {
    getTotalCartAmount,
    checkLoginStatus,
    loggedIn,
    url,
    clearCart      
  } = useContext(StoreContext);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  const { searchTerm, setSearchTerm } = props;

  const scroll = () => {
    const homeid = document.getElementById("home");
    if (homeid) {
      homeid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  const scrollToFoodDisplay = () => {
    const foodDisplay = document.getElementById("food-display");
    if (foodDisplay) {
      foodDisplay.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        window.scrollBy({
          top: 100, // adjust as needed for "somewhat more"
          behavior: "smooth",
        });
      }, 500);
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${url}/api/user/logout`, { withCredentials: true });
      clearCart();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get(`${url}/api/user/name`, {
          withCredentials: true,
        });
        setUserName(response.data.userName);
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };
    if (loggedIn) fetchUserName();
  }, [loggedIn, url]);

  return (
    <div className="navbar">
      <div className="logo">
        <Link to="/" className="logo-link" onClick={() => { setMenu("Home"); scroll(); }}>
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
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input stylish-search-input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const foodDisplay = document.getElementById("explore-menu");
                      if (foodDisplay) {
                        foodDisplay.scrollIntoView({ behavior: "smooth", block: "start" });
                        setTimeout(() => {
                          window.scrollBy({ top: 150, behavior: "smooth" });
                        }, 500);
                      }
                    }
                  }}
                />
                {searchTerm ? (
                  <img
                    src={assets.cross_icon} // replace with your clear icon path
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
                      const foodDisplay = document.getElementById("food-display");
                      if (foodDisplay) {
                        foodDisplay.scrollIntoView({ behavior: "smooth", block: "start" });
                        setTimeout(() => {
                          window.scrollBy({ top: 200, behavior: "smooth" });
                        }, 500);
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
          <Link to="/login" className="login-button">Sign In??</Link>
        ) : (
          <div className="navbar-profile">
            <div className="profile-content">
              <img className="imgp" src={assets.profile_icon} alt="Profile Icon" />
              <ul className="navbar-profile-dropdown">
                <li onClick={() => navigate("/profile")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    className="bi bi-person-fill" viewBox="0 0 16 16" style={{ color: "orange" }}>
                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                  </svg>
                  <p>Profile</p>
                </li>
                <hr />
                <li onClick={() => navigate("/myorders")}>
                  <img src={assets.bag_icon} alt="Orders Icon" />
                  <p>Orders</p>
                </li>
                <hr />
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

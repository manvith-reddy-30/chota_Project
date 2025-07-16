import React, { useContext, useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const {
    getTotalCartAmount,
    token,
    setToken,
    url,
    clearCart      // <— imported clearCart
  } = useContext(StoreContext);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const scroll = () => {
    const homeid = document.getElementById("home");
    if (homeid) {
      homeid.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  const scrollToMenu = () => {
    navigate("/#explore-menu");
  };

  const logout = () => {
    // 1) Remove auth token
    localStorage.removeItem("token");
    setToken("");

    // 2) Clear cart via context helper
    clearCart();

    // 3) Redirect to home
    navigate("/");
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get(`${url}/api/user/name`, {
          headers: { token },
        });
        setUserName(response.data.userName);
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    if (token) fetchUserName();
  }, [token, url]);

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => {
            setMenu("Home");
            scroll();
          }}
          className={menu === "Home" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => {
            setMenu("Menu");
            scrollToMenu();
          }}
          className={menu === "Menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="#app-download"
          onClick={() => setMenu("Mobile-App")}
          className={menu === "Mobile-App" ? "active" : ""}
        >
          Mobile-App
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("Contact-Us")}
          className={menu === "Contact-Us" ? "active" : ""}
        >
          Contact-Us
        </a>
      </ul>

      <div className="navbar-right">
        <img src={assets.search_icon} alt="Search" />

        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="Cart" />
          </Link>
          {getTotalCartAmount() > 0 && <div className="dot" />}
        </div>

        {!token ? (
          <Link to="/login" className="login-button">
            Sign In
          </Link>
        ) : (
          <div className="navbar-profile">
            <div className="profile-content">
              <img
                className="imgp"
                src={assets.profile_icon}
                alt="Profile Icon"
              />
              <ul className="navbar-profile-dropdown">
                <li onClick={() => navigate("/profile")}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-person-fill"
                    viewBox="0 0 16 16"
                    style={{ color: "orange" }}
                  >
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

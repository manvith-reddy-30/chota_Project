import { useContext, useState } from "react";
import PropTypes from 'prop-types';
import { auth,provider } from "../../firebase/firebase";
import './LoginPopup.css'
import { signInWithPopup } from "firebase/auth";
import {assets} from '../../assets/assets'
import { StoreContext } from "../../context/StoreContext";
import axios from "axios"

const LoginPopup = ({ setShowLogin }) => {

    const { setToken, url } = useContext(StoreContext)

    const [currState, setCurrState] = useState("Login")
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })
    
    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }


    const onLogin = async (event) => {
        event.preventDefault();
    
        let new_url = url;
        if (currState === "Login") {
            new_url += "/api/user/login";
        } else {
            new_url += "/api/user/register";
        }
    
        try {
            const response = await axios.post(new_url, data);
    
            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                setShowLogin(false);
            } else {
                // Handles user not found, invalid credentials, or other backend messages
                alert(response.data.message);
                console.log("Login failed:", response.data.message);
            }
    
        } catch (error) {
            console.error("Error during login request:", error);
    
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert("An unexpected error occurred. Please try again.");
            }
        }
    };
    

    const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const googleUserData = {
      name: user.displayName,
      email: user.email,
      password: user.uid, // dummy for backend compatibility
    };

    const response = await axios.post(`${url}/api/user/google-login`, googleUserData);

    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      setShowLogin(false);
    } else {
      alert(response.data.message);
    }
  } catch (err) {
    console.error("Google login error:", err);
    alert("Google login failed. Try again.");
  }
};

   return (
  <div className="login-popup">
    <form onSubmit={onLogin} className="login-popup-container">
      <div className="login-popup-title">
        <h2>{currState}</h2>
        <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
      </div>

      <div className="login-popup-inputs">
        {currState === "Login" ? null : (
          <input
            name="name"
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            placeholder="Your name"
            required
          />
        )}
        <input
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Your email"
          required
        />
        <input
          name="password"
          onChange={onChangeHandler}
          value={data.password}
          type="password"
          placeholder="Password"
          required
        />
      </div>

      <button type="submit">
        {currState === "Sign Up" ? "Create account" : "Login"}
      </button>

      <div className="google-login-divider">
        <span>or</span>
      </div>

      <button type="button" onClick={handleGoogleLogin} className="google-login-btn">
        <img src={assets.google_icon} alt="google" />
        Continue with Google
      </button>

      <div className="login-popup-condition">
        <input type="checkbox" required />
        <p>By continuing, I agree to the terms of use & privacy policy.</p>
      </div>

      {currState === "Login" ? (
        <p>
          Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span>
        </p>
      ) : (
        <p>
          Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span>
        </p>
      )}
    </form>
  </div>
);

}

export default LoginPopup;

LoginPopup.propTypes = {
    setShowLogin: PropTypes.func.isRequired,
};

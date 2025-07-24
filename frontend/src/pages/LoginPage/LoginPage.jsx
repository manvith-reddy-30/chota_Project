import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, provider } from '../../firebase/firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loadCartData, url } = useContext(StoreContext);

  const from = location.state?.from?.pathname || '/';

  const [mode, setMode] = useState('Login');
  const [data, setData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuccess = async () => {
    await loadCartData();
    navigate(from, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === 'Login' ? '/api/user/login' : '/api/user/register';
    try {
      const res = await axios.post(`${url}${endpoint}`, data, {
        withCredentials: true,
      });
      if (res.data.success) {
        await handleSuccess();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const payload = {
        name: user.displayName,
        email: user.email,
        password: user.uid,
      };
      const res = await axios.post(`${url}/api/user/google-login`, payload, {
        withCredentials: true,
      });
      if (res.data.success) {
        await handleSuccess();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error('Google login failed:', err);
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={submit}>
        <h2>{mode}</h2>
        {error && <p className="error-msg">{error}</p>}

        {mode === 'Sign Up' && (
          <input
            name="name"
            value={data.name}
            onChange={onChange}
            type="text"
            placeholder="Your name"
            required
          />
        )}

        <input
          name="email"
          value={data.email}
          onChange={onChange}
          type="email"
          placeholder="Your email"
          required
        />
        <input
          name="password"
          value={data.password}
          onChange={onChange}
          type="password"
          placeholder="Password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading
            ? 'Please wait...'
            : mode === 'Sign Up'
            ? 'Create account'
            : 'Login'}
        </button>

        <div className="divider"><span>or</span></div>

        <button
          type="button"
          onClick={googleLogin}
          className="google-btn"
          disabled={loading}
        >
          <img src={assets.google_icon} alt="google" />
          Continue with Google
        </button>

        <div className="toggle-mode">
          {mode === 'Login' ? (
            <p>
              Create a new account?{' '}
              <span onClick={() => setMode('Sign Up')}>Click here</span>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <span onClick={() => setMode('Login')}>Login here</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;

import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Profile.css';

const Profile = () => {
  const { token } = useContext(StoreContext);
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Optional: Load from localStorage if available
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userProfile'));
    if (storedUser) {
      setUserData(storedUser);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save to localStorage or send to backend
    localStorage.setItem('userProfile', JSON.stringify(userData));
    alert('Profile saved successfully!');
  };

  return (
    <div className="profile-page">
      <h1>👤 My Profile</h1>

      <div className="profile-form">
        <label>
          Full Name
          <input type="text" name="name" value={userData.name} onChange={handleChange} />
        </label>

        <label>
          Email
          <input type="email" name="email" value={userData.email} onChange={handleChange} />
        </label>

        <label>
          Phone Number
          <input type="tel" name="phone" value={userData.phone} onChange={handleChange} />
        </label>

        <label>
          Delivery Address
          <textarea name="address" value={userData.address} onChange={handleChange} rows={4} />
        </label>

        <button className="save-btn" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
};

export default Profile;

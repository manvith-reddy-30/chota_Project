// client/src/pages/Profile/Profile.jsx (FINAL MODIFIED)

import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Profile.css';
import { toast } from 'react-toastify'; // NEW: Import Toastify
import axios from 'axios'; // Import axios for backend calls

const Profile = () => {
  const { url, loggedIn } = useContext(StoreContext); // Use url and loggedIn from context
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user profile data from the backend
  const fetchUserProfile = async () => {
    if (!loggedIn) {
        setIsLoading(false);
        return;
    }
    try {
        const response = await axios.get(`${url}/api/profile/get`, { withCredentials: true });
        if (response.data.success) {
            setUserData(response.data.data);
        } else {
            toast.error(response.data.message || "Failed to load profile data.");
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Could not connect to server to load profile.");
    } finally {
        setIsLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchUserProfile();
  }, [url, loggedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const response = await axios.post(`${url}/api/profile/update`, userData, { withCredentials: true });
        
        if (response.data.success) {
            // REPLACED ALERT
            toast.success('Profile saved successfully!');
            // Optional: Re-fetch to ensure sync, or just rely on new state:
            // fetchUserProfile(); 
        } else {
            toast.error(response.data.message || "Failed to save profile changes.");
        }
    } catch (error) {
        console.error("Error saving profile:", error);
        toast.error("A network error occurred while saving profile.");
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="profile-page">
        <h1>👤 My Profile</h1>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>👤 My Profile</h1>

      <div className="profile-form">
        <label>
          Full Name
          <input type="text" name="name" value={userData.name} onChange={handleChange} disabled={isSaving} />
        </label>

        <label>
          Email
          {/* Email often shouldn't be mutable via the profile page if it's the primary ID */}
          <input type="email" name="email" value={userData.email} onChange={handleChange} disabled={true} /> 
        </label>

        <label>
          Phone Number
          <input type="tel" name="phone" value={userData.phone} onChange={handleChange} disabled={isSaving} />
        </label>

        <label>
          Delivery Address
          <textarea name="address" value={userData.address} onChange={handleChange} rows={4} disabled={isSaving} />
        </label>

        <button className="save-btn" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
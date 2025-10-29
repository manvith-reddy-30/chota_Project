// client/src/components/Footer/Footer.jsx (FINAL MODIFIED)

import React from 'react';
import './Footer.css';
// CORRECTED PATH: assets is one level up from components/Footer
import { assets } from '../../assets/assets'; 


const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Left: brand + socials */}
          <div className="footer-section footer-section--brand">
            {/* Using the cusinecraze logo asset from the unified assets list */}
            <img src={assets.cusinecraze_logo} alt="CuisineCraze Logo" className="footer-logo" /> 
            <p>Have a good meal</p>
            <div className="footer-social-icons">
              <img src={assets.facebook_icon} alt="Facebook" />
              <img src={assets.linkedin_icon} alt="LinkedIn" />
              <img src={assets.twitter_icon} alt="Twitter" />
            </div>
          </div>

          {/* Center: company links */}
          <div className="footer-section footer-section--links">
            <h2>Company</h2>
            <ul>
              <li>Home</li>
              <li>About Us</li>
              <li>Delivery</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          {/* Right: contact info */}
          <div className="footer-section footer-section--contact">
            <h2>Get In Touch</h2>
            <ul>
              <li>+91 6302258615</li>
              <li>contact.cuisine.craze@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-copy">
        {/* Updated branding to reflect 'CuisineCraze' if that is the correct project name, 
            or keep 'Tomato.com' if that is the intended brand name. Assuming Tomato is the brand name based on original code. */}
        Copyright 2024 © Tomato.com – All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
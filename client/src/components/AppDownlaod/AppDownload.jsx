// client/src/components/AppDownlaod/AppDownload.jsx (FINAL CODE)

import React from 'react';
import './AppDownload.css'
// Path remains correct relative to its nested position
import { assets } from '../../assets/assets';

const AppDownload = () => {
  return (
    <div className='app-download' id ='app-download'>
      <p>For Better Experience Download <br />Tomato App</p>
            <div className="app-download-platforms">
                <img src={assets.play_store} alt="Download on Google Play Store" />
                <img src={assets.app_store} alt="Download on Apple App Store" />
            </div>
    </div>
  );
}

export default AppDownload;
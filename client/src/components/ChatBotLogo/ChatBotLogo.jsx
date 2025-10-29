// client/src/components/ChatBotLogo/ChatBotLogo.jsx (FINAL MODIFIED)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBotLogo.css';
// CORRECTED PATH: assets is two levels up from components/ChatBotLogo
import { assets } from '../../assets/assets'; 

const ChatbotLogo = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chatbot');
  };

  return (
    <div className="chatbot-logo" onClick={handleClick}>
      {/* Assuming the flaticon URL is intentional, otherwise use assets.chatbot_icon if available */}
      <img src="https://cdn-icons-png.flaticon.com/512/4712/4712104.png" alt="Chatbot Logo" />
    </div>
  );
};

export default ChatbotLogo;
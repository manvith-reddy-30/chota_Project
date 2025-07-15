import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBotLogo.css';
import { assets } from '../../assets/assets';

const ChatbotLogo = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chatbot');
  };

  return (
    <div className="chatbot-logo" onClick={handleClick}>
      <img src="https://cdn-icons-png.flaticon.com/512/4712/4712104.png" alt="Chatbot Logo" />

    </div>
  );
};

export default ChatbotLogo;

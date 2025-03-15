// ChatbotLogo.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBotLogo.css';

const ChatbotLogo = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chatbot');
  };

  return (
    <div className="chatbot-logo" onClick={handleClick}>
      <img src="/path/to/logo.png" alt="Chatbot Logo" />
    </div>
  );
};

export default ChatbotLogo;
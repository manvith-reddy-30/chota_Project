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
      <img src="/new/path/to/logo.png" alt="Chatbot Logo" /> // Update this path
    </div>
  );
};

export default ChatbotLogo;
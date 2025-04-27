import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './ChatBot.css';  // Include the updated CSS file

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); // NEW state for loading
  const { url } = useContext(StoreContext);

  const sendMessage = async () => {
    if (!input) return; // Prevent sending empty messages

    const newMessages = [...messages, { text: input, user: true }];
    setMessages(newMessages);
    setInput('');
    setLoading(true); // Start loading

    try {
      const response = await fetch(`${url}/api/user/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await response.json();
      
      setMessages([
        ...newMessages,
        { text: data.response, user: false },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...newMessages,
        { text: "Something went wrong. Please try again.", user: false },
      ]);
    } finally {
      setLoading(false); // Always stop loading after request finishes
    }
  };

  return (
    <div className="ChatBot">
      <h1>ChatBot</h1>
      <h2>Ask me anything!</h2>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.user ? 'user' : 'bot'}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="message bot loading">
            Bot is typing...
          </div>
        )}
      </div>

      <input
        type="text"
        className="input-field"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button className="send-button" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default Chatbot;

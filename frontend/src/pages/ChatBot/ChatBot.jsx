import React, { useState, useContext, useRef,useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import ReactMarkdown from 'react-markdown';
import { FiSend, FiStopCircle } from 'react-icons/fi';
import './ChatBot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { url } = useContext(StoreContext);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null); 
  const { cartItems, food_list, token } = useContext(StoreContext);

  const stopMessage = () => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
      setLoading(false);
    }
  };

  // Load chat from localStorage on first render
useEffect(() => {
  const savedMessages = localStorage.getItem("chatMessages");
  if (savedMessages) {
    setMessages(JSON.parse(savedMessages));
  }
}, []);

// Save chat to localStorage on message update
useEffect(() => {
  localStorage.setItem("chatMessages", JSON.stringify(messages));
}, [messages]);

const scrollToBottom = () => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
  }
};



  const sendMessage = async () => {
    scrollToBottom();
    if (!input.trim() || loading) return;


    const newMessages = [...messages, { text: input, user: true }, { text: '', user: false }];
    setMessages(newMessages);
    scrollToBottom();
    setInput('');
    setLoading(true);
    

    try {
      const response = await fetch(`${url}/api/user/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { token }), // optional token header
        },
        body: JSON.stringify({
          prompt: input,
          cartItems,
          foodList: food_list.map(item => ({
            name: item.name,
            price: item.price,
            _id: item._id
          })),
          token
        }),
      });
      const data = await response.json();

      let displayText = '';
      const finalText = data.response;

      const streamMessage = () => {
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = { text: displayText, user: false };
          return updatedMessages;
        });

        if (messagesEndRef.current) {
          messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }

        if (displayText.length < finalText.length) {
          displayText += finalText.charAt(displayText.length);
          typingTimeout.current = setTimeout(streamMessage, 20);
        } else {
          setLoading(false);
          typingTimeout.current = null;
        }
        
      };

      streamMessage();

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...newMessages.slice(0, -1),
        { text: "Something went wrong. Please try again.", user: false },
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="ChatBot">
      <h1>ChatBot</h1>
      
      <div className="chat-header-wrapper">
        <h2 className="chat-heading">Ask me anything!</h2>
        <button
          onClick={() => {
            setMessages([]);
            localStorage.removeItem("chatMessages");
          }}
          className="clear-button"
        >
          Clear Chat
        </button>
      </div>



      <div className="messages" ref={messagesEndRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.user ? 'user' : 'bot'}`}
          >
            {msg.user ? (
              msg.text
            ) : (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            )}
          </div>
        ))}
        {loading && (
          <div className="message bot loading">
            Bot is typing...
          </div>
        )}
      </div>

      <div className="input-container">
        <input
          type="text"
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={loading} 
        />
        <button className="icon-button" onClick={loading ? stopMessage : sendMessage}>
          {loading ? <FiStopCircle size={24} /> : <FiSend size={24} />}
        </button>
      </div>

    </div>
  );
};

export default Chatbot;

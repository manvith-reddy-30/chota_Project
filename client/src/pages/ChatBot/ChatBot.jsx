// client/src/pages/ChatBot/ChatBot.jsx (MODIFIED)

import React, { useState, useContext, useRef, useEffect } from 'react';
// CORRECTED PATH: StoreContext is one level up from pages/ChatBot
import { StoreContext } from '../../context/StoreContext'; 
import ReactMarkdown from 'react-markdown';
import { FiSend, FiStopCircle } from 'react-icons/fi';
import './ChatBot.css';
import { toast } from 'react-toastify'; // <-- NEW: Import Toastify

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { url, cartItems, food_list, loggedIn } = useContext(StoreContext); // Use loggedIn state instead of token
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  
  // NOTE: You are passing 'token' in the body, but it is not destructive if not needed by the backend.
  // Assuming the context doesn't expose the token, we can remove it from the destructured context.

  const stopMessage = () => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
      setLoading(false);
      // Ensure the placeholder message is correctly resolved if interrupted
      setMessages(prev => {
         const lastMessage = prev[prev.length - 1];
         if (!lastMessage.user && lastMessage.text === '') {
             return [...prev.slice(0, -1), { text: 'Message generation interrupted.', user: false }];
         }
         return prev;
      });
    }
  };

  useEffect(() => {
    // Initial scroll to bottom
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, []); // Run once on mount

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    // Auto-scroll logic is cleaner inside this effect
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    // Check if the user is authenticated before allowing advanced queries
    if (!loggedIn) {
        toast.error("Please log in to use the full capabilities of the chatbot!");
        // We still let the user ask basic questions, so no 'return' here.
    }

    const userMessage = { text: input, user: true };
    const botPlaceholder = { text: '', user: false, isPlaceholder: true }; // Mark as placeholder
    const updatedMessages = [...messages, userMessage, botPlaceholder];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const payload = {
          prompt: input,
          // Only send cart and food data if the bot needs context (which it does)
          cartItems,
          foodList: food_list.map(item => ({
            name: item.name,
            price: item.price,
            _id: item._id,
          })),
          // NOTE: Token must be managed via cookies/credentials for security
          // Sending it in the body is generally unnecessary if cookies are used.
          // If your backend relies on the token in the body, you must retrieve it securely.
      };

      const response = await fetch(`${url}/api/user/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        withCredentials: true, // IMPORTANT: Ensure credentials (cookies) are sent
      });

      if (!response.ok) {
           throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const finalText = data.response;
      let displayText = '';

      // Clear any running timeouts before starting a new stream
      if (typingTimeout.current) clearTimeout(typingTimeout.current);

      const streamMessage = () => {
        setMessages(prev => {
          const temp = [...prev];
          // Find the last message (which is the placeholder) and update it
          const placeholderIndex = temp.length - 1; 

          // Stop if streaming is interrupted
          if (placeholderIndex < 0 || temp[placeholderIndex].isPlaceholder !== true) {
              return prev;
          }

          temp[placeholderIndex] = { text: displayText, user: false, isPlaceholder: false };
          return temp;
        });

        if (displayText.length < finalText.length) {
          displayText += finalText.charAt(displayText.length);
          typingTimeout.current = setTimeout(streamMessage, 20); // Typing speed
        } else {
          setLoading(false);
          typingTimeout.current = null;
          // Final update to remove placeholder mark
          setMessages(prev => {
            const temp = [...prev];
            temp[temp.length - 1].isPlaceholder = false;
            return temp;
          });
        }
      };

      streamMessage();
    } catch (error) {
      console.error('Error sending message:', error);
      // Replace the placeholder message with an error toast and message
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: 'Oops! I ran into an error. Please try rewording your request.', user: false },
      ]);
      toast.error('Failed to get a response from the ChatBot.'); // <-- NEW: Toastify error
      setLoading(false);
    }
  };

  return (
    <div className="ChatBot">
      <h1>CuisineCraze AI Assistant</h1>

      <div className="chat-header-wrapper">
        <h2 className="chat-heading">Ask me anything about your order, cart, or menu!</h2>
        <button
          onClick={() => {
            setMessages([]);
            localStorage.removeItem('chatMessages');
            toast.info("Chat history cleared."); // <-- NEW: Toastify info
          }}
          className="clear-button"
        >
          Clear Chat
        </button>
      </div>

      <div className="messages" ref={messagesEndRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.user ? 'user' : 'bot'}`}>
            {/* The placeholder text should not be rendered via ReactMarkdown initially */}
            {msg.user || msg.text.length === 0 ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
          </div>
        ))}
        {loading && (
          <div className="message bot loading">AI is thinking...</div>
        )}
      </div>

      <div className="input-container">
        <input
          type="text"
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={loading ? "Generating response..." : "Type your message..."}
          disabled={loading}
        />
        <button
          className="icon-button"
          onClick={loading ? stopMessage : sendMessage}
          disabled={loading && typingTimeout.current === null} // Disable send if loading is occurring but not finished streaming
        >
          {loading ? <FiStopCircle size={24} /> : <FiSend size={24} />}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
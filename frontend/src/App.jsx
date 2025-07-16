import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Cart from './pages/Cart/Cart'
import Footer from './components/Footer/Footer'
import MyOrders from './pages/MyOrders/MyOrders'
import Verify from './pages/Verify/verify'
import Chatbot from './pages/ChatBot/ChatBot.jsx'
import ChatbotLogo from './components/ChatBotLogo/ChatBotLogo.jsx'
import LoginPage from './pages/LoginPage/LoginPage'

const App = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
        <ChatbotLogo />
      </main>
      <Footer />
    </div>
  )
}

export default App

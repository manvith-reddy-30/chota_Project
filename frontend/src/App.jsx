import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Cart from './pages/Cart/Cart'
import MyOrders from './pages/MyOrders/MyOrders'
import Verify from './pages/Verify/verify'
import Chatbot from './pages/ChatBot/ChatBot.jsx'
import LoginPage from './pages/LoginPage/LoginPage'
import ChatbotLogo from './components/ChatBotLogo/ChatBotLogo.jsx'
import Footer from './components/Footer/Footer'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'

const App = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/chatbot" element={<Chatbot />} />

          {/* Protected checkout route */}
          <Route
            path="/order"
            element={
              <ProtectedRoute>
                <PlaceOrder />
              </ProtectedRoute>
            }
          />
        </Routes>

        <ChatbotLogo />
      </main>
      <Footer />
    </div>
  )
}

export default App

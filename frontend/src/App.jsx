import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Cart from './pages/Cart/Cart'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import MyOrders from './pages/MyOrders/MyOrders'
import Verify from './pages/Verify/verify'
import Chatbot from './ChatBot/ChatBot.jsx'
import ChatbotLogo from './pages/ChatBot/ChatBot.jsx'

const App = () => {
  const [showLogin,setShowLogin] = useState(false)
  return (
    <>
      {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin}/>

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path = '/verify' element ={<Verify/>} />
          <Route path='/myorders' element={<MyOrders/>}/>
          <Route path='/chatbot' element={<Chatbot />}/>
        </Routes>
      </div>
       <Footer/>
       <ChatbotLogo />
    </>

  )
}

export default App

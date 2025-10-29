// client/src/App.jsx (FINAL MODIFIED - FIXING INFINITE LOOP)

import React, { useContext } from 'react';
import { Routes, Route, Navigate ,Outlet} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StoreContext } from './context/StoreContext';

// --- USER/SHARED COMPONENTS ---
import UserNavbar from './components/Navbar/Navbar';
import UserHome from './pages/Home/Home';
import LoginPage from './pages/LoginPage/LoginPage';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Verify from './pages/Verify/verify';
import MyOrders from './pages/MyOrders/MyOrders';
import Profile from './pages/Profile/Profile';
import Footer from './components/Footer/Footer';
import ChatbotLogo from './components/ChatBotLogo/ChatBotLogo';
import Chatbot from './pages/ChatBot/ChatBot.jsx';

// --- ADMIN COMPONENTS ---
import AdminNavbar from './components/Admin/Navbar/Navbar';
import AdminSidebar from './components/Admin/Sidebar/Sidebar';
import AdminAdd from './pages/Admin/Add/Add';
import AdminList from './pages/Admin/List/List';
import AdminOrders from './pages/Admin/Orders/Orders';


// --- LAYOUT DEFINITIONS ---

// 1. User Layout (for regular users and guests)
const UserLayout = () => {
  return (
    <div className="app-layout">
      <UserNavbar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<UserHome />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatbotLogo />
      </main>
      <Footer />
    </div>
  );
};

// 2. Admin Layout (FIXED: Removed the infinite looping redirect rule)
// AdminLayout.jsx
const AdminLayout = () => {
  return (
    <div className="admin-panel">
      <AdminNavbar />
      <hr />
      {/* ✅ Change here: make this a horizontal flex container */}
      <div className="admin-main">
        <AdminSidebar />
        <div className="admin-page">
          <Routes>
            <Route path="add" element={<AdminAdd />} />
            <Route path="list" element={<AdminList />} />
            <Route path="orders" element={<AdminOrders />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};




// 3. Main Router Logic
const AppRouter = () => {
  const { loggedIn, userRole } = useContext(StoreContext);
  const loading = loggedIn && userRole === null;

  if (loading) {
    return <div className="loading-screen">Loading...</div>; 
  }
  
  // If user is logged in AND is an admin, set up Admin routing
  if (loggedIn && userRole === 'admin') {
  return (
    <div className="admin-wrapper">
      <Routes>
        {/* Nested routes inside AdminLayout */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="add" element={<AdminAdd />} />
          <Route path="list" element={<AdminList />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route index element={<Navigate to="add" replace />} />
        </Route>

        {/* Redirect root paths */}
        <Route path="/" element={<Navigate to="/admin/add" replace />} />
        <Route path="*" element={<Navigate to="/admin/add" replace />} />
      </Routes>
    </div>
  );
}


  // All other traffic (unauthenticated or regular users) defaults to UserLayout
  return (
    <Routes>
      {/* Block unauthorized admin access by redirecting to login */}
      <Route path="/admin/*" element={<Navigate to="/login" replace />} /> 
      {/* UserLayout handles all public and user-authenticated paths */}
      <Route path="/*" element={<UserLayout />} />
    </Routes>
  );
};


const App = () => {
  return (
    <>
      <ToastContainer />
      <AppRouter />
    </>
  );
};

export default App;
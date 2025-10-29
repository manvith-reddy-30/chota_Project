// client/src/main.jsx (FINAL CODE)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
// Correct relative path to the unified StoreContext
import StoreContextProvider from './context/StoreContext.jsx' 
// NOTE: Ensure you install react-toastify and import its CSS here or in App.jsx's parent.
import 'react-toastify/dist/ReactToastify.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Provides global state/context (including user role and URL) */}
      <StoreContextProvider>
        {/* The main application router that switches between User/Admin layouts */}
        <App />
      </StoreContextProvider>
    </BrowserRouter>
  </React.StrictMode>
)
import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(StoreContext)
  const location = useLocation()

  // If not authenticated, redirect to /login
  // and save the location they were trying to go to.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Otherwise, render the protected component(s)
  return children
}

export default ProtectedRoute

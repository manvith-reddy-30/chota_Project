import React from 'react'
import { storecontext } from '../../context/storecontext';
import axios from 'axios'
import './verify.css'
import { useContext,useEffect } from 'react';
import { useNavigate,useSearchParams } from 'react-router-dom';

const Verify = () => {
  const { url } = useContext(storecontext)
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get("success")
  const orderId = searchParams.get("orderId")

  const navigate = useNavigate();

  const verifyPayment = async () => {
    const response = await axios.post(url + "/api/order/verify", { success, orderId });
    if (response.data.success) {
      navigate("/myorders");
    }
    else {
      navigate("/")
    }
  }

  useEffect(() => {
    verifyPayment();
  }, [])

  return (
    <div className='verify'>
      <div className="spinner"></div>
    </div>
  )
}

export default Verify

// client/src/pages/Verify/verify.jsx (FINAL MODIFIED)

import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
// Correct path for StoreContext (one level up)
import { StoreContext } from '../../context/StoreContext';
import './verify.css';
import { toast } from 'react-toastify'; // NEW: Import Toastify

const Verify = () => {
  const { url } = useContext(StoreContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyOrder = async () => {
      const successParam = searchParams.get('success') === 'true';
      const orderId = searchParams.get('orderId');

      // Basic check for required parameters
      if (!orderId) {
          toast.error("Invalid verification link.");
          navigate('/', { replace: true });
          return;
      }

      try {
        const response = await axios.post(
          `${url}/api/order/verify`,
          { success: successParam, orderId },
          { withCredentials: true }
        );

        if (response.data.success) {
          // ADDED TOAST
          toast.success("Payment verified and order placed successfully!"); 
          navigate('/myorders', { replace: true });
        } else {
          // REPLACED console.error and ADDED TOAST
          console.error('Payment verification failed:', response.data);
          toast.error(response.data.message || "Payment verification failed.");
          navigate('/', { replace: true });
        }
      } catch (err) {
        // REPLACED console.error and ADDED TOAST
        console.error('Error verifying payment:', err);
        toast.error("A network error occurred during verification.");
        navigate('/', { replace: true });
      }
    };
    
    verifyOrder();
  }, [navigate, searchParams, url]);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p>Verifying your payment, please wait...</p>
    </div>
  );
};

export default Verify;
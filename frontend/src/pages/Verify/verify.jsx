import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './verify.css';

const Verify = () => {
  const { url } = useContext(StoreContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const successParam = searchParams.get('success') === 'true';
      const orderId = searchParams.get('orderId');

      try {
        const response = await axios.post(
          `${url}/api/order/verify`,
          { success: successParam, orderId },
          { withCredentials: true } // Ensures cookies are sent
        );

        if (response.data.success) {
          navigate('/myorders', { replace: true });
        } else {
          console.error('Payment verification failed:', response.data);
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        navigate('/', { replace: true });
      }
    })();
  }, [navigate, searchParams, url]);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p>Verifying your payment, please wait...</p>
    </div>
  );
};

export default Verify;

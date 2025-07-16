// src/pages/Verify/verify.jsx
import React, { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { StoreContext } from '../../context/StoreContext'
import './verify.css'

const Verify = () => {
  const { url } = useContext(StoreContext)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyPayment = async () => {
      // 1) Parse success as a boolean
      const successParam = searchParams.get('success') === 'true'
      const orderId = searchParams.get('orderId')

      try {
        // 2) Call backend
        const response = await axios.post(
          `${url}/api/order/verify`,
          { success: successParam, orderId }
        )

        // 3) Navigate based on backend result
        if (response.data.success) {
          navigate('/myorders', { replace: true })
        } else {
          console.error('Payment verification failed:', response.data)
          navigate('/', { replace: true })
        }
      } catch (err) {
        console.error('Error verifying payment:', err)
        navigate('/', { replace: true })
      }
    }

    verifyPayment()
  // we only want to run this once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="verify">
      <div className="spinner"></div>
    </div>
  )
}

export default Verify

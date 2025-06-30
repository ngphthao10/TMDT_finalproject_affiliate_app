import React, { useEffect } from 'react';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Verify = () => {
  const { navigate, setCartItems, backendUrl, token } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success'); // Dùng cho Stripe
  const orderId = searchParams.get('orderId'); // Dùng cho MoMo
  const resultCode = searchParams.get('resultCode'); // Dùng cho MoMo

  const verifyPayment = async () => {
    try {
      if (!token) {
        toast.error('Please login to verify payment');
        navigate('/login');
        return;
      }

      let response;
console.log("orderID : ",orderId);
      // Xử lý MoMo
      if (resultCode !== null) {
        const address = JSON.parse(localStorage.getItem('momo_address') || '{}');
        const amount = parseFloat(localStorage.getItem('momo_amount') || '0');

        if (!orderId) {
          toast.error('Invalid MoMo payment verification request: Missing orderId');
          navigate('/cart');
          return;
        }

        if (!address.recipient_name || !address.phone_num || !address.address) {
          toast.error('Invalid address data');
          navigate('/cart');
          return;
        }

        if (!amount) {
          toast.error('Invalid amount: Missing amount in localStorage');
          navigate('/cart');
          return;
        }

        console.log('Verifying MoMo payment:', { orderId, address, amount });

        response = await axios.post(
          `${backendUrl}/api/order1/verifyMomo`,
          { orderId, address, amount },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setCartItems({});
          localStorage.removeItem('momo_address');
          localStorage.removeItem('momo_amount');
          toast.success('Payment successful!');
          navigate('/orders');
        } else {
          toast.error('Payment failed: ' + response.data.message);
          navigate('/cart');
        }
      }
      // Xử lý Stripe
      else if (success !== null) {
        const sessionId = localStorage.getItem('stripe_session_id');
        const address = JSON.parse(localStorage.getItem('order_address') || '{}');
        const amount = parseFloat(localStorage.getItem('order_amount') || '0');

        if (!sessionId) {
          toast.error('Invalid Stripe payment verification request: Missing sessionId');
          navigate('/cart');
          return;
        }

        if (!address.recipient_name || !address.phone_num || !address.address) {
          toast.error('Invalid address data');
          navigate('/cart');
          return;
        }

        if (!amount) {
          toast.error('Invalid amount: Missing amount in localStorage');
          navigate('/cart');
          return;
        }

        console.log('Verifying Stripe payment:', { sessionId, success, amount });

        response = await axios.post(
          `${backendUrl}/api/order1/verifyStripe`,
          { sessionId, success, address, amount },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setCartItems({});
          localStorage.removeItem('stripe_session_id');
          localStorage.removeItem('order_address');
          localStorage.removeItem('order_amount');
          toast.success('Payment successful!');
          navigate('/orders');
        } else {
          toast.error('Payment failed: ' + response.data.message);
          navigate('/cart');
        }
      } else {
        toast.error('Invalid payment verification request');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error(error.response?.data?.message || error.message);
      navigate('/cart');
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Verifying Payment...</h2>
        <p className="text-gray-500">Please wait while we verify your payment.</p>
      </div>
    </div>
  );
};

export default Verify;
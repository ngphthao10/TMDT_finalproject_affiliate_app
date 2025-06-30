import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// Thêm logo MoMo (giả định bạn có file assets.momo_logo)
import momoLogo from '../assets/momo_logo.png'; // Thay bằng đường dẫn thực tế đến logo MoMo

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);

  // Cập nhật formData với các trường mới
  const [formData, setFormData] = useState({
    fullName: '',
    phone_num: '',
    address: '',
    city: '',
    country: '',
    note: '',
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find((product) => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      let orderData = {
        address: {
          recipient_name: formData.fullName, // Ánh xạ fullName sang recipient_name
          phone_num: formData.phone_num,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          note: formData.note,
        },
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      switch (method) {
        case 'cod':
          const response = await axios.post(backendUrl + '/api/order1/place', orderData, { headers: { token }, withCredentials: true });
          if (response.data.success) {
            setCartItems({});
            toast.success('Order successfully')
            navigate('/orders');
          } else {
            toast.error(response.data.message);
          }
          break;

        case 'stripe':
          const responseStripe = await axios.post(backendUrl + '/api/order1/stripe', orderData, { headers: { token } });
          if (responseStripe.data.success) {
            const { session_url, session_id } = responseStripe.data;
            // Lưu session_id, address, và amount vào localStorage
            localStorage.setItem('stripe_session_id', session_id);
            localStorage.setItem('order_address', JSON.stringify(orderData.address));
            localStorage.setItem('order_amount', orderData.amount.toString());
            console.log('Session ID:', session_id);
            console.log('Redirecting to:', session_url);
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }
          break;

        case 'momo':
          console.log('Order data sent to MoMo:', orderData);
          const responseMomo = await axios.post(backendUrl + '/api/order1/momo', orderData, { headers: { token } });

          if (responseMomo.data.success) {
            const { paymentUrl } = responseMomo.data; // Giả định backend trả về paymentUrl
            localStorage.setItem('momo_address', JSON.stringify(orderData.address));
            localStorage.setItem('momo_amount', orderData.amount.toString());
            window.location.replace(paymentUrl); // Chuyển hướng đến trang thanh toán MoMo
          } else {
            toast.error(responseMomo.data.message);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* ------------- Left Side ---------------- */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name='fullName'
          value={formData.fullName}
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type='text'
          placeholder='Full name'
        />
        <input
          required
          onChange={onChangeHandler}
          name='phone_num'
          value={formData.phone_num}
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type='tel'
          placeholder='Phone number'
        />
        <input
          required
          onChange={onChangeHandler}
          name='address'
          value={formData.address}
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type='text'
          placeholder='Address'
        />
        <div className='flex gap-3'>
          <input
            required
            onChange={onChangeHandler}
            name='city'
            value={formData.city}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='City'
          />
          <input
            required
            onChange={onChangeHandler}
            name='country'
            value={formData.country}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='Country'
          />
        </div>
        <textarea
          onChange={onChangeHandler}
          name='note'
          value={formData.note}
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          placeholder='Note (optional)'
          rows='3'
        />
      </div>

      {/* ------------- Right Side ------------------ */}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>

        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'} />
          {/* --------------- Payment Method Selection ------------- */}
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
              <img className='h-5 mx-4' src={assets.stripe_logo} alt='' />
            </div>
            <div onClick={() => setMethod('momo')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'momo' ? 'bg-green-400' : ''}`}></p>
              <img className='h-5 mx-4' src={momoLogo} alt='MoMo' /> {/* Thêm logo MoMo */}
            </div>
            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>

          <div className='w-full text-end mt-8'>
            <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
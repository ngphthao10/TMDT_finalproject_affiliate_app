import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/users/register', {
          first_name: firstName,
          last_name: lastName,
          phone_num: phoneNum,
          email,
          password,
        });
        if (response.data.success) {
          toast.success('Registration successful! Please login.');
          // Lưu user_id vào localStorage
          localStorage.setItem('user_id', response.data.user.id);
          // Chuyển sang trạng thái Login sau khi đăng ký thành công
          setCurrentState('Login');
          // Xóa các giá trị trong form
          setFirstName('');
          setLastName('');
          setPhoneNum('');
          setEmail('');
          setPassword('');
        } else {
          toast.error(response.data.message);
        }
      } else {
        console.log('BACKEND URL:', backendUrl);
        console.log('Login payload:', { email, password });
        const response = await axios.post(backendUrl + '/api/users/login', { email, password });
        console.log(response);

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          // Lưu user_id vào localStorage
          localStorage.setItem('user_id', response.data.user.id);
          toast.success('Login successfully');
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>
      {currentState === 'Sign Up' && (
        <>
          <input
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            type="text"
            className='w-full px-3 py-2 border border-gray-800'
            placeholder='First Name'
            required
          />
          <input
            onChange={(e) => setLastName(e.target.value)}
            value={lastName}
            type="text"
            className='w-full px-3 py-2 border border-gray-800'
            placeholder='Last Name'
            required
          />
          <input
            onChange={(e) => setPhoneNum(e.target.value)}
            value={phoneNum}
            type="tel"
            className='w-full px-3 py-2 border border-gray-800'
            placeholder='Phone Number'
            required
          />
        </>
      )}
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Email'
        required
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Password'
        required
      />
      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className='cursor-pointer'>Forgot your password?</p>
        {currentState === 'Login' ? (
          <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer'>
            Create account
          </p>
        ) : (
          <p onClick={() => setCurrentState('Login')} className='cursor-pointer'>
            Login Here
          </p>
        )}
      </div>
      <button className='bg-black text-white font-light px-8 py-2 mt-4'>
        {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  );
};

export default Login;
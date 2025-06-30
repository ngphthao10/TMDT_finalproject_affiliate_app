import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProductManagement from './pages/ProductManagement'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomerManagement from './pages/CustomerManagement'
import KOLManagement from './pages/KOLManagement'
import OrderDashboard from './pages/OrderDashboard'
import Dashboard from './pages/Dashboard'
import ReviewManagement from './pages/ReviewManagement'

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '$'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer position="top-right" autoClose={3000} />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[82%] mx-auto my-8 text-gray-600 text-base px-8'>
              <Routes>
                <Route path='/products' element={<ProductManagement token={token} />} />
                <Route path='/customers' element={<CustomerManagement token={token} />} />
                <Route path='/kols' element={<KOLManagement token={token} />} />
                <Route path='/orders' element={<OrderDashboard token={token} />} />
                <Route path='/dashboard' element={<Dashboard token={token} />} />
                <Route path='/reviews' element={<ReviewManagement token={token} />} />
                <Route path='/' element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default App
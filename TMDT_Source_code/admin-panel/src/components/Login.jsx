import axios from 'axios'
import React, { useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Login = ({ setToken }) => {
    const [authType, setAuthType] = useState('login') // 'login' or 'register'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        try {
            const response = await axios.post(backendUrl + '/api/users/admin', { email, password })
            if (response.data.success) {
                setToken(response.data.token)
                toast.success('Login successful!')
                window.location.href = '/dashboard';
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleRegister = async () => {
        try {
            const response = await axios.post(backendUrl + '/api/users/register', {
                name,
                email,
                password
            })

            if (response.data.success) {
                setToken(response.data.token)
                toast.success('Registration successful!')
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (authType === 'login') {
                await handleLogin()
            } else {
                await handleRegister()
            }
        } finally {
            setIsLoading(false)
        }
    }

    const toggleAuthType = () => {
        setAuthType(authType === 'login' ? 'register' : 'login')
        setEmail('')
        setPassword('')
        setName('')
    }

    return (
        <div className='min-h-screen flex items-center justify-center w-full'>
            <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
                <h1 className='text-2xl font-bold mb-4'>
                    {authType === 'login' ? 'Admin Panel' : 'Create Account'}
                </h1>
                <form onSubmit={onSubmitHandler}>
                    {authType === 'register' && (
                        <div className='mb-3 min-w-72'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Name</p>
                            <input
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
                                type="text"
                                placeholder='Your name'
                                required
                            />
                        </div>
                    )}
                    <div className='mb-3 min-w-72'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
                            type="email"
                            placeholder='your@email.com'
                            required
                        />
                    </div>
                    <div className='mb-3 min-w-72'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
                            type="password"
                            placeholder='Enter your password'
                            required
                        />
                    </div>
                    {/* <div className='flex justify-between items-center mb-4'>
                        <button
                            type="button"
                            onClick={toggleAuthType}
                            className='text-sm text-gray-600 hover:underline'
                        >
                            {authType === 'login'
                                ? 'Need an account? Register'
                                : 'Already have an account? Login'}
                        </button>
                    </div> */}
                    <button
                        className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black disabled:bg-gray-400'
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? 'Please wait...'
                            : authType === 'login' ? 'Login' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
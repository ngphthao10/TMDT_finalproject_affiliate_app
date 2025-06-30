import { useState } from 'react';
import kolAuthService from '../services/kolAuthService';
import { toast } from 'react-toastify';

const InfluencerLogin = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await kolAuthService.login(formData);

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('Login successful!');
                onLogin(data);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center w-full'>
            <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
                <h1 className='text-2xl font-bold mb-4 text-left'>Influencer Panel</h1>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3 min-w-72'>
                        <p className='text-sm font-medium text-gray-700 mb-2 text-left'>Email Address</p>
                        <input
                            name="identifier"
                            onChange={handleChange}
                            value={formData.identifier}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
                            type="text"
                            placeholder='Username, Email or Phone'
                            required
                        />
                    </div>
                    <div className='mb-3 min-w-72'>
                        <p className='text-sm font-medium text-gray-700 mb-2 text-left'>Password</p>
                        <input
                            name="password"
                            onChange={handleChange}
                            value={formData.password}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
                            type="password"
                            placeholder='Enter your password'
                            required
                        />
                    </div>
                    <button
                        className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black disabled:bg-gray-400'
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Please wait...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InfluencerLogin;
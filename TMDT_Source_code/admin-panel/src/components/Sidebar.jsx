import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiBox, FiShoppingBag, FiPackage, FiUsers, FiSettings, FiMessageSquare } from 'react-icons/fi'
import { TbUserStar } from "react-icons/tb";
import { AiOutlineDashboard } from "react-icons/ai";

const Sidebar = () => {
    return (
        <div className='w-[18%] min-h-screen bg-white border-r'>
            <div className='flex flex-col gap-2 py-6 px-4'>
                <NavLink
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                    to="/dashboard"
                >
                    <AiOutlineDashboard className="w-5 h-5" />
                    <p className='hidden md:block'>Dashboard</p>
                </NavLink>
                <NavLink
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                    to="/products"
                >
                    <FiBox className="w-5 h-5" />
                    <p className='hidden md:block'>Products</p>
                </NavLink>

                <NavLink
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                    to="/customers"
                >
                    <FiUsers className="w-5 h-5" />
                    <p className='hidden md:block'>Customers</p>
                </NavLink>

                <NavLink
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                    to="/kols"
                >
                    <TbUserStar className="w-5 h-5" />
                    <p className='hidden md:block'>Influencers</p>
                </NavLink>

                <NavLink
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                    to="/orders"
                >
                    <FiShoppingBag className="w-5 h-5" />
                    <p className='hidden md:block'>Orders</p>
                </NavLink>


                <NavLink
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                    to="/reviews"
                >
                    <FiMessageSquare className="w-5 h-5" />
                    <p className='hidden md:block'>Reviews</p>
                </NavLink>
            </div>
        </div>
    )
}

export default Sidebar
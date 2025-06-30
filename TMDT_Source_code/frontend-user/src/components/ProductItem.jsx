import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets';
const backendUrl = import.meta.env.VITE_BACKEND_URL
console.log(backendUrl);
const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);
  // Chuyển "mens_tshirt.jpg" thành "mens_tshirt"
  const imageSrc = `${backendUrl}${image}`;
  return (
    <Link onClick={() => scrollTo(0, 0)} className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className=' overflow-hidden'>
        <img crossOrigin='anonymous' className='hover:scale-110 transition ease-in-out w-[239px] h-[276px]' src={imageSrc} alt="name" />
      </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <p className=' text-sm font-medium'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem

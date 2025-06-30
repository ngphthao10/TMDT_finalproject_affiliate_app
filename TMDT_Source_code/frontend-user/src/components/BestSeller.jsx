import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {

  const { bestSeller: bestSellerData } = useContext(ShopContext); // Thay latestCollection thành bestSeller
  const [bestSeller, setBestSeller] = useState([]);

    useEffect(()=>{
      setBestSeller(bestSellerData.slice(0,10));
    },[bestSellerData])

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'SẢN PHẨM'} text2={'BÁN CHẠY NHẤT'}/>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
        Những sản phẩm được yêu thích và chọn mua nhiều nhất bởi khách hàng
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
            bestSeller.map((item,index)=>(
              <ProductItem key={index} id={item.id} image={item.small_image} name={item.name} price={item.price.min} />
            ))
        }
      </div>
    </div>
  )
}

export default BestSeller

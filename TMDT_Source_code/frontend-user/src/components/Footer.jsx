import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="" />
            <p className='w-full md:w-2/3 text-gray-600'>
            Forever là thương hiệu thời trang hiện đại, luôn đổi mới trong thiết kế để đem đến trải nghiệm tuyệt vời cho khách hàng. Chúng tôi cam kết chất lượng và dịch vụ tốt nhất.
            </p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>CÔNG TY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>Trang chủ</li>
                <li>Giới thiệu</li>
                <li>Giao hàng</li>
                <li>Chính sách bảo mật</li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>LIÊN HỆ</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+1-212-456-7890</li>
                <li>contact@foreveryou.com</li>
            </ul>
        </div>

      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>NHÓM 4- PHÁT TRIỂN HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ</p>
        </div>

    </div>
  )
}

export default Footer

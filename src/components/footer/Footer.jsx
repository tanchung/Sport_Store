import React from 'react'
import { FaFacebookF, FaPhone, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa'
import { SiHappycow } from "react-icons/si";
import { IoMdMail } from "react-icons/io";
import { MdOutlineCategory, MdInfo, MdSupportAgent } from "react-icons/md";
import { IoMdFootball } from "react-icons/io";
import { FaTruckFast } from "react-icons/fa6";
import GHN from '/src/assets/GHN.webp'
import EMS from '/src/assets/ems.png'
import zalo from '/src/assets/zalo.webp'
import face from '/src/assets/facebook.png'
const Footer = () => {
  return (
    <footer className='relative overflow-hidden bg-gray-800 text-white'>
      {/* Icon HappyCow - góc dưới bên phải, kích thước lớn */}
      <div className='absolute -bottom-8 -left-20 opacity-30'>
        <IoMdFootball className="text-[180px] md:text-[250px] lg:text-[320px] text-blue-200" />
      </div>

      {/* Main content */}
      <div className='container mx-auto py-4 px-4 relative z-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10'>
          {/* Danh mục hàng */}
          <div className=' p-6 rounded-lg  '>
            <div className='flex items-center mb-5'>
              <MdOutlineCategory className='text-3xl text-blue-400 mr-3' />
              <h3 className='text-xl font-bold text-blue-300'>
                Danh mục hàng
              </h3>
            </div>
            <ul className='space-y-3'>
              {['Giày sân nhân tạo', 'Giày cỏ tự nhiên', 'Giày Futsal', 'Phụ kiện'].map((item, index) => (
                <li key={index}>
                  <a href='#' className='text-gray-300 hover:text-blue-300 flex items-center'>
                    <span className='w-1.5 h-1.5 bg-blue-400 rounded-full mr-2'></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Thông tin */}
          <div className=' p-6 rounded-lg  '>
            <div className='flex items-center mb-5'>
              <MdInfo className='text-3xl text-blue-400 mr-3' />
              <h3 className='text-xl font-bold text-blue-300'>
                Thông tin
              </h3>
            </div>
            <ul className='space-y-3'>
              {[
                { name: 'Hướng dẫn mua hàng', link: '/huong-dan-mua-hang' },
                { name: 'Hình thức thanh toán', link: '/hinh-thuc-thanh-toan' },
                { name: 'Chính sách vận chuyển', link: '/chinh-sach-van-chuyen' },
                { name: 'Chính sách trả hàng', link: '/chinh-sach-doi-tra' }
              ].map((item, index) => (
                <li key={index}>
                  <a href={item.link} className='text-gray-300 hover:text-blue-300 flex items-center'>
                    <span className='w-1.5 h-1.5 bg-blue-400 rounded-full mr-2'></span>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ khách hàng */}
          <div className=' p-6 rounded-lg '>
            <div className='flex items-center mb-5'>
              <MdSupportAgent className='text-3xl text-blue-400 mr-3' />
              <h3 className='text-xl font-bold text-blue-300'>
                Hỗ trợ khách hàng
              </h3>
            </div>
            <div className='space-y-4'>
              <p className='flex items-center text-gray-300'>
                <FaPhone className='mr-3 text-blue-400' />
                Tổng đài:{' '}
                <span className='font-semibold text-yellow-300 ml-2'>1900 1234</span>
              </p>
              <p className='flex items-center text-gray-300'>
                <FaShieldAlt className='mr-3 text-blue-400' />
                Bảo hành:{' '}
                <span className='font-semibold text-yellow-300 ml-2'>1900 4321</span>
              </p>

              <h4 className='text-gray-200 font-medium mt-5 mb-3'>Kết nối với chúng tôi</h4>
              <div className='flex items-center gap-4'>
                <a
                  href='https://zalo.me/0977769904'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-blue-500/20 p-2 rounded-full'
                >
                  <img src={zalo} className='h-6 w-6' alt="Zalo" />
                </a>
                <a
                  href='https://facebook.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-blue-500/20 p-2 rounded-full'
                >
                  <img src={face} className='h-6 w-6' alt="Facebook" />
                </a>
                <a
                  href='mailto:info@milkstore.com'
                  className='bg-blue-500/20 p-2 rounded-full'
                >
                  <IoMdMail className='h-6 w-6 text-gray-300' />
                </a>
                <a
                  href='https://www.google.com/maps/place/129%2F1T+L%E1%BA%A1c+Long+Qu%C3%A2n,+Ph%C6%B0%E1%BB%9Dng+1,+Qu%E1%BA%ADn+11,+H%E1%BB%93+Ch%C3%AD+Minh,+Vietnam/@10.7579894,106.6353088,779m/data=!3m2!1e3!4b1!4m6!3m5!1s0x31752e84e25dc869:0xc0177203312302a6!8m2!3d10.7579841!4d106.6378837!16s%2Fg%2F11j2vw78dy?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoASAFQAw%3D%3D'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-blue-500/20 p-2 rounded-full'
                >
                  <FaMapMarkerAlt className='h-6 w-6 text-gray-300' />
                </a>
              </div>
            </div>
          </div>

          {/* Đơn vị vận chuyển */}
          <div className=' p-6 rounded-lg '>
            <div className='flex items-center mb-5'>
              <FaTruckFast className='text-3xl text-blue-400 mr-3' />
              <h3 className='text-xl font-bold text-blue-300'>
                Đơn vị vận chuyển
              </h3>
            </div>
            <div className='flex flex-col '>
              <div className=' rounded-lg flex items-center justify-center'>
                <img src={GHN} alt='GHN' className='h-17 w-8/10' />
              </div>
              <div className=' rounded-lg flex items-center justify-center'>
                <img src={EMS} alt='EMS' className='h-17 w-8/10' />
              </div>
            </div>
          </div>
        </div>
      </div>

   
    </footer>
  )
}

export default Footer
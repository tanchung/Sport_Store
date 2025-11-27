import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { headerClass } from './data';
import { FiShoppingCart, FiUser, FiLogOut, FiInfo, FiClock, FiTag } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { message } from 'antd';
import { useCartCount } from '@/hooks/useCart';
import logo from '/src/assets/logogiay.png'
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [countItems] = useCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const isActive = path => location.pathname === path;

  const getUserDisplayName = () => {
    if (!currentUser || !currentUser.data) return '';

    const { firstName, middleName, surname } = currentUser.data;
    return `${surname} ${middleName} ${firstName}`;
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        message.success('Đăng xuất thành công!');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      message.error('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
    }
    finally {
      setShowUserMenu(false);
    }
  };

  return (
    <>
      <header
        className={`${headerClass.header} ${isScrolled ? 'py-3 shadow-lg' : 'py-5 shadow-sm'} relative z-20 transition-all duration-300`}
      >
        <div className='container mx-auto flex items-center justify-between'>
          {/* logo */}
          <Link to='/' className='flex items-center'>
            <div className='relative'>
              <span className='absolute -top-4 -left-1 text-4xl'><img src={logo} className='h-16 w-18' alt="Zalo" /></span>
              <h1 className='ml-16 text-2xl font-extrabold tracking-wide text-blue-500 sm:text-3xl'>
                VNHI<span className='text-blue-700'>STORE</span>
                <br />
              </h1>
            </div>
          </Link>

          {/* navigation */}
          <nav className='flex items-center space-x-8'>
            <Link
              to='/trang-chu'
              className={`${headerClass.nav} ${isActive('/') ? 'font-semibold text-blue-600' : ''}`}
            >
              Trang chủ
            </Link>
            <Link
              to='/san-pham'
              className={`${headerClass.nav} ${isActive('/product') ? 'font-semibold text-blue-600' : ''}`}
            >
              Sản phẩm
            </Link>
            <Link
              to='/ve-chung-toi'
              className={`${headerClass.nav} ${isActive('/about') ? 'font-semibold text-blue-600' : ''}`}
            >
              Về chúng tôi
            </Link>
            <Link
              to='/lien-he'
              className={`${headerClass.nav} ${isActive('/contact') ? 'font-semibold text-blue-600' : ''}`}
            >
              Liên hệ
            </Link>
          </nav>

          {/* buttons */}
          <div className='flex items-center space-x-4'>
            {/* User profile button */}
            <div className="user-menu-container relative">
              {isAuthenticated ? (
                <button
                  className='flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors'
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                    {currentUser?.data?.avatar ? (
                      <img
                        src={currentUser.data.avatar}
                        alt="User avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className='h-5 w-5 text-blue-600' />
                    )}
                  </div>
                  <span className='hidden md:block font-medium'>
                    {getUserDisplayName()}
                  </span>
                </button>
              ) : (
                <Link
                  to='/dang-nhap'
                  className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-700 transition-all hover:bg-gray-100'
                >
                  <FiUser className='h-5 w-5' />
                </Link>
              )}

              {/* User dropdown menu */}
              {showUserMenu && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-2 z-30">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.data?.email}</p>
                  </div>
                  <Link
                    to="/thong-tin-ca-nhan"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiInfo className="mr-2 h-4 w-4" />
                    Thông tin cá nhân
                  </Link>
                  <Link
                    to="/don-hang"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiClock className="mr-2 h-4 w-4" />
                    Đơn hàng
                  </Link>
                  <Link
                    to="/ma-giam-gia"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiTag className="mr-2 h-4 w-4" />
                    Mã giảm giá
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Shopping cart button - only display when authenticated */}
            {isAuthenticated && (
              <button className={`${headerClass.button} group relative flex cursor-pointer items-center gap-2 p-2 rounded-md  transition-colors`}>
                <Link to='/gio-hang' className="flex items-center">
                  <FiShoppingCart className="h-5 w-5 text-white " />
                  {countItems > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white ring-2 ring-white">
                      {countItems}
                    </span>
                  )}
                </Link>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';

import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Home from './pages/Home/Home';
import Contact from './pages/Contact/Contact';
import Products from './pages/Products/Products';
import ProductsDemo from './pages/Products/ProductsDemo';
import PaginationTest from './pages/Products/Components/PaginationTest';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import About from './pages/About/About';
import Payment from './pages/Payment/Payment';
import Checkout from './pages/Order/CheckOut';
import Cart from './pages/Cart/Cart';
import TransferPolicy from './components/footer/TransferPolicy';
import ReturnPolicy from './components/footer/ReturnPolicy';
import PurchaseGuide from './pages/Guide/PurchaseGuide';
import NotFound from './pages/NotFound/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProfilePage from './pages/Profile/ProfilePage';
import Order from './pages/Order/Order';
import Voucher from '@/pages/Voucher/Voucher';
import CollectionDetail from './pages/Collection/CollectionDetail';
import PaymentMethods from './pages/Guide/PaymentMethods';
import MarketingSubscription from '@/pages/Auth/MarketingSubscription/MarketingSubscription';

// --- Protected Route ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!isAuthenticated) return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  return children;
};

// --- Auth Route ---
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  return children;
};

// =================================================================
// === HÀM HỖ TRỢ: XÓA SẠCH COOKIE/STORAGE CỦA TAWK.TO ===
// =================================================================
const clearTawkData = () => {
  try {
    // 1. Xóa LocalStorage và SessionStorage
    const storageTypes = ['localStorage', 'sessionStorage'];
    storageTypes.forEach(type => {
      const storage = window[type];
      Object.keys(storage).forEach(key => {
        // Tawk thường dùng key bắt đầu bằng 'tawk' hoặc 'twk'
        if (key.toLowerCase().includes('tawk') || key.toLowerCase().includes('twk')) {
          storage.removeItem(key);
        }
      });
    });

    // 2. Xóa Cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      if (name.toLowerCase().includes('tawk') || name.toLowerCase().includes('twk')) {
        // Xóa bằng cách set ngày hết hạn về quá khứ
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      }
    }
  } catch (e) {
    console.error("Lỗi khi xóa dữ liệu Tawk:", e);
  }
};

// --- Layout ---
const Layout = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth(); // Lấy loading từ Context thật
  const tawkRef = useRef();
  
  const hideHeaderRoutes = ['/dang-nhap', '/dang-ky', '/quen-mat-khau', '/reset-password', '/not-found'];
  const [widgetKey, setWidgetKey] = useState(Date.now());
  const [visitorId, setVisitorId] = useState('');

  // --- LOGIC QUAN TRỌNG: XỬ LÝ TRẠNG THÁI USER/GUEST ---
  useEffect(() => {
    // 1. Nếu đang loading (đang check token, gọi API user info...) -> Dừng lại, không làm gì cả.
    // Điều này ngăn chặn việc xóa nhầm cookie khi user nhấn F5.
    if (loading) return;

    if (user) {
      // === TRƯỜNG HỢP: USER ĐÃ ĐĂNG NHẬP ===
      setVisitorId(user._id || user.id);
      // KHÔNG đổi widgetKey -> Giữ nguyên session chat hiện tại
    } else {
      // === TRƯỜNG HỢP: KHÁCH (GUEST) ===
      
      // Xóa sạch dữ liệu cũ để Tawk quên phiên chat trước đó
      clearTawkData();

      // Tạo ID mới cho khách
      const newVisitorId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setVisitorId(newVisitorId);
      
      // Đổi widgetKey -> Buộc Component Tawk render lại từ đầu với ID mới
      setWidgetKey(Date.now());
    }
  }, [user, loading]);

  // Set thông tin khi Widget load xong
  const handleOnLoad = useCallback(() => {
    if (!tawkRef.current) return;
    
    if (user) {
      tawkRef.current.setAttributes({
        name: user.fullName || user.name || "Khách hàng",
        email: user.email,
        id: visitorId,
        phone: user.phone || "",
        hash: user.hash // Nếu bạn có dùng Secure Mode thì truyền hash vào đây
      }, (error) => {});
    } else {
      tawkRef.current.setAttributes({
        name: 'Khách tham quan',
        email: '',
        id: visitorId,
        phone: ''
      }, (error) => {});
    }
  }, [user, visitorId]);

  const shouldShowChat = () => {
    const path = location.pathname;
    const allowed = ['/', '/trang-chu', '/san-pham', '/gio-hang', '/thanh-toan', '/lien-he', '/huong-dan-mua-hang', '/chinh-sach-doi-tra', '/bo-suu-tap', '/don-hang'];
    return allowed.some(prefix => path === '/' || path.startsWith(prefix));
  };

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      
      {children}
      
      {/* Chỉ hiển thị Chat khi đã xác định được ID và KHÔNG còn loading */}
      {shouldShowChat() && visitorId && !loading && (
        <TawkMessengerReact
          key={widgetKey}
          propertyId="6924677d735fe1195a9ac98d"
          widgetId="1jar38gnt"
          ref={tawkRef}
          onLoad={handleOnLoad}
        />
      )}
      
      {!hideHeaderRoutes.includes(location.pathname) && <Footer />}
    </>
  );
};

// --- App Routes ---
const AppRoutes = () => (
  <Layout>
    <Routes>
      <Route path='/dang-nhap' element={<AuthRoute><Login /></AuthRoute>} />
      <Route path='/dang-ky' element={<AuthRoute><Register /></AuthRoute>} />
      <Route path='/quen-mat-khau' element={<ForgotPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path="/nhan-tin-quang-cao" element={<MarketingSubscription />} />

      <Route path='/' element={<Home />} />
      <Route path='/trang-chu' element={<Home />} />
      <Route path='/ve-chung-toi' element={<About />} />
      <Route path='/san-pham' element={<Products />} />
      <Route path='/san-pham-demo' element={<ProductsDemo />} />
      <Route path='/pagination-test' element={<PaginationTest />} />
      <Route path='/lien-he' element={<Contact />} />
      <Route path="/san-pham/:id" element={<ProductDetail />} />
      <Route path="/bo-suu-tap/:collectionId" element={<CollectionDetail />} />
      <Route path='/chinh-sach-van-chuyen' element={<TransferPolicy />} />
      <Route path='/huong-dan-mua-hang' element={<PurchaseGuide />} />
      <Route path='/chinh-sach-doi-tra' element={<ReturnPolicy />} />
      <Route path='/hinh-thuc-thanh-toan' element={<PaymentMethods/>}/>
      <Route path='/don-hang' element={<ProtectedRoute><Order /></ProtectedRoute>} />
      <Route path='/thanh-toan' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path='/gio-hang' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path='/xac-nhan-thanh-toan' element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      <Route path='/thong-tin-ca-nhan' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path='/ma-giam-gia' element={<ProtectedRoute><Voucher /></ProtectedRoute>} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  </Layout>
);

// --- App ---
const App = () => (
  <Router>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </Router>
);

export default App;
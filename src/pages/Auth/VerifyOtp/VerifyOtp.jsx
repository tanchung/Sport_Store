import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthService from '../../../services/Auth/AuthServices';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [canResendOtp, setCanResendOtp] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Lấy email và formData từ state navigation
  const { email, formData } = location.state || {};

  // Redirect về trang đăng ký nếu không có dữ liệu
  useEffect(() => {
    if (!email || !formData) {
      message.error('Vui lòng thực hiện lại quá trình đăng ký');
      navigate('/dang-ky');
    }
  }, [email, formData, navigate]);

  // Countdown timer cho resend OTP
  useEffect(() => {
    let timer;
    if (!canResendOtp && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [canResendOtp, resendCountdown]);

  // Gửi lại OTP
  const handleResendOtp = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const response = await AuthService.resendOtp(email);
      
      if (response.success) {
        message.success('Mã OTP đã được gửi lại đến email của bạn!');
        setCanResendOtp(false);
        setResendCountdown(60);
      } else {
        message.error(response.message || 'Không thể gửi lại mã OTP');
      }
    } catch (error) {
      console.error('Lỗi gửi lại OTP:', error);
      message.error('Không thể gửi lại mã OTP, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  // Xác thực OTP
  const handleSubmit = async () => {
    if (otp.length !== 6) {
      message.warning('Vui lòng nhập đủ 6 số');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.verifyOTP(email, otp);
      
      if (result.success) {
        message.success('Xác thực thành công!');
        navigate('/nhan-tin-quang-cao');
      } else {
        message.error(result.message || 'Mã OTP không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi xác thực OTP:', error);
      message.error('Có lỗi xảy ra khi xác thực');
    } finally {
      setLoading(false);
    }
  };

  // Format thời gian countdown
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-10"
            style={{
              width: `${80 + Math.random() * 120}px`,
              height: `${80 + Math.random() * 120}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(20px)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 relative z-10 border border-white/20"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-[#8ecae6] to-[#219ebc] rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Xác thực OTP</h1>
          <p className="text-gray-600">
            Mã xác thực đã được gửi đến<br />
            <strong className="text-[#219ebc]">{email}</strong>
          </p>
        </div>

        <Form onFinish={handleSubmit} className="space-y-6">
          <Form.Item>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã xác thực (6 số)
            </label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Nhập mã OTP"
              className="h-12 text-center text-lg tracking-widest"
              maxLength={6}
              style={{ letterSpacing: '0.5em' }}
              onPressEnter={handleSubmit}
            />
          </Form.Item>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 bg-gradient-to-r from-[#8ecae6] to-[#219ebc] border-none text-lg font-medium rounded-lg hover:from-[#219ebc] hover:to-[#023047] transition-all duration-300"
              disabled={otp.length !== 6}
            >
              Xác thực và hoàn tất đăng ký
            </Button>
          </motion.div>

          {/* Resend OTP section */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Bạn chưa nhận được mã?
            </p>
            
            {!canResendOtp ? (
              <div className="text-sm text-gray-500">
                <p>Gửi lại mã sau: <span className="font-mono font-medium">{formatTime(resendCountdown)}</span></p>
                <p className="text-xs mt-1">Mã OTP có hiệu lực trong 15 phút</p>
              </div>
            ) : (
              <motion.button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-[#219ebc] hover:text-[#023047] font-medium text-sm transition-colors duration-200 disabled:opacity-50"
              >
                Gửi lại mã xác thực
              </motion.button>
            )}
          </div>

          {/* Back to register */}
          <div className="text-center pt-4">
            <motion.button
              type="button"
              onClick={() => navigate('/dang-ky')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
            >
              ← Quay lại trang đăng ký
            </motion.button>
          </div>
        </Form>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;

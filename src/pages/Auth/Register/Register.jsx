import React, { useState } from 'react';
import { Form, message, Steps } from 'antd';
import { useNavigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import OtpModal from './components/OtpModal';
import { useAuth } from '../../../context/AuthContext';
import AuthService from '../../../services/Auth/AuthServices';
import dayjs from 'dayjs';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Gửi lại OTP
  const handleResendOtp = async () => {
    if (!email) {
      message.error('Email không hợp lệ!');
      return false;
    }

    setLoading(true);
    try {
      const response = await AuthService.resendEmail(email);
      
      if (response.data.success) {
        message.success('Mã OTP đã được gửi lại đến email của bạn!');
        
        // Start countdown
        setCanResendOtp(false);
        setResendCountdown(60);
        const timer = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResendOtp(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return true;
      }
      message.error('Không thể gửi lại mã OTP');
      return false;
    } catch (error) {
      console.error('Lỗi gửi OTP:', error);
      message.error(error.response?.data?.message || 'Không thể gửi mã OTP, vui lòng thử lại sau');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = async () => {
    if (!otp || !email) {
      message.error('Vui lòng nhập mã OTP');
      return;
    }

    setLoading(true);
    try {
      const verifyData = {
        email: email,
        verificationCode: otp
      };

      console.log('Verifying OTP:', verifyData);
      const response = await AuthService.verifyCode(verifyData);

      if (response.data.success) {
        message.success('Xác thực thành công! Bạn có thể đăng nhập.');
        setOtpModalVisible(false);
        setCurrentStep(0);
        navigate('/dang-nhap');
      } else {
        message.error('Mã OTP không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi xác thực OTP:', error);
      message.error(error.response?.data?.message || 'Mã OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý submit form - Gọi API signup
  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Mật khẩu không khớp!');
      return;
    }

    if (!values.agreement) {
      message.error('Vui lòng chấp nhận điều khoản sử dụng');
      return;
    }

    setLoading(true);
    try {
      // Format ngày sinh theo định dạng backend yêu cầu
      const formattedDateOfBirth = values.dateOfBirth 
        ? dayjs(values.dateOfBirth).format('YYYY-MM-DD')
        : '2000-01-01';

      const registrationData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        avatar: "https://example.com/images/default-avatar.png",
        permanentAddress: values.address || "",
        gender: values.gender || "nam",
        dateOfBirth: formattedDateOfBirth,
        email: values.email,
        username: values.username,
        password: values.password
      };

      console.log('Đăng ký với data:', registrationData);
      
      // Bước 1: Gọi API signup - Backend tự động gửi OTP
      const response = await AuthService.signup(registrationData);

      if (response.data.success) {
        console.log('User đã tạo (checked=false):', response.data.user);
        message.success('Đăng ký thành công! Mã OTP đã được gửi đến email của bạn.');
        
        // Lưu email và chuyển sang bước OTP
        setEmail(values.email);
        setCurrentStep(1);
        setOtpModalVisible(true);
        
      } else {
        message.error(response.data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      message.error(error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Vui lòng kiểm tra lại thông tin đăng ký');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      {/* Main content */}
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/20 mt-16">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="mb-6">
            <Steps
              current={currentStep}
              items={[
                {
                  title: 'Thông tin',
                  description: 'Nhập thông tin cá nhân',
                },
                {
                  title: 'Xác thực',
                  description: 'Xác thực OTP',
                },
              ]}
            />
          </div>

          <RegisterForm
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            loading={loading}
          />

          {/* Login link */}
          <div className="mt-4 text-center">
            <span className="text-gray-600 text-sm mr-2">Đã có tài khoản?</span>
            <button
              onClick={() => navigate('/dang-nhap')}
              className="text-[#219ebc] hover:text-[#023047] font-medium text-sm transition duration-200"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#8ecae6]/30 to-[#219ebc]/30"></div>
          <img
            src="https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
            alt="Milk bottles"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center p-6">
              <h2 className="text-2xl font-bold mb-2">Sản phẩm sữa tươi ngon</h2>
              <p>Chất lượng cao, giao hàng tận nơi</p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        visible={otpModalVisible}
        onCancel={() => {
          setOtpModalVisible(false);
          setCurrentStep(0);
          setOtp('');
        }}
        onOk={handleVerifyOtp}
        email={email}
        otp={otp}
        setOtp={setOtp}
        canResendOtp={canResendOtp}
        resendCountdown={resendCountdown}
        onResendOtp={handleResendOtp}
        loading={loading}
      />
    </div>
  );
}

export default Register;
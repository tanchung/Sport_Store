import React, { useState, useEffect } from 'react';
import { Form, Input, message, Alert } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [form] = Form.useForm();

    useEffect(() => {
        // Extract token from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const tokenParam = queryParams.get('token');

        if (!tokenParam) {
            setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
            message.error('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
            setTimeout(() => {
                navigate('/dang-nhap');
            }, 3000);
            return;
        }

        console.log("Token extracted from URL:", tokenParam);
        setToken(tokenParam);
    }, [location, navigate]);

    const onFinish = async (values) => {
        if (!token) {
            setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
            message.error('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
            return;
        }

        if (values.newPassword !== values.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            message.error('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setLoading(true);
            setError('');
            console.log("Submitting reset password form with token:", token);

            // Sử dụng trực tiếp axios để debug
            const response = await axios.post(
                'https://milkshop-hpd4e9ewcsbdevfx.eastasia-01.azurewebsites.net/api/Auth/reset-password',
                {
                    token: token,
                    newPassword: values.newPassword,
                    confirmPassword: values.confirmPassword
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Direct API response:", response);

            if (response.data.success) {
                message.success(response.data.message || 'Đặt lại mật khẩu thành công!');
                form.resetFields();
                // Redirect to login page after successful password reset
                setTimeout(() => {
                    navigate('/dang-nhap');
                }, 2000);
            } else {
                setError(response.data.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
                message.error(response.data.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
            }
        } catch (error) {
            console.error('Lỗi đặt lại mật khẩu:', error);
            if (error.response) {
                console.error('Error response:', error.response);
                setError(error.response.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
                message.error(error.response.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
            } else if (error.request) {
                console.error('Error request:', error.request);
                setError('Không nhận được phản hồi từ máy chủ, vui lòng thử lại sau');
                message.error('Không nhận được phản hồi từ máy chủ, vui lòng thử lại sau');
            } else {
                setError('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
                message.error('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
            }
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Lỗi:', errorInfo);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-600 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                    <div className="text-center mb-6">
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-gray-800"
                        >
                            Đặt lại mật khẩu
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-600 mt-2"
                        >
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </motion.p>
                    </div>

                    {error && (
                        <Alert
                            message="Lỗi"
                            description={error}
                            type="error"
                            showIcon
                            className="mb-4"
                        />
                    )}

                    <Form
                        form={form}
                        name="resetPassword"
                        layout="vertical"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        className="flex-1"
                    >
                        <Form.Item
                            label={<span className="text-sm font-medium">Mật khẩu mới</span>}
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                            className="mb-4"
                        >
                            <Input.Password
                                size="middle"
                                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-sm font-medium">Xác nhận mật khẩu</span>}
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                            className="mb-4"
                        >
                            <Input.Password
                                size="middle"
                                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                            />
                        </Form.Item>

                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </span>
                                ) : 'Đặt lại mật khẩu'}
                            </button>
                        </motion.div>
                    </Form>
                </div>

                {/* Right Side - Image */}
                <div className="hidden md:block w-1/2 relative bg-blue-600">
                    <img
                        src={"https://res.cloudinary.com/dwbcqjupj/image/upload/v1745990380/milkstore_qildau.jpg"}
                        alt="Milk Store"
                        className="w-full h-full object-cover opacity-90"
                    />
                </div>
            </motion.div>
        </div>
    );
}

export default ResetPassword;

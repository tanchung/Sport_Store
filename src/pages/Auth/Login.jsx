import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const result = await login(values.username, values.password);

            if (result.success) {
                message.success('Đăng nhập thành công!');
                navigate('/');
            } else {
                message.error(result.error || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            message.error('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Lỗi:', errorInfo);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-600 flex items-center justify-center p-4">
            <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed top-4 left-4 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-blue-600 font-medium px-4 py-2 rounded-lg shadow-lg transition duration-200 flex items-center gap-2 cursor-pointer"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Trang chủ
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
            >
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                    <div className="text-center mb-6">
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-gray-800"
                        >
                            Chào mừng trở lại
                        </motion.h1>
                    </div>

                    <Form
                        name="basic"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        className="flex-1"
                    >
                        <Form.Item
                            label={<span className="text-sm font-medium">Tên người dùng</span>}
                            name="username"
                            rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
                            className="mb-3"
                        >
                            <Input
                                size="middle"
                                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-sm font-medium">Mật khẩu</span>}
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            className="mb-2"
                        >
                            <Input.Password
                                size="middle"
                                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                            />
                        </Form.Item>

                        <div className="flex justify-end mb-4">
                            <motion.button
                                onClick={() => navigate('/quen-mat-khau')}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200"
                            >
                                Quên mật khẩu?
                            </motion.button>
                        </div>

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
                                        Đang đăng nhập...
                                    </span>
                                ) : 'Đăng nhập'}
                            </button>
                        </motion.div>
                    </Form>

                    <div className="mt-5 text-center">
                        <p className="text-gray-600 text-sm mb-2">Chưa có tài khoản?</p>
                        <motion.button
                            onClick={() => navigate('/dang-ky')}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200"
                        >
                            Tạo tài khoản mới
                        </motion.button>
                    </div>
                </div>

                <div className="hidden md:block w-1/2 relative bg-blue-600">
                    <img
                        src={"https://res.cloudinary.com/dwbcqjupj/image/upload/v1755619780/soccerboot_vkuqz5.jpg"}
                        alt="Milk Store"
                        className="w-full h-full object-cover opacity-90"
                    />
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
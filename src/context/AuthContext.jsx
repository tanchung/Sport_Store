import React, { createContext, useState, useContext, useEffect } from 'react';
import CookieService from '../services/Cookie/CookieService';
import AuthService from '../services/Auth/AuthServices';
import { message } from 'antd';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const accessToken = CookieService.getAccessToken();

        if (accessToken) {
            // Optimistically mark authenticated; we'll refine user info next
            setIsAuthenticated(true);
            fetchUserInfo();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserInfo = async () => {
        try {
            console.log('AuthContext.fetchUserInfo: start');
            const response = await AuthService.info();
            console.log('AuthContext.fetchUserInfo: ok', response);
            if (response.status === 200) {
                setCurrentUser(response.data);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('AuthContext.fetchUserInfo: error', error);
            const hasTokens = CookieService.hasAuthTokens();
            if (error?.response?.status === 401) {
                console.warn('AuthContext.fetchUserInfo: 401 from /user/getUser');
                // Fallback: keep authenticated if tokens exist so UI (cart) is visible
                if (hasTokens) setIsAuthenticated(true);
            } else {
                if (hasTokens) setIsAuthenticated(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateUserFields = async (userData) => {
        try {
            if (!userData || typeof userData !== 'object') {
                console.error('Invalid userData for updateUserFields:', userData);
                return {
                    success: false,
                    error: 'Invalid user data for update operation'
                };
            }

            if (!currentUser?.id) {
                return {
                    success: false,
                    error: 'User ID not found'
                };
            }

            const response = await AuthService.updateInfo(userData, currentUser.id);

            if (response.status === 200) {
                await fetchUserInfo();
                return { success: true, data: response.data };
            }

            return {
                success: false,
                error: response.data?.message || 'Cập nhật thông tin thất bại'
            };
        } catch (error) {
            console.error('Error updating user info:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin'
            };
        }
    };

    const updateAvatar = async (file) => {
        try {
            if (!file) {
                return {
                    success: false,
                    error: 'No file provided'
                };
            }

            if (!currentUser?.id) {
                return {
                    success: false,
                    error: 'User ID not found'
                };
            }

            const response = await AuthService.updateAvatar(file, currentUser.id);

            if (response.status === 200) {
                await fetchUserInfo();
                return { success: true, data: response.data };
            }

            return {
                success: false,
                error: response.data?.message || 'Cập nhật avatar thất bại'
            };
        } catch (error) {
            console.error('Error updating avatar:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật avatar'
            };
        }
    };

    const login = async (username, password) => {
        try {
            const response = await AuthService.login(username, password);
            if (response && response.data) {
                // Backend trả về ApiResponse với structure: {code, message, result}
                // result chứa AuthenticationDto với access_token và refresh_token
                const { code, message, result } = response.data;

                if (code === 200 && result) {
                    CookieService.setAuthTokens(
                        result.access_token,
                        result.refresh_token
                    );

                    await fetchUserInfo();

                    return { success: true };
                } else {
                    return {
                        success: false,
                        error: message || 'Đăng nhập thất bại'
                    };
                }
            }

            return {
                success: false,
                error: 'Không nhận được phản hồi từ server'
            };
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Đăng nhập thất bại'
            };
        }
    };

    const logout = async () => {
        try {
            setCurrentUser(null);
            setIsAuthenticated(false);
            const response = await AuthService.logout();
            if (response.status === 200) {
                return { success: true };
            }
            return {
                success: false,
                error: response.data?.message || 'Đăng xuất thất bại'
            };
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            // Clear tokens even if logout fails
            CookieService.removeAuthTokens();
            return {
                success: false,
                error: error?.response?.data?.message || error?.message || 'Đăng xuất thất bại'
            };
        }
    };

    const register = async (registrationData) => {
        try {
            const response = await AuthService.verifyOtpAndRegister(registrationData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Đăng ký thất bại:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký'
            };
        }
    };

    const sendOtp = async (email) => {
        try {
            const response = await AuthService.sendOtp(email);
            return {
                success: true,
                data: response.data,
                statusId: response.statusCode,
                message: response.data?.message || 'Mã OTP đã được gửi thành công'
            };
        } catch (error) {
            console.error('Lỗi gửi OTP:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Có lỗi xảy ra khi gửi mã OTP',
                statusId: error.response?.statusCode,
            };
        }
    };

    const verifyOtpAndRegister = async (registrationData) => {
        try {
            const response = await AuthService.verifyOtpAndRegister(registrationData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Lỗi xác thực OTP và đăng ký:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Có lỗi xảy ra khi xác thực mã OTP'
            };
        }
    };



    useEffect(() => {
        if (!CookieService.hasAuthTokens()) return;

        const handleAuthTokenExpire = () => {
            AuthService.refreshToken();
        };

        window.addEventListener('auth:tokenExpire', handleAuthTokenExpire);

        return () => {
            window.removeEventListener('auth:tokenExpire', handleAuthTokenExpire);
        };
    }, []);

    useEffect(() => {
        if (!CookieService.hasAuthTokens()) return;

         const handleAuthLogout = () => {
            // Clear local auth state without re-dispatching logout to avoid loop
            setCurrentUser(null);
            setIsAuthenticated(false);
            // Ensure tokens are cleared (no events dispatched here)
            try { CookieService.removeAuthTokens(); } catch (e) {}
        };

        window.addEventListener('auth:logout', handleAuthLogout);

        return () => {
            window.removeEventListener('auth:logout', handleAuthLogout);
        };
    }, []);

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await AuthService.changePassword(currentPassword, newPassword);
            if (response.status === 200) {
                message.success('Đổi mật khẩu thành công');
                return { success: true };
            }
            message.error(response.data?.message);
            return {
                success: false,
                error: response.data?.message
            }
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            message.error(error.response?.data?.message);
            return {
                success: false,
                error: error.response?.data?.message
            };
        }
    }

    const forgotPassword = async (email) => {
        try {
            const response = await AuthService.forgotPassword(email);
            if (response.status === 200) {
                return {
                    success: true,
                    message: response.data?.message || 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn'
                };
            }
            return {
                success: false,
                error: response.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu đặt lại mật khẩu'
            };
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu đặt lại mật khẩu:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu đặt lại mật khẩu'
            };
        }
    }

    const resetPassword = async (token, newPassword, confirmPassword) => {
        try {
            console.log("AuthContext resetPassword called with token:", token);
            const response = await AuthService.resetPassword(token, newPassword, confirmPassword);
            console.log("AuthContext resetPassword response:", response);

            if (response.status === 200) {
                return {
                    success: true,
                    message: response.data?.message || 'Đặt lại mật khẩu thành công'
                };
            }
            return {
                success: false,
                error: response.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu'
            };
        } catch (error) {
            console.error('Lỗi khi đặt lại mật khẩu:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu'
            };
        }
    }

    const value = {
        currentUser,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
        sendOtp,
        verifyOtpAndRegister,
        updateUserFields,
        updateAvatar,
        changePassword,
        forgotPassword,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
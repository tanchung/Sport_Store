import api from "@services/apiClient";
import CookieService from '../Cookie/CookieService';

// Biến lưu trữ Promise của request refresh token đang chạy (để tránh nhiều request cùng lúc)
let refreshTokenPromise = null;

class AuthService {
    /**
     * Lấy thông tin người dùng hiện tại
     * Uses backend shopping_cart /getUser endpoint
     * @returns {Promise} Promise với thông tin người dùng
     */
    async info() {
        try {


            // Use backend shopping_cart /user/getUser endpoint
            const response = await api.get('/user/getUser');

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch user info');
            }

            return {
                status: 200,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    }

    /**
     * Thay đổi thông tin người dùng
     * Uses backend shopping_cart /user/update/{userId} endpoint
     * @param {Object} userData - Dữ liệu người dùng cần cập nhật
     * @param {number} userId - ID của người dùng
     * @returns {Promise} - Kết quả từ API
     */
    async updateInfo(userData, userId) {
        try {
            const response = await api.put(`/user/update/${userId}`, userData, {
                'Content-Type': 'application/json'
            });

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to update user info');
            }

            return {
                status: 200,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error updating user info:', error);
            throw error;
        }
    }

    /**
     * Cập nhật avatar người dùng
     * Uses backend shopping_cart /user/updateAvatar/{userId} endpoint
     * @param {File} file - File ảnh avatar
     * @param {number} userId - ID của người dùng
     * @returns {Promise} - Kết quả từ API
     */
    async updateAvatar(file, userId) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.put(`/user/updateAvatar/${userId}`, formData, {
                'Content-Type': 'multipart/form-data'
            });

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to update avatar');
            }

            return {
                status: 200,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error updating avatar:', error);
            throw error;
        }
    }

    /**
     * Đăng nhập người dùng
     * @param {string} username - Tên đăng nhập
     * @param {string} password - Mật khẩu
     * @returns {Promise} Promise với kết quả đăng nhập
     */
    async login(username, password) {
        try {
            const response = await api.public.post(
                '/auth/login',
                {
                    username: username,
                    password: password
                },
                {
                    'Content-Type': 'application/json'
                }
            );

            // Backend shopping_cart returns ApiResponse format
            // Success case: code = 200, result contains AuthenticationDto
            // Error case: code = 401, message = "Invalids credentials", no result
            if (response.data.code === 200 && response.data.result) {
                // Extract authentication data from result
                const authData = response.data.result;

                // Store tokens if available (AuthService handles this)
                // Backend returns access_token and refresh_token, not token and refreshToken
                if (authData.access_token && authData.refresh_token) {
                    CookieService.setAuthTokens(authData.access_token, authData.refresh_token);
                } else {
                    console.error('Missing tokens in login response:', authData);
                    console.error('Expected fields: access_token, refresh_token');
                }

                // Return the structure that AuthContext expects
                // AuthContext expects: response.data = {code, message, result}
                // Backend already returns access_token and refresh_token correctly
                return {
                    data: {
                        code: response.data.code,
                        message: response.data.message,
                        result: {
                            access_token: authData.access_token,  // Use correct field from backend
                            refresh_token: authData.refresh_token,  // Use correct field from backend
                            authentication: authData.authentication
                        }
                    }
                };
            } else {
                // Handle error cases (code 401 or other errors)
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            // Handle both API errors and network errors
            if (error.response && error.response.data) {
                // API returned an error response
                const errorMessage = error.response.data.message || 'Login failed';
                console.error('Login API error:', errorMessage);
                throw new Error(errorMessage);
            } else if (error.message) {
                // Our custom error or other errors
                console.error('Login error:', error.message);
                throw error;
            } else {
                // Network or other unknown errors
                console.error('Unknown login error:', error);
                throw new Error('Network error or server unavailable');
            }
        }
    }

    /**
     * Gửi lại email xác thực
     * @param {string} email - Email để gửi lại mã xác thực
     * @returns {Promise} Promise với kết quả gửi email
     */
    async resendEmail(email) {
        try {
            const response = await api.public.put(
                `/auth/resend-email?email=${encodeURIComponent(email)}`,
                {}
            );

            // Backend shopping_cart returns ApiResponse format
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to resend email');
            }

            return {
                data: {
                    success: true,
                    message: response.data.message
                }
            };
        } catch (error) {
            console.error('Error resending email:', error);
            throw error;
        }
    }

    /**
     * Đăng ký người dùng mới
     * @param {Object} registrationData - Dữ liệu đăng ký
     * @returns {Promise} Promise với kết quả đăng ký
     */
    async signup(registrationData) {
        try {
            const response = await api.public.post(
                '/auth/signup',
                registrationData,
                {
                    'Content-Type': 'application/json'
                }
            );

            // Backend shopping_cart returns ApiResponse format
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Signup failed');
            }

            return {
                data: {
                    success: true,
                    message: response.data.message,
                    user: response.data.result
                }
            };
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    }

    /**
     * Xác thực mã code từ email
     * @param {Object} verifyData - Dữ liệu xác thực {email, verificationCode}
     * @returns {Promise} Promise với kết quả xác thực
     */
    async verifyCode(verifyData) {
        try {
            const response = await api.public.post(
                '/auth/verify-code',
                verifyData,
                {
                    'Content-Type': 'application/json'
                }
            );

            // Backend shopping_cart returns ApiResponse format
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Verification failed');
            }

            return {
                data: {
                    success: true,
                    message: response.data.message
                }
            };
        } catch (error) {
            console.error('Error verifying code:', error);
            throw error;
        }
    }

    /**
     * Làm mới access token bằng refresh token
     * @returns {Promise<{accessToken: string, success: boolean}>} Access token mới
     */
    async refreshToken() {
        // Nếu đã có một request refresh đang chạy, trả về Promise đó
        if (refreshTokenPromise) {
            return refreshTokenPromise;
        }

        const refreshToken = CookieService.getRefreshToken();

        if (!refreshToken) {
            // No refresh token; let context handle cleanup without triggering loops here
            return Promise.reject(new Error('Không có refresh token'));
        }

        // Tạo một promise mới cho request refresh token (sử dụng api.public để tránh vòng lặp)
        refreshTokenPromise = api.public.post(
            `/auth/refresh-token?refreshToken=${refreshToken}`,
            {}
        )
            .then(response => {
                const data = response.data;

                if (data.success && data.accessToken) {
                    CookieService.setAccessToken(data.accessToken);
                    return data;
                } else {
                    this.logout();
                    throw new Error('Refresh token không hợp lệ');
                }
            })
            .catch(error => {
                // Nếu refresh token cũng hết hạn hoặc không hợp lệ
                this.logout();
                throw error;
            })
            .finally(() => {
                // Reset promise để lần sau có thể refresh lại
                refreshTokenPromise = null;
            });

        return refreshTokenPromise;
    }

    /**
     * Check token có hợp lệ không (chỉ kiểm tra format, không gửi request)
     * @param {string} token - Token cần kiểm tra
     * @returns {boolean} true nếu token có format đúng và chưa hết hạn
     */
    isTokenValid(token) {
        if (!token) return false;

        try {
            // Decode JWT payload để lấy thời gian hết hạn
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            // Kiểm tra token còn thời hạn
            return expirationTime > currentTime;
        } catch (e) {
            return false;
        }
    }

    async logout() {
        try {
            // Since JWT tokens are stateless, we just need to remove them from client
            // No need to call backend logout endpoint as it doesn't exist
            CookieService.removeAuthTokens();
            window.dispatchEvent(new CustomEvent('auth:logout'));

            // Return a mock successful response for compatibility
            return {
                status: 200,
                data: {
                    success: true,
                    message: 'Logged out successfully'
                }
            };
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }

    /**
     * Đổi mật khẩu người dùng đã đăng nhập
     * @param {string} oldPassword - Mật khẩu hiện tại
     * @param {string} newPassword - Mật khẩu mới
     * @param {string} confirmPassword - Xác nhận mật khẩu mới
     * @returns {Promise} Promise với kết quả đổi mật khẩu
     */
    async changePassword(oldPassword, newPassword, confirmPassword) {
        try {
            const response = await api.patch(
                '/auth/change-password',
                {
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword
                },
                {
                    'Content-Type': 'application/json'
                }
            );

            // Backend shopping_cart returns ApiResponse format
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to change password');
            }

            return {
                data: {
                    success: true,
                    message: response.data.message
                }
            };
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    /**
     * Gửi yêu cầu đặt lại mật khẩu
     * @param {string} email - Email của người dùng
     * @returns {Promise} Promise với kết quả gửi yêu cầu
     */
    async forgotPassword(email) {
        try {
            const response = await api.public.post(
                `/auth/forgot-password?email=${encodeURIComponent(email)}`,
                {},
                {
                    'Content-Type': 'application/json'
                }
            );
            return response;
        } catch (error) {
            console.error('Error requesting password reset:', error);
            throw error;
        }
    }

    /**
     * Đặt lại mật khẩu với token
     * @param {string} token - Token xác thực từ email
     * @param {string} newPassword - Mật khẩu mới
     * @param {string} confirmPassword - Xác nhận mật khẩu mới (không sử dụng vì backend chỉ cần newPassword)
     * @returns {Promise} Promise với kết quả đặt lại mật khẩu
     */
    async resetPassword(token, newPassword, confirmPassword) {
        try {
            console.log("AuthService.resetPassword - Sending request with token:", token);
            
            const response = await api.public.post(
                '/auth/reset-password',
                {
                    token: token,
                    newPassword: newPassword
                },
                {
                    'Content-Type': 'application/json'
                }
            );
            
            console.log("AuthService.resetPassword - Response:", response.data);

            // Backend returns ApiResponse format
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Reset password failed');
            }

            return {
                data: {
                    success: true,
                    message: response.data.message
                }
            };
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
}

export default new AuthService();
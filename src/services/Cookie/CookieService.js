import Cookies from 'js-cookie';

// Định nghĩa tên các cookies
const TOKEN_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token'
};

// Thời gian expire mặc định (7 ngày)
const DEFAULT_EXPIRY_DAYS = 7;

class CookieService {
    /**
     * Lưu access token và refresh token vào cookies
     * @param {string} accessToken - Access token
     * @param {string} refreshToken - Refresh token 
     * @param {number} expiryDays - Số ngày hết hạn (mặc định 7 ngày)
     */
    setAuthTokens(accessToken, refreshToken, expiryDays = DEFAULT_EXPIRY_DAYS) {
        const options = {
            expires: expiryDays,
            secure: false, // Chỉ dùng secure trong production
            sameSite: 'strict'
        };

        Cookies.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken, options);
        Cookies.set(TOKEN_KEYS.REFRESH_TOKEN, refreshToken, options);
    }

    /**
     * Lấy access token từ cookies
     * @returns {string|null} Access token hoặc null nếu không tồn tại
     */
    getAccessToken() {
        return Cookies.get(TOKEN_KEYS.ACCESS_TOKEN) || null;
    }

    /**
     * Lấy refresh token từ cookies
     * @returns {string|null} Refresh token hoặc null nếu không tồn tại
     */
    getRefreshToken() {
        return Cookies.get(TOKEN_KEYS.REFRESH_TOKEN) || null;
    }

    /**
     * Kiểm tra xem đã có tokens trong cookies hay chưa
     * @returns {boolean} true nếu đã có token, false nếu chưa
     */
    hasAuthTokens() {
        return !!this.getAccessToken() && !!this.getRefreshToken();
    }

    /**
     * Xóa tất cả auth tokens khỏi cookies (dùng khi logout)
     */
    removeAuthTokens() {
        Cookies.remove(TOKEN_KEYS.ACCESS_TOKEN);
        Cookies.remove(TOKEN_KEYS.REFRESH_TOKEN);
    }

    /**
     * Debug method to check token status
     */
    debugTokens() {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();
        console.log('Debug Tokens:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            accessTokenLength: accessToken ? accessToken.length : 0,
            refreshTokenLength: refreshToken ? refreshToken.length : 0
        });
        return { accessToken, refreshToken };
    }
}

export default new CookieService();
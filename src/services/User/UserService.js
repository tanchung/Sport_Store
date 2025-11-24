import api from '@services/apiClient';

class UserService {
    /**
     * Get current user information (uses authenticated user)
     * @returns {Promise} Promise with current user data including pointVoucher
     */
    static async getCurrentUserInfo() {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            
            const response = await api.get('/user/getUser', {}, headers);
            
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch current user info');
            }
            
            return {
                success: true,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error fetching current user info:', error);
            throw error;
        }
    }

    /**
     * Get user information by ID
     * @param {number} userId - User ID
     * @returns {Promise} Promise with user data including pointVoucher
     */
    static async getUserInfo(userId) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            
            const response = await api.get(`/user/getUser/${userId}`, {}, headers);
            
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch user info');
            }
            
            return {
                success: true,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    }
}

export default UserService;

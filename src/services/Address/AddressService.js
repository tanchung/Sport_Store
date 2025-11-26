import api from '@services/apiClient';

class AddressService {
    /**
     * Get all addresses for a specific user
     * @param {number} userId - User ID
     * @returns {Promise} Promise with list of addresses
     */
    async getAddressesByUserId(userId) {
        try {
            const response = await api.get(`/address/get-by-user/${userId}`);
            
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch addresses');
            }
            
            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: response.data.result || []
            };
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw error;
        }
    }

    /**
     * Create a new address for a user
     * @param {Object} addressData - Address data
     * @param {string} addressData.addressLine - Address line
     * @param {string} addressData.wardCommune - Ward/Commune
     * @param {string} addressData.state - State/Province
     * @param {string} addressData.postalCode - Postal code
     * @param {string} addressData.country - Country
     * @param {number} addressData.userId - User ID
     * @returns {Promise} Promise with created address data
     */
    async createAddress(addressData) {
        try {
            const response = await api.post('/address/create', addressData);
            
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to create address');
            }
            
            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error creating address:', error);
            throw error;
        }
    }

    /**
     * Update an existing address
     * @param {number} id - Address ID
     * @param {Object} addressData - Updated address data
     * @returns {Promise} Promise with updated address data
     */
    async updateAddress(id, addressData) {
        try {
            const response = await api.put(`/address/update/${id}`, addressData);
            
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to update address');
            }
            
            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error updating address:', error);
            throw error;
        }
    }

    /**
     * Delete an address
     * @param {number} id - Address ID
     * @returns {Promise} Promise with deletion result
     */
    async deleteAddress(id) {
        try {
            const response = await api.delete(`/address/delete/${id}`);
            
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to delete address');
            }
            
            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message
            };
        } catch (error) {
            console.error('Error deleting address:', error);
            throw error;
        }
    }
}

export default new AddressService();

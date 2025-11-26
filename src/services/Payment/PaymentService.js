import api from '@services/apiClient';

const RETURN_URL = import.meta.env.VITE_RETURN_URL;
const CANCEL_URL = import.meta.env.VITE_CANCEL_URL;

class PaymentService {
    /**
     * Get payment status from PayOS
     * @param {string} paymentLinkId - The payment link ID
     * @returns {Promise<boolean>} Payment status
     */
    static async getStatusPayos(paymentLinkId) {
        try {
            // TODO: Implement when backend has PayOS status endpoint
            console.warn('Payment status service not yet implemented');
            throw new Error('Payment status service not yet implemented');
        } catch (error) {
            console.error('Error fetching status payo:', error);
            return false;
        }
    }

    /**
     * Create PayOS payment (legacy method - kept for backward compatibility)
     * @param {Object} params - Payment parameters
     * @returns {Promise} Payment response
     */
    static async createPaymentPayos(params) {
        try {
            // Use the new createPaymentLink method instead
            return await this.createPaymentLink(params.orderId, 'PAYOS');
        } catch (error) {
            console.error('Error creating payment payo:', error);
            return null;
        }
    }

    /**
     * Create payment link for an order
     * Backend: POST /payment/create-payment-link
     * @param {number} orderId - The order ID
     * @param {string} paymentMethod - Payment method: "PAYOS" or "COD"
     * @returns {Promise} Payment link response
     */
    static async createPaymentLink(orderId, paymentMethod) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            if (!paymentMethod) {
                throw new Error('Payment method is required');
            }

            // Validate payment method
            const validMethods = ['PAYOS', 'COD'];
            const normalizedMethod = paymentMethod.toUpperCase();

            if (!validMethods.includes(normalizedMethod)) {
                throw new Error(`Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
            }

            console.log(`💳 Creating payment link: orderId=${orderId}, method=${normalizedMethod}`);

            // Tạo dữ liệu dạng form-urlencoded
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            params.append('paymentMethod', normalizedMethod);

            // Gửi request tới backend với Content-Type: application/x-www-form-urlencoded
            const response = await api.post('/payment/create-payment-link', params.toString(), {
                'Content-Type': 'application/x-www-form-urlencoded'
            });

            // Check response code
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to create payment link');
            }

            console.log('✅ Payment link created successfully:', response.data.result);

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: response.data.result
            };
        } catch (error) {
            console.error('❌ Error creating payment link:', error);
            throw error;
        }
    }
}

export default PaymentService;
import api from '@services/apiClient';

class PayPalService {
    /**
     * Create PayPal payment
     * @param {number} orderId - The order ID
     * @returns {Promise<Object>} Payment creation response with approval URL
     */
    static async createPayment(orderId) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            console.log(`💳 Creating PayPal payment: orderId=${orderId}`);

            // Gọi API backend để tạo PayPal payment
            const response = await api.post(`/payment/paypal/create?orderId=${orderId}`);

            // Check response code
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to create PayPal payment');
            }

            console.log('✅ PayPal payment created successfully:', response.data.result);

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: response.data.result // Should contain approvalUrl
            };
        } catch (error) {
            console.error('❌ Error creating PayPal payment:', error);
            throw error;
        }
    }

    /**
     * Execute PayPal payment after user approval
     * @param {number} orderId - The order ID
     * @param {string} paymentId - PayPal payment ID
     * @param {string} payerId - PayPal payer ID
     * @returns {Promise<Object>} Payment execution response
     */
    static async executePayment(orderId, paymentId, payerId) {
        try {
            if (!orderId || !paymentId || !payerId) {
                throw new Error('Order ID, Payment ID, and Payer ID are required');
            }

            console.log(`💳 Executing PayPal payment: orderId=${orderId}, paymentId=${paymentId}, payerId=${payerId}`);

            // Gọi API backend để execute PayPal payment (GET method)
            const response = await api.get(`/payment/paypal/execute?orderId=${orderId}&paymentId=${paymentId}&PayerID=${payerId}`);

            console.log('📦 Raw execute response:', response.data);
            console.log('📦 Response structure:', {
                code: response.data.code,
                message: response.data.message,
                result: response.data.result,
                resultType: typeof response.data.result
            });

            // Backend trả về: { code: 200, message: "...", result: "URL string" }
            if (response.data.code !== 200) {
                console.error('❌ Execute failed with code:', response.data.code, 'message:', response.data.message);
                return {
                    success: false,
                    statusCode: response.data.code,
                    message: response.data.message || 'Failed to execute PayPal payment',
                    data: response.data.result
                };
            }

            // Check result string để xác định success/failure
            const resultUrl = response.data.result;

            if (typeof resultUrl === 'string' && resultUrl.includes('status=PAID')) {
                console.log('✅ PayPal payment executed successfully - status=PAID found in result');
                return {
                    success: true,
                    statusCode: 200,
                    message: response.data.message || 'Payment executed successfully',
                    data: { redirectUrl: resultUrl }
                };
            } else if (typeof resultUrl === 'string' && (resultUrl.includes('status=CANCELLED') || resultUrl.includes('paymentError'))) {
                console.error('❌ Execute failed - status=CANCELLED or error found in result');
                return {
                    success: false,
                    statusCode: 400,
                    message: 'Payment execution failed or cancelled',
                    data: { redirectUrl: resultUrl }
                };
            } else {
                // Fallback: code=200 nhưng không rõ status → coi như success
                console.log('✅ PayPal payment executed - code=200');
                return {
                    success: true,
                    statusCode: 200,
                    message: response.data.message,
                    data: response.data.result
                };
            }
        } catch (error) {
            console.error('❌ Error executing PayPal payment:', error);
            console.error('Error details:', error.response?.data || error.message);
            return {
                success: false,
                statusCode: error.response?.status || 500,
                message: error.response?.data?.message || error.message || 'Failed to execute PayPal payment',
                data: null
            };
        }
    }
}

export default PayPalService;

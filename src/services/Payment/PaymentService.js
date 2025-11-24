import api from '@services/apiClient';

const RETURN_URL = import.meta.env.VITE_RETURN_URL;
const CANCEL_URL = import.meta.env.VITE_CANCEL_URL;

class PaymentService {
    static async getStatusPayos(paymentLinkId){
        try {
            // Backend shopping_cart doesn't have Payos payment endpoints
            // Return mock data or throw error
            console.warn('Payment service not available in shopping_cart backend');
            throw new Error('Payment service not available in shopping_cart backend');
        } catch (error) {
            console.error('Error fetching status payo:', error);
            return false;
        }
    }

    static async createPaymentPayos(params) {
        try {
            // Backend shopping_cart doesn't have Payos payment endpoints
            // Return mock data or throw error
            console.warn('Payment service not available in shopping_cart backend');
            throw new Error('Payment service not available in shopping_cart backend');
        } catch (error) {
            console.error('Error creating payment payo:', error);
            return null;
        }
    }
}

export default PaymentService;
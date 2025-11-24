import api from '@services/apiClient';

class CouponService {
    static async getUserCouponPoints(userId) {
        try {
            // Backend shopping_cart doesn't have Coupon endpoints
            // Return mock data or throw error
            console.warn('Coupon service not available in shopping_cart backend');
            return 0; // Return 0 points
        } catch (error) {
            console.error('Error fetching coupons:', error);
            return 0;
        }
    }

    static async getExchangeableVouchers(){
        try {
            // Backend shopping_cart doesn't have Coupon endpoints
            // Return empty array or use voucher service instead
            console.warn('Coupon service not available in shopping_cart backend');
            return [];
        } catch (error) {
            console.error('Error fetching coupons:', error);
            return [];
        }
    }

    static async exchangeVoucher(voucherId) {
        try {
            // Backend shopping_cart doesn't have Coupon endpoints
            // Return false or throw error
            console.warn('Coupon service not available in shopping_cart backend');
            throw new Error('Coupon exchange not available in shopping_cart backend');
        } catch (error) {
            console.error('Error exchanging voucher:', error);
            return false;
        }
    }
}

export default CouponService;
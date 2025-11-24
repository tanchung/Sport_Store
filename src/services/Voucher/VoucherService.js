import api from '@services/apiClient';

class VoucherService {
    static async getUserVouchers(userId) {
        try {
            // Validate userId before calling backend
            if (userId === undefined || userId === null || userId === '' || Number.isNaN(Number(userId))) {
                console.warn('VoucherService.getUserVouchers called without a valid userId. Returning empty list.');
                return [];
            }
            const headers = {
                'Content-Type': 'application/json',
            };
            const response = await api.get(`/voucher/getVouchersByUserId/${userId}`, {}, headers);
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch user vouchers');
            }
            const vouchers = (response.data.result || []).map(item => ({
                id: item.id,
                code: item.code,
                discountAmount: item.discountAmount,
                percentTage: item.percentTage,
                startDate: item.startDate,
                endDate: item.endDate,
                usageLimit: item.usageLimit,
                usedCount: item.usedCount,
                active: item.active,
                minOrderAmount: item.minOrderAmount,
                maxDiscountAmount: item.maxDiscountAmount,
            }));
            return vouchers;
        } catch (e) {
            console.error('Error fetching user vouchers', e);
            return [];
        }
    }

    static async getVouchers(pageNumber = 1, pageSize = 10) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            // Use backend shopping_cart API endpoint
            const response = await api.get('/voucher/getAll', {}, headers);

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch vouchers');
            }

            const allVouchers = response.data.result || [];
            const vouchers = allVouchers.map(item => ({
                id: item.id,
                code: item.code,
                discount: item.discountAmount,
                startDate: item.startDate,
                endDate: item.endDate,
                isPercentage: item.percentTage,
                usageLimit: item.usageLimit,
                usedCount: item.usedCount,
                active: item.active,
                minOrderAmount: item.minOrderAmount,
                maxDiscountAmount: item.maxDiscountAmount
            }));

            // Simulate pagination
            const startIndex = (pageNumber - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedVouchers = vouchers.slice(startIndex, endIndex);

            const metadata = {
                totalPages: Math.ceil(vouchers.length / pageSize),
                pageSize: pageSize,
                totalCount: vouchers.length,
                hasPrevious: pageNumber > 1,
                hasNext: endIndex < vouchers.length
            };

            return {
                items: paginatedVouchers,
                metadata: metadata
            };
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            return {
                items: [],
                metadata: {
                    totalPages: 0,
                    pageSize: pageSize,
                    totalCount: 0,
                    hasPrevious: false,
                    hasNext: false
                }
            };
        }
    }

    static async getVoucherById(id) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            // Use backend shopping_cart API endpoint
            const response = await api.get(`/voucher/getVoucher/${id}`, {}, headers);

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch voucher');
            }

            const item = response.data.result;
            return {
                success: true,
                data: {
                    id: item.id,
                    code: item.code,
                    discount: item.discountAmount,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    isPercentage: item.percentTage,
                    usageLimit: item.usageLimit,
                    usedCount: item.usedCount,
                    active: item.active,
                    minOrderAmount: item.minOrderAmount,
                    maxDiscountAmount: item.maxDiscountAmount
                }
            };
        } catch (error) {
            console.error('Error fetching voucher:', error);
            throw error;
        }
    }

    static async getVouchersUser({pageNumber = 1, pageSize = 10, SearchTerm = null} = {}) {
        try {
            // Backend shopping_cart doesn't have customer-specific voucher endpoints
            // Use the general getVouchers method and filter active vouchers
            const result = await this.getVouchers(pageNumber, pageSize);

            // Filter for active vouchers only (simulating customer vouchers)
            const activeVouchers = result.items.filter(voucher => voucher.active);

            // Apply search term if provided
            let filteredVouchers = activeVouchers;
            if (SearchTerm) {
                filteredVouchers = activeVouchers.filter(voucher =>
                    voucher.code.toLowerCase().includes(SearchTerm.toLowerCase())
                );
            }

            return {
                items: filteredVouchers,
                metadata: {
                    ...result.metadata,
                    totalCount: filteredVouchers.length,
                    totalPages: Math.ceil(filteredVouchers.length / pageSize)
                }
            };
        } catch (error) {
            console.error('Error fetching user vouchers:', error);
            return {
                items: [],
                metadata: {
                    totalPages: 0,
                    pageSize: pageSize,
                    totalCount: 0,
                    hasPrevious: false,
                    hasNext: false
                }
            };
        }
    }

    static async createVoucher(voucherData) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            // Use backend shopping_cart API endpoint
            const response = await api.post('/voucher/create', voucherData, headers);

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to create voucher');
            }

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error creating voucher:', error);
            throw error;
        }
    }

    static async deleteVoucher(id) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            // Use backend shopping_cart API endpoint
            const response = await api.delete(`/voucher/delete/${id}`, headers);

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to delete voucher');
            }

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message
            };
        } catch (error) {
            console.error('Error deleting voucher:', error);
            throw error;
        }
    }

    static async addVoucherToUser(userId, voucherId) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            // Use backend shopping_cart API endpoint
            const response = await api.post(`/voucher/addVoucher/${userId}/${voucherId}`, {}, headers);

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to add voucher to user');
            }

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message
            };
        } catch (error) {
            console.error('Error adding voucher to user:', error);
            throw error;
        }
    }
}

export default VoucherService;
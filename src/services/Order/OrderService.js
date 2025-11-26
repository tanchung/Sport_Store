import api from '@services/apiClient'
import AuthService from '@services/Auth/AuthServices'

class OrderService {
  // Retrieve authenticated user ID from AuthService
  async _getAuthUserId() {
    try {
      const user = await AuthService.info();
      const userId = user?.data?.id || user?.data?.userId;
      if (!userId) throw new Error('Người dùng chưa đăng nhập hoặc không xác định được ID');
      return userId;
    } catch (e) {
      throw new Error('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
    }
  }

  async getPendingOrders(queryParams) {
    const userId = queryParams.userId || await this._getAuthUserId()
    return this.getOrdersByStatus({ ...queryParams, userId, statusId: 'PENDING' })
  }

  async getProcessingOrders(queryParams) {
    const userId = queryParams.userId || await this._getAuthUserId()
    return this.getOrdersByStatus({ ...queryParams, userId, statusId: 'PROCESSING' });
  }

  async getCancelRequestedOrders(queryParams) {
    const userId = queryParams.userId || await this._getAuthUserId()
    return this.getOrdersByStatus({ ...queryParams, userId, statusId: 'CANCEL_REQUESTED' });
  }

  async getConfirmedOrders(queryParams) {
    const userId = queryParams.userId || await this._getAuthUserId()
    return this.getOrdersByStatus({ ...queryParams, userId, statusId: 'CONFIRMED' });
  }

  async getShippingOrders(queryParams) {
    const userId = queryParams.userId || await this._getAuthUserId()
    return this.getOrdersByStatus({ ...queryParams, userId, statusId: 'SHIPPING' });
  }

  // Helper method to get orders by status with backend pagination
  async getOrdersByStatus(queryParams) {
    try {
      const userId = queryParams.userId || await this._getAuthUserId()
      if (!userId) throw new Error('Không xác định được người dùng')
      const statusId = queryParams.statusId

      // Backend uses 0-based page index
      const pageNumber = Math.max(1, Number(queryParams.pageNumber) || 1)
      const pageSize = Math.max(1, Number(queryParams.pageSize) || 10)
      const pageIndex = pageNumber - 1 // Convert 1-based UI to 0-based backend

      let url = ''
      if (statusId) {
        url = `/orders/order-user-status/${userId}?status=${encodeURIComponent(statusId)}&page=${pageIndex}&size=${pageSize}`
      } else {
        url = `/orders/history-order/${userId}?page=${pageIndex}&size=${pageSize}`
      }

      const response = await api.get(url)

      if (response?.data?.code !== 200) {
        throw new Error(response?.data?.message || 'Failed to fetch orders by status')
      }

      // Handle new backend response format with 'page' object
      const pageData = response?.data?.result || {}
      const list = pageData?.content || []
      
      // Extract pagination metadata from the new format
      const paginationData = pageData?.page || {}
      const backendPageSize = paginationData?.size || pageSize
      const backendPageNumber = paginationData?.number || pageIndex
      const totalElements = paginationData?.totalElements || 0
      const totalPages = paginationData?.totalPages || 0

      const mappedOrders = (Array.isArray(list) ? list : []).map(item => {
        const code = item.orderCode || `ORD-${item.id ?? item.orderId ?? item.orderID}`
        const addr = item.shippingAddress || ''
        const status = item.oderStatus || item.status || item.statusId || statusId
        return {
          id: item.id ?? item.orderId ?? item.orderID,
          orderCode: code,
          orderNumber: code, // alias for UI compatibility
          customerId: item.userId ?? userId,
          orderDate: item.orderDate ?? item.createdAt ?? null,
          shippingAddress: addr,
          shippingFee: item.shippingFee ?? 0,
          shippingCode: item.shippingCode ?? '',
          totalPrice: item.totalAmount ?? 0,
          paymentMethod: item.paymentMethod ?? '',
          paymentMethodName: item.paymentMethodName ?? '',
          notes: item.notes ?? '',
          createdAt: item.createdAt ?? item.orderDate ?? null,
          statusId: status,
          isSuccess: String(status).toUpperCase() === 'COMPLETED',
          orderDetails: item.orderItems || [],
          appliedVouchers: item.voucherId ? [{ id: item.voucherId }] : [],
          discountApplied: item.discountApplied || 0
        }
      })

      // Convert backend 0-based page to UI 1-based page
      const currentPage = (backendPageNumber ?? pageIndex) + 1

      return {
        metadata: {
          totalCount: totalElements,
          totalPages: totalPages,
          pageSize: backendPageSize,
          currentPage: currentPage,
          hasPrevious: currentPage > 1,
          hasNext: currentPage < totalPages
        },
        orders: mappedOrders,
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  /**
   * Get order by ID
   * @param {string|number} orderId - The ID of the order to get
   * @returns {Promise} Promise containing the order data
   */
  async getOrderById(orderId) {
    try {
      const response = await api.get(`/orders/get-order/${orderId}`);

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to fetch order');
      }

      return {
        success: true,
        statusCode: response.data.code,
        message: response.data.message,
        data: response.data.result
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Apply voucher to order
   * @param {string|number} orderId - The ID of the order
   * @param {string} voucherCode - The voucher code to apply
   * @returns {Promise} Promise containing the result
   */
  async applyVoucher(orderId, voucherId) {
    try {
      const response = await api.post(`/orders/applyVoucher/${orderId}/${voucherId}`, {}, {
        'Content-Type': 'application/json'
      });

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to apply voucher');
      }

      return {
        success: true,
        statusCode: response.data.code,
        message: response.data.message,
        data: response.data.result
      };
    } catch (error) {
      console.error('Error applying voucher:', error);
      throw error;
    }
  }

  /**
   * Test apply voucher to order (without actually applying)
   * @param {string|number} orderId - The ID of the order
   * @param {string} voucherCode - The voucher code to test
   * @returns {Promise} Promise containing the result
   */
  async testApplyVoucher(orderId, voucherId) {
    try {
      const response = await api.post(`/orders/applyVoucher/${orderId}/${voucherId}`, {}, {
        'Content-Type': 'application/json'
      });

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to test voucher');
      }

      return {
        success: true,
        statusCode: response.data.code,
        message: response.data.message,
        data: response.data.result
      };
    } catch (error) {
      console.error('Error testing voucher:', error);
      throw error;
    }
  }



  /**
   * Get orders with pagination and filtering
   * @param {Object} queryParams - Query parameters for filtering and pagination
   * @param {number} queryParams.pageNumber - Current page number (starting from 1)
   * @param {number} queryParams.pageSize - Number of items per page (max 20)
   * @param {string} [queryParams.customerId] - Optional customer ID filter
   * @param {string} [queryParams.statusId] - Optional status ID filter (PENDING, COMPLETED, etc.)
   * @param {string} [queryParams.searchTerm] - Optional search term (order number, customer name, etc.)
   * @param {string} [queryParams.sortBy] - Sort field (default: "orderDate")
   * @param {boolean} [queryParams.sortAscending] - Sort direction (default: false)
   * @param {string} [queryParams.fromDate] - Optional start date filter (ISO format)
   * @param {string} [queryParams.toDate] - Optional end date filter (ISO format)
   * @returns {Promise} Promise containing the orders data
   */
  async getOrdersHistory(queryParams = {}) {
  try {
    const userId = queryParams.userId || await this._getAuthUserId();
    if (!userId) throw new Error('Không xác định được người dùng');

    const pageNumber = Math.max(1, Number(queryParams.pageNumber) || 1)
    const pageSize = Math.max(1, Number(queryParams.pageSize) || 10)
    const pageIndex = pageNumber - 1

    const requestedStatus = queryParams.statusId;

    // Helper to fetch one status page and map
    const fetchStatusPage = async (status) => {
      const resp = await api.get(`/orders/order-user-status/${userId}?status=${encodeURIComponent(status)}&page=${pageIndex}&size=${pageSize}`);
      if (resp?.data?.code !== 200) {
        throw new Error(resp?.data?.message || `Failed to fetch orders for status ${status}`)
      }
      const pageData = resp.data.result || {};
      const list = Array.isArray(pageData.content) ? pageData.content : [];
      const paginationData = pageData?.page || {};
      const totalElements = paginationData?.totalElements || 0;
      const totalPages = paginationData?.totalPages || 0;
      return { list, totalElements, totalPages };
    };

    // Map UI status to backend
    const mapHistoryStatus = (statusId) => {
      if (!statusId) return null;
      const up = String(statusId).toUpperCase();
      if (up === 'COMPLETED') return 'DELIVERED';
      if (up === 'CANCELLED') return 'CANCELLED';
      return up;
    };

    let combinedList = [];
    let combinedTotal = 0;

    if (requestedStatus === null || requestedStatus === undefined) {
      // Tất cả → DELIVERED + CANCELLED
      const [delivered, cancelled] = await Promise.all([
        fetchStatusPage('DELIVERED'),
        fetchStatusPage('CANCELLED')
      ]);
      combinedList = [...delivered.list, ...cancelled.list];
      combinedTotal = (delivered.totalElements || 0) + (cancelled.totalElements || 0);
    } else {
      // Single status mapping
      const backendStatus = mapHistoryStatus(requestedStatus);
      const single = await fetchStatusPage(backendStatus);
      combinedList = single.list;
      combinedTotal = single.totalElements;
    }

    // Map to UI format
    const mappedOrders = combinedList.map(item => ({
      id: item.id ?? item.orderId ?? item.orderID,
      orderCode: item.orderCode || `ORD-${item.id ?? item.orderId ?? item.orderID}`,
      orderNumber: item.orderCode || `ORD-${item.id ?? item.orderId ?? item.orderID}`,
      customerId: item.userId,
      orderDate: item.orderDate ?? item.createdAt ?? null,
      shippingAddress: item.shippingAddress || '',
      shippingFee: item.shippingFee ?? 0,
      shippingCode: item.shippingCode ?? '',
      totalPrice: item.totalAmount ?? 0,
      paymentMethod: item.paymentMethod ?? '',
      paymentMethodName: item.paymentMethodName ?? '',
      notes: item.notes || '',
      createdAt: item.createdAt ?? item.orderDate ?? null,
      statusId: item.oderStatus || item.status || item.statusId,
      isSuccess: String(item.oderStatus || item.status || '').toUpperCase() === 'COMPLETED',
      orderDetails: item.orderItems || [],
      appliedVouchers: item.voucherId ? [{ id: item.voucherId }] : [],
      discountApplied: item.discountApplied || 0
    }));

    // Compute pagination combined
    const totalElements = combinedTotal;
    const totalPages = Math.ceil(totalElements / pageSize);

    return {
      metadata: {
        totalCount: totalElements,
        totalPages: totalPages,
        pageSize: pageSize,
        currentPage: pageNumber,
        hasPrevious: pageNumber > 1,
        hasNext: pageNumber < totalPages
      },
      orders: mappedOrders
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

  /**
   * Search orders by name and date range
   * Backend: GET /orders/find-Order-By-Name-And-Date/{userId}
   * @param {Object} queryParams - Search parameters
   * @param {string} queryParams.searchTerm - Order name/keyword to search
   * @param {string} queryParams.startDate - Start date in yyyy-mm-dd format
   * @param {string} queryParams.endDate - End date in yyyy-mm-dd format
   * @param {string} queryParams.status - Order status to filter by (PENDING, PROCESSING, CONFIRMED, SHIPPING, etc.)
   * @param {number} queryParams.pageNumber - Page number (1-based)
   * @param {number} queryParams.pageSize - Items per page
   * @returns {Promise} Promise containing the search results
   */
  async searchOrdersByNameAndDate(queryParams = {}) {
    try {
      const userId = queryParams.userId || await this._getAuthUserId();
      if (!userId) throw new Error('Không xác định được người dùng');

      // Validate required parameters
      const searchTerm = queryParams.searchTerm || '';
      const startDate = queryParams.startDate || '';
      const endDate = queryParams.endDate || '';
      const status = queryParams.status || '';

      // Validate date format (yyyy-mm-dd)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (startDate && !dateRegex.test(startDate)) {
        throw new Error('Ngày bắt đầu phải có định dạng yyyy-mm-dd');
      }
      if (endDate && !dateRegex.test(endDate)) {
        throw new Error('Ngày kết thúc phải có định dạng yyyy-mm-dd');
      }

      // Validate date range
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new Error('Ngày bắt đầu không thể sau ngày kết thúc');
      }

      // Backend uses 0-based page index
      const pageNumber = Math.max(1, Number(queryParams.pageNumber) || 1);
      const pageSize = Math.max(1, Number(queryParams.pageSize) || 10);
      const pageIndex = pageNumber - 1;

      // Build query parameters
      const params = new URLSearchParams({
        name: searchTerm,
        startDay: startDate,
        endDay: endDate,
        page: pageIndex.toString(),
        size: pageSize.toString()
      });

      // Add status parameter if provided
      if (status) {
        params.append('status', status);
      }

      const url = `/orders/find-Order-By-Name-And-Date/${userId}?${params.toString()}`;
      const response = await api.get(url);

      if (response?.data?.code !== 200) {
        throw new Error(response?.data?.message || 'Failed to search orders');
      }

      // Handle backend response format
      const pageData = response?.data?.result || {};
      const list = pageData?.content || [];

      // Extract pagination metadata
      const paginationData = pageData?.page || {};
      const backendPageSize = paginationData?.size || pageSize;
      const backendPageNumber = paginationData?.number || pageIndex;
      const totalElements = paginationData?.totalElements || 0;
      const totalPages = paginationData?.totalPages || 0;

      // Map orders to consistent format
      const mappedOrders = list.map(item => {
        const status = item.oderStatus || item.status || 'UNKNOWN';
        return {
          id: item.id,
          orderCode: item.orderCode || item.orderNumber || item.id,
          orderNumber: item.orderCode || item.orderNumber || item.id,
          totalAmount: item.totalAmount || 0,
          totalPrice: item.totalAmount || 0, // Keep for backward compatibility
          orderDate: item.orderDate || item.createdAt,
          createdAt: item.createdAt ?? item.orderDate ?? null,
          statusId: status,
          isSuccess: String(status).toUpperCase() === 'COMPLETED',
          orderDetails: item.orderItems || [],
          appliedVouchers: item.voucherId ? [{ id: item.voucherId }] : [],
          discountApplied: item.discountApplied || 0,
          shippingFee: item.shippingFee || 0,
          shippingAddress: item.shippingAddress || '',
          payment: item.payment || {},
          paymentMethod: item.payment?.method || '',
          paymentMethodName: item.payment?.method || '',
          note: item.note || ''
        };
      });

      // Convert backend 0-based page to UI 1-based page
      const currentPage = (backendPageNumber ?? pageIndex) + 1;

      return {
        metadata: {
          totalCount: totalElements,
          totalPages: totalPages,
          pageSize: backendPageSize,
          currentPage: currentPage,
          hasPrevious: currentPage > 1,
          hasNext: currentPage < totalPages
        },
        orders: mappedOrders,
      };
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  }

  /**
 * Create a new order from current user's selected cart items
 * Backend: POST /orders/create/{userId} or POST /orders/create/{userId}/{userAddressId}
 * @param {number} userId - Optional user ID (will use authenticated user if not provided)
 * @param {number} userAddressId - Optional address ID for the order
 */
  async createOrder(userId = null, userAddressId = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };

      // Get userId from parameter or authenticated user
      let finalUserId = userId;
      if (!finalUserId) {
        const user = await AuthService.info();
        finalUserId = user?.data?.id || user?.data?.userId;
      }

      if (!finalUserId) {
        throw new Error('Không xác định được người dùng để tạo đơn hàng');
      }

      // Build endpoint based on whether userAddressId is provided
      let endpoint;
      if (userAddressId) {
        endpoint = `/orders/create/${finalUserId}/${userAddressId}`;
        console.log(`📦 Creating order with address: userId=${finalUserId}, addressId=${userAddressId}`);
      } else {
        endpoint = `/orders/create/${finalUserId}`;
        console.log(`📦 Creating order without address: userId=${finalUserId}`);
      }

      const response = await api.post(endpoint, {}, headers);

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to create order');
      }

      console.log('✅ Order created successfully:', response.data.result);

      return {
        success: true,
        statusCode: response.data.code,
        message: response.data.message,
        data: response.data.result
      };
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  /**
   * Request to cancel an order
   * Backend: POST /orders/request-cancel-order/{orderId}
   * @param {number} orderId - The ID of the order to cancel
   * @returns {Promise} Promise containing the cancel request result
   */
  async requestCancelOrder(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // Get authenticated user ID for authorization
      const userId = await this._getAuthUserId();
      if (!userId) {
        throw new Error('Không xác định được người dùng. Vui lòng đăng nhập lại.');
      }

      const response = await api.patch(`/orders/request-cancel-order/${orderId}`, {
        userId: userId
      });

      if (response?.data?.code !== 200) {
        throw new Error(response?.data?.message || 'Failed to request order cancellation');
      }

      return response.data;
    } catch (error) {
      console.error('Error requesting order cancellation:', error);
      throw error;
    }
  }

}

export default new OrderService()

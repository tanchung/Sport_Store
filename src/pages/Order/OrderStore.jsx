import { create } from 'zustand'
import OrderService from '../../services/Order/OrderService'

/**
 * OrderStore - Quản lý trạng thái toàn cục cho các đơn hàng
 * Sử dụng Zustand để tạo store đơn giản và hiệu quả
 */
export const useOrderStore = create((set, get) => ({
  // State
  ordersPending: [],
  paginationPending: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  filtersPending: {
    statusId: null,
    searchTerm: '',
    sortBy: 'orderDate',
    sortAscending: false,
    startDate: null,
    endDate: null,
  },
  // Search state cho Pending orders
  searchPendingResults: [],
  searchPendingPagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  isSearchPendingMode: false,
  searchPendingLoading: false,
  searchPendingError: null,

  // Search state cho Processing orders
  searchProcessingResults: [],
  searchProcessingPagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  isSearchProcessingMode: false,
  searchProcessingLoading: false,
  searchProcessingError: null,

  // Search state cho CancelRequested orders
  searchCancelRequestedResults: [],
  searchCancelRequestedPagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  isSearchCancelRequestedMode: false,
  searchCancelRequestedLoading: false,
  searchCancelRequestedError: null,

  // Search state cho Confirmed orders
  searchConfirmedResults: [],
  searchConfirmedPagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  isSearchConfirmedMode: false,
  searchConfirmedLoading: false,
  searchConfirmedError: null,

  // Search state cho Shipping orders
  searchShippingResults: [],
  searchShippingPagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  isSearchShippingMode: false,
  searchShippingLoading: false,
  searchShippingError: null,

  // Thêm state cho PROCESSING
  ordersProcessing: [],
  paginationProcessing: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  filtersProcessing: {
    statusId: null,
    searchTerm: '',
    sortBy: 'orderDate',
    sortAscending: false,
    startDate: null,
    endDate: null,
  },

  // Thêm state cho CANCEL_REQUESTED
  ordersCancelRequested: [],
  paginationCancelRequested: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  filtersCancelRequested: {
    statusId: null,
    searchTerm: '',
    sortBy: 'orderDate',
    sortDirection: 'desc',
    startDate: null,
    endDate: null,
  },

  // Thêm state cho CONFIRMED
  ordersConfirmed: [],
  paginationConfirmed: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  filtersConfirmed: {
    statusId: null,
    searchTerm: '',
    sortBy: 'orderDate',
    sortAscending: false,
    startDate: null,
    endDate: null,
  },

  // Thêm state cho SHIPPING
  ordersShipping: [],
  paginationShipping: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  filtersShipping: {
    statusId: null,
    searchTerm: '',
    sortBy: 'orderDate',
    sortAscending: false,
    startDate: null,
    endDate: null,
  },

  ordersHistory: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {
    statusId: null,
    searchTerm: '',
    sortBy: 'orderDate',
    sortAscending: false,
    startDate: null,
    endDate: null,
  },
  statuses: [
    { id: null, value: 'Tất cả' },
    { id: 'PENDING', value: 'Chờ xác nhận' },
    { id: 'CANCEL_REQUESTED', value: 'Chờ xác nhận hủy' },
    { id: 'PROCESSING', value: 'Đang xử lý' },
    { id: 'CONFIRMED', value: 'Đã xác nhận' },
    { id: 'SHIPPING', value: 'Đang giao hàng' },
    { id: 'COMPLETED', value: 'Đã hoàn thành' },
    { id: 'CANCELLED', value: 'Đã hủy' },
  ],
  HistoryStatuses: [
    { id: null, value: 'Tất cả' },
    { id: 'COMPLETED', value: 'Đã hoàn thành' },
    { id: 'CANCELLED', value: 'Đã hủy' },
  ],

  // State cho chức năng tìm kiếm
  searchResults: [],
  searchPagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  searchFilters: {
    searchTerm: '',
    startDate: '',
    endDate: '',
  },
  isSearchMode: false,
  searchLoading: false,
  searchError: null,

  // Actions
  /**
   * Lấy danh sách đơn hàng đang xử lý với các tham số lọc và phân trang
   */
  fetchOrdersPending: async () => {
    try {
      set({ loading: true, error: null })

      const { filtersPending, paginationPending } = get()
      const queryParams = {
        pageNumber: paginationPending.currentPage,
        pageSize: paginationPending.pageSize,
        ...filtersPending,
      }

      const response = await OrderService.getPendingOrders(queryParams)

      set({
        ordersPending: response.orders,
        paginationPending: {
          ...get().paginationPending,
          totalItems: response.metadata.totalCount,
          totalPages: response.metadata.totalPages,
        },
        loading: false,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.fetchOrdersPending:', error)
      set({
        error:
          error.message ||
          'Có lỗi xảy ra khi tải danh sách đơn hàng đang xử lý',
        loading: false,
        ordersPending: [], // Set empty array on error to prevent UI issues
      })
      // Don't throw error to prevent UI crashes
    }
  },

  /**
   * Cập nhật các bộ lọc và tải lại đơn hàng đang xử lý
   * @param {Object} newFilters - Các bộ lọc mới
   */
  updatePendingFilters: newFilters => {
    set(state => ({
      filtersPending: {
        ...state.filtersPending,
        ...newFilters,
      },
      paginationPending: {
        ...state.paginationPending,
        currentPage: 1,
      },
    }))
    // Removed automatic API call - only manual actions should trigger API calls
  },

  /**
   * Thay đổi trang và tải đơn hàng đang xử lý mới
   * @param {number} pageNumber - Số trang mới
   */
  changePendingPage: async pageNumber => {
    set(state => ({
      paginationPending: {
        ...state.paginationPending,
        currentPage: pageNumber,
      },
    }))

    return await get().fetchOrdersPending()
  },

  /**
   * Thay đổi số lượng đơn hàng đang xử lý trên mỗi trang
   * @param {number} pageSize - Số lượng đơn hàng trên mỗi trang
   */
  changePendingPageSize: async pageSize => {
    set(state => ({
      paginationPending: {
        ...state.paginationPending,
        pageSize,
        currentPage: 1,
      },
    }))

    return await get().fetchOrdersPending()
  },

  // Thêm actions cho PROCESSING
  /**
   * Lấy danh sách đơn hàng đang xử lý với các tham số lọc và phân trang
   */
  fetchOrdersProcessing: async () => {
    try {
      set({ loading: true, error: null })

      const { filtersProcessing, paginationProcessing } = get()
      const queryParams = {
        pageNumber: paginationProcessing.currentPage,
        pageSize: paginationProcessing.pageSize,
        ...filtersProcessing,
      }

      const response = await OrderService.getProcessingOrders(queryParams)

      set({
        ordersProcessing: response.orders,
        paginationProcessing: {
          ...get().paginationProcessing,
          totalItems: response.metadata.totalCount,
          totalPages: response.metadata.totalPages,
        },
        loading: false,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.fetchOrdersProcessing:', error)
      set({
        error:
          error.message ||
          'Có lỗi xảy ra khi tải danh sách đơn hàng đang xử lý',
        loading: false,
        ordersProcessing: [], // Set empty array on error
      })
      // Don't throw error to prevent UI crashes
    }
  },

  /**
   * Cập nhật các bộ lọc và tải lại đơn hàng đang xử lý
   * @param {Object} newFilters - Các bộ lọc mới
   */
  updateProcessingFilters: newFilters => {
    set(state => ({
      filtersProcessing: {
        ...state.filtersProcessing,
        ...newFilters,
      },
      paginationProcessing: {
        ...state.paginationProcessing,
        currentPage: 1,
      },
    }))
    // Removed automatic API call - only manual actions should trigger API calls
  },

  /**
   * Thay đổi trang và tải đơn hàng đang xử lý mới
   * @param {number} pageNumber - Số trang mới
   */
  changeProcessingPage: async pageNumber => {
    set(state => ({
      paginationProcessing: {
        ...state.paginationProcessing,
        currentPage: pageNumber,
      },
    }))

    return await get().fetchOrdersProcessing()
  },

  /**
   * Thay đổi số lượng đơn hàng đang xử lý trên mỗi trang
   * @param {number} pageSize - Số lượng đơn hàng trên mỗi trang
   */
  changeProcessingPageSize: async pageSize => {
    set(state => ({
      paginationProcessing: {
        ...state.paginationProcessing,
        pageSize,
        currentPage: 1,
      },
    }))

    return await get().fetchOrdersProcessing()
  },

  // Thêm actions cho CANCEL_REQUESTED
  /**
   * Lấy danh sách đơn hàng chờ xác nhận hủy với các tham số lọc và phân trang
   */
  fetchOrdersCancelRequested: async () => {
    try {
      set({ loading: true, error: null })

      const { filtersCancelRequested, paginationCancelRequested } = get()
      const queryParams = {
        pageNumber: paginationCancelRequested.currentPage,
        pageSize: paginationCancelRequested.pageSize,
        ...filtersCancelRequested,
      }

      const response = await OrderService.getCancelRequestedOrders(queryParams)

      set({
        ordersCancelRequested: response.orders || [],
        paginationCancelRequested: {
          currentPage: response.metadata?.currentPage || 1,
          pageSize: response.metadata?.pageSize || 5,
          totalItems: response.metadata?.totalCount || 0,
          totalPages: response.metadata?.totalPages || 0,
        },
        loading: false,
        error: null,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.fetchOrdersCancelRequested:', error)
      set({
        error:
          error.message ||
          'Có lỗi xảy ra khi tải danh sách đơn hàng chờ xác nhận hủy',
        loading: false,
        ordersCancelRequested: [], // Set empty array on error
      })
      // Don't throw error to prevent UI crashes
    }
  },

  /**
   * Cập nhật các bộ lọc và tải lại đơn hàng chờ xác nhận hủy
   * @param {Object} newFilters - Các bộ lọc mới
   */
  updateCancelRequestedFilters: newFilters => {
    set(state => ({
      filtersCancelRequested: {
        ...state.filtersCancelRequested,
        ...newFilters,
      },
      paginationCancelRequested: {
        ...state.paginationCancelRequested,
        currentPage: 1,
      },
    }))
    // Removed automatic API call - only manual actions should trigger API calls
  },

  /**
   * Thay đổi trang và tải đơn hàng chờ xác nhận hủy mới
   * @param {number} pageNumber - Số trang mới
   */
  changeCancelRequestedPage: async pageNumber => {
    set(state => ({
      paginationCancelRequested: {
        ...state.paginationCancelRequested,
        currentPage: pageNumber,
      },
    }))

    return await get().fetchOrdersCancelRequested()
  },

  /**
   * Thay đổi số lượng đơn hàng chờ xác nhận hủy trên mỗi trang
   * @param {number} pageSize - Số lượng đơn hàng trên mỗi trang
   */
  changeCancelRequestedPageSize: async pageSize => {
    set(state => ({
      paginationCancelRequested: {
        ...state.paginationCancelRequested,
        pageSize,
        currentPage: 1,
      },
    }))

    return await get().fetchOrdersCancelRequested()
  },

  // Thêm actions cho CONFIRMED
  /**
   * Lấy danh sách đơn hàng đã xác nhận với các tham số lọc và phân trang
   */
  fetchOrdersConfirmed: async () => {
    try {
      set({ loading: true, error: null })

      const { filtersConfirmed, paginationConfirmed } = get()
      const queryParams = {
        pageNumber: paginationConfirmed.currentPage,
        pageSize: paginationConfirmed.pageSize,
        ...filtersConfirmed,
      }

      const response = await OrderService.getConfirmedOrders(queryParams)

      set({
        ordersConfirmed: response.orders,
        paginationConfirmed: {
          ...get().paginationConfirmed,
          totalItems: response.metadata.totalCount,
          totalPages: response.metadata.totalPages,
        },
        loading: false,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.fetchOrdersConfirmed:', error)
      set({
        error:
          error.message ||
          'Có lỗi xảy ra khi tải danh sách đơn hàng đã xác nhận',
        loading: false,
        ordersConfirmed: [], // Set empty array on error
      })
      // Don't throw error to prevent UI crashes
    }
  },

  /**
   * Cập nhật các bộ lọc và tải lại đơn hàng đã xác nhận
   * @param {Object} newFilters - Các bộ lọc mới
   */
  updateConfirmedFilters: newFilters => {
    set(state => ({
      filtersConfirmed: {
        ...state.filtersConfirmed,
        ...newFilters,
      },
      paginationConfirmed: {
        ...state.paginationConfirmed,
        currentPage: 1,
      },
    }))
    // Removed automatic API call - only manual actions should trigger API calls
  },

  /**
   * Thay đổi trang và tải đơn hàng đã xác nhận mới
   * @param {number} pageNumber - Số trang mới
   */
  changeConfirmedPage: async pageNumber => {
    set(state => ({
      paginationConfirmed: {
        ...state.paginationConfirmed,
        currentPage: pageNumber,
      },
    }))

    return await get().fetchOrdersConfirmed()
  },

  /**
   * Thay đổi số lượng đơn hàng đã xác nhận trên mỗi trang
   * @param {number} pageSize - Số lượng đơn hàng trên mỗi trang
   */
  changeConfirmedPageSize: async pageSize => {
    set(state => ({
      paginationConfirmed: {
        ...state.paginationConfirmed,
        pageSize,
        currentPage: 1,
      },
    }))

    return await get().fetchOrdersConfirmed()
  },

  // Thêm actions cho SHIPPING
  /**
   * Lấy danh sách đơn hàng đang giao với các tham số lọc và phân trang
   */
  fetchOrdersShipping: async () => {
    try {
      set({ loading: true, error: null })

      const { filtersShipping, paginationShipping } = get()
      const queryParams = {
        pageNumber: paginationShipping.currentPage,
        pageSize: paginationShipping.pageSize,
        ...filtersShipping,
      }

      const response = await OrderService.getShippingOrders(queryParams)

      set({
        ordersShipping: response.orders,
        paginationShipping: {
          ...get().paginationShipping,
          totalItems: response.metadata.totalCount,
          totalPages: response.metadata.totalPages,
        },
        loading: false,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.fetchOrdersShipping:', error)
      set({
        error:
          error.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng đang giao',
        loading: false,
        ordersShipping: [], // Set empty array on error
      })
      // Don't throw error to prevent UI crashes
    }
  },

  /**
   * Cập nhật các bộ lọc và tải lại đơn hàng đang giao
   * @param {Object} newFilters - Các bộ lọc mới
   */
  updateShippingFilters: newFilters => {
    set(state => ({
      filtersShipping: {
        ...state.filtersShipping,
        ...newFilters,
      },
      paginationShipping: {
        ...state.paginationShipping,
        currentPage: 1,
      },
    }))
    // Removed automatic API call - only manual actions should trigger API calls
  },

  /**
   * Thay đổi trang và tải đơn hàng đang giao mới
   * @param {number} pageNumber - Số trang mới
   */
  changeShippingPage: async pageNumber => {
    set(state => ({
      paginationShipping: {
        ...state.paginationShipping,
        currentPage: pageNumber,
      },
    }))

    return await get().fetchOrdersShipping()
  },

  /**
   * Thay đổi số lượng đơn hàng đang giao trên mỗi trang
   * @param {number} pageSize - Số lượng đơn hàng trên mỗi trang
   */
  changeShippingPageSize: async pageSize => {
    set(state => ({
      paginationShipping: {
        ...state.paginationShipping,
        pageSize,
        currentPage: 1,
      },
    }))

    return await get().fetchOrdersShipping()
  },

  /**
   * Lấy danh sách đơn hàng lịch sử với các tham số lọc và phân trang
   */
  fetchOrdersHistory: async () => {
    try {
      set({ loading: true, error: null })

      const { filters, pagination } = get()
      const queryParams = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...filters,
      }

      const response = await OrderService.getOrdersHistory(queryParams)

      set({
        ordersHistory: response.orders,
        pagination: {
          ...get().pagination,
          totalItems: response.metadata.totalCount,
          totalPages: response.metadata.totalPages,
        },
        loading: false,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.fetchOrdersHistory:', error)
      set({
        error:
          error.message || 'Có lỗi xảy ra khi tải danh sách lịch sử đơn hàng',
        loading: false,
        orders: [], // Set empty array on error
      })
      // Don't throw error to prevent UI crashes
    }
  },

  /**
   * Cập nhật các bộ lọc và tải lại đơn hàng lịch sử
   * @param {Object} newFilters - Các bộ lọc mới
   */
  updateFilters: newFilters => {
    set(state => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
      pagination: {
        ...state.pagination,
        currentPage: 1, // Reset về trang đầu tiên khi thay đổi bộ lọc
      },
    }))
    // Removed automatic API call - only manual actions should trigger API calls
  },

  /**
   * Thay đổi trang và tải đơn hàng lịch sử mới
   * @param {number} pageNumber - Số trang mới
   */
  changePage: async pageNumber => {
    set(state => ({
      pagination: {
        ...state.pagination,
        currentPage: pageNumber,
      },
    }))

    return await get().fetchOrdersHistory()
  },

  /**
   * Thay đổi số lượng đơn hàng lịch sử trên mỗi trang
   * @param {number} pageSize - Số lượng đơn hàng trên mỗi trang
   */
  changePageSize: async pageSize => {
    set(state => ({
      pagination: {
        ...state.pagination,
        pageSize,
        currentPage: 1,
      },
    }))

    return await get().fetchOrdersHistory()
  },

  /**
   * Hủy đơn hàng theo orderId
   * @param {string|number} orderId - ID của đơn hàng cần hủy
   * @returns {Promise} Promise chứa kết quả của việc hủy đơn hàng
   */
  cancelOrder: async (orderId) => {
    try {
      set({ loading: true, error: null })

      const response = await OrderService.requestCancelOrder(orderId)

      // Refresh tất cả các danh sách đơn hàng để cập nhật trạng thái
      await Promise.all([
        get().fetchOrdersPending(),
        get().fetchOrdersProcessing(), 
        get().fetchOrdersConfirmed(),
        get().fetchOrdersShipping(),
        get().fetchOrdersHistory()
      ])

      set({ loading: false })
      return response
    } catch (error) {
      console.error('Error in OrderStore.cancelOrder:', error)
      set({
        error: error.message || 'Có lỗi xảy ra khi hủy đơn hàng',
        loading: false,
      })
      throw error
    }
  },

  /**
   * Reset trạng thái của store về giá trị mặc định
   */
  resetStore: () => {
    set({
      ordersPending: [],
      paginationPending: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      filtersPending: {
        statusId: null,
        searchTerm: '',
        sortBy: 'orderDate',
        sortAscending: false,
        startDate: null,
        endDate: null,
      },

      ordersProcessing: [],
      paginationProcessing: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      filtersProcessing: {
        statusId: null,
        searchTerm: '',
        sortBy: 'orderDate',
        sortAscending: false,
        startDate: null,
        endDate: null,
      },

      ordersCancelRequested: [],
      paginationCancelRequested: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      filtersCancelRequested: {
        statusId: null,
        searchTerm: '',
        sortBy: 'orderDate',
        sortAscending: false,
        startDate: null,
        endDate: null,
      },

      ordersConfirmed: [],
      paginationConfirmed: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      filtersConfirmed: {
        statusId: null,
        searchTerm: '',
        sortBy: 'orderDate',
        sortAscending: false,
        startDate: null,
        endDate: null,
      },

      ordersShipping: [],
      paginationShipping: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      filtersShipping: {
        statusId: null,
        searchTerm: '',
        sortBy: 'orderDate',
        sortAscending: false,
        startDate: null,
        endDate: null,
      },

      ordersHistory: [],
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      filters: {
        statusId: null,
        searchTerm: '',
        sortBy: 'orderDate',
        sortAscending: false,
        startDate: null,
        endDate: null,
      },
    })
  },

  // Actions cho chức năng tìm kiếm
  /**
   * Tìm kiếm đơn hàng theo tên và khoảng thời gian
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.searchTerm - Từ khóa tìm kiếm
   * @param {string} searchParams.startDate - Ngày bắt đầu (yyyy-mm-dd)
   * @param {string} searchParams.endDate - Ngày kết thúc (yyyy-mm-dd)
   */
  searchOrders: async (searchParams = {}) => {
    try {
      set({ searchLoading: true, searchError: null })

      const { searchPagination } = get()
      const queryParams = {
        pageNumber: searchPagination.currentPage,
        pageSize: searchPagination.pageSize,
        searchTerm: searchParams.searchTerm || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
      }

      const response = await OrderService.searchOrdersByNameAndDate(queryParams)

      set({
        searchResults: response.orders,
        searchPagination: {
          ...get().searchPagination,
          totalItems: response.metadata.totalCount,
          totalPages: response.metadata.totalPages,
        },
        searchFilters: {
          searchTerm: searchParams.searchTerm || '',
          startDate: searchParams.startDate || '',
          endDate: searchParams.endDate || '',
        },
        isSearchMode: true,
        searchLoading: false,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.searchOrders:', error)
      set({
        searchError: error.message || 'Có lỗi xảy ra khi tìm kiếm đơn hàng',
        searchLoading: false,
        searchResults: [],
      })
      throw error
    }
  },

  /**
   * Thay đổi trang kết quả tìm kiếm
   * @param {number} pageNumber - Số trang mới
   */
  changeSearchPage: async (pageNumber) => {
    set(state => ({
      searchPagination: {
        ...state.searchPagination,
        currentPage: pageNumber,
      },
    }))

    const { searchFilters } = get()
    return await get().searchOrders(searchFilters)
  },

  /**
   * Thay đổi kích thước trang kết quả tìm kiếm
   * @param {number} pageSize - Kích thước trang mới
   */
  changeSearchPageSize: async (pageSize) => {
    set(state => ({
      searchPagination: {
        ...state.searchPagination,
        pageSize,
        currentPage: 1, // Reset về trang đầu tiên
      },
    }))

    const { searchFilters } = get()
    return await get().searchOrders(searchFilters)
  },

  /**
   * Xóa kết quả tìm kiếm và quay về chế độ xem thông thường
   */
  clearSearch: () => {
    set({
      searchResults: [],
      searchPagination: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      searchFilters: {
        searchTerm: '',
        startDate: '',
        endDate: '',
      },
      isSearchMode: false,
      searchLoading: false,
      searchError: null,
    })
  },

  /**
   * Cập nhật bộ lọc tìm kiếm và thực hiện tìm kiếm mới
   * @param {Object} newFilters - Bộ lọc mới
   */
  updateSearchFilters: async (newFilters) => {
    set(state => ({
      searchFilters: {
        ...state.searchFilters,
        ...newFilters,
      },
      searchPagination: {
        ...state.searchPagination,
        currentPage: 1, // Reset về trang đầu tiên khi thay đổi bộ lọc
      },
    }))

    const { searchFilters } = get()
    return await get().searchOrders(searchFilters)
  },

  // Actions cho tìm kiếm Pending orders
  /**
   * Tìm kiếm đơn hàng Pending theo tên và khoảng thời gian
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.searchTerm - Từ khóa tìm kiếm
   * @param {string} searchParams.startDate - Ngày bắt đầu (yyyy-mm-dd)
   * @param {string} searchParams.endDate - Ngày kết thúc (yyyy-mm-dd)
   */
  searchPendingOrders: async (searchParams = {}) => {
    try {
      set({ searchPendingLoading: true, searchPendingError: null })

      const { searchPendingPagination } = get()
      const queryParams = {
        pageNumber: searchPendingPagination.currentPage,
        pageSize: searchPendingPagination.pageSize,
        searchTerm: searchParams.searchTerm || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
        status: 'PENDING', // Add status parameter for pending orders
      }

      const response = await OrderService.searchOrdersByNameAndDate(queryParams)

      set({
        searchPendingResults: response.orders,
        searchPendingPagination: {
          ...get().searchPendingPagination,
          totalItems: response.metadata.totalCount,
          totalPages: response.metadata.totalPages,
        },
        isSearchPendingMode: true,
        searchPendingLoading: false,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.searchPendingOrders:', error)
      set({
        searchPendingError: error.message || 'Có lỗi xảy ra khi tìm kiếm đơn hàng',
        searchPendingLoading: false,
        searchPendingResults: [],
      })
      throw error
    }
  },

  /**
   * Xóa kết quả tìm kiếm Pending và quay về chế độ xem thông thường
   */
  clearPendingSearch: () => {
    set({
      searchPendingResults: [],
      searchPendingPagination: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      isSearchPendingMode: false,
      searchPendingLoading: false,
      searchPendingError: null,
    })
  },

  /**
   * Thay đổi trang kết quả tìm kiếm Pending
   * @param {number} pageNumber - Số trang mới
   */
  changeSearchPendingPage: async (pageNumber) => {
    set(state => ({
      searchPendingPagination: {
        ...state.searchPendingPagination,
        currentPage: pageNumber,
      },
    }))

    const state = get()
    if (!state || !state.filtersPending) {
      console.error('State or filtersPending is undefined')
      return
    }

    const { filtersPending } = state
    const searchParams = {
      searchTerm: filtersPending.searchTerm || '',
      startDate: filtersPending.startDate ? formatDate(filtersPending.startDate) : '',
      endDate: filtersPending.endDate ? formatDate(filtersPending.endDate) : '',
    }

    if (state.searchPendingOrders) {
      return await state.searchPendingOrders(searchParams)
    } else {
      console.error('searchPendingOrders function not found in state')
    }
  },

  // Search functions for Processing orders
  searchProcessingOrders: async (searchParams = {}) => {
    try {
      set({ searchProcessingLoading: true, searchProcessingError: null })

      const { searchProcessingPagination } = get()
      const queryParams = {
        pageNumber: searchProcessingPagination.currentPage,
        pageSize: searchProcessingPagination.pageSize,
        searchTerm: searchParams.searchTerm || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
        status: 'PROCESSING', // Add status parameter for processing orders
      }

      const response = await OrderService.searchOrdersByNameAndDate(queryParams)

      set({
        searchProcessingResults: response.orders,
        searchProcessingPagination: {
          ...get().searchProcessingPagination,
          totalItems: response.metadata.totalCount,
          totalPages: response.metadata.totalPages,
        },
        isSearchProcessingMode: true,
        searchProcessingLoading: false,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.searchProcessingOrders:', error)
      set({
        searchProcessingError: error.message || 'Có lỗi xảy ra khi tìm kiếm đơn hàng',
        searchProcessingLoading: false,
        searchProcessingResults: [],
      })
      throw error
    }
  },

  clearProcessingSearch: () => {
    set({
      searchProcessingResults: [],
      searchProcessingPagination: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      isSearchProcessingMode: false,
      searchProcessingLoading: false,
      searchProcessingError: null,
    })
  },

  changeSearchProcessingPage: async (pageNumber) => {
    set(state => ({
      searchProcessingPagination: {
        ...state.searchProcessingPagination,
        currentPage: pageNumber,
      },
    }))

    const state = get()
    const { filtersProcessing } = state
    const searchParams = {
      searchTerm: filtersProcessing.searchTerm || '',
      startDate: filtersProcessing.startDate ? formatDate(filtersProcessing.startDate) : '',
      endDate: filtersProcessing.endDate ? formatDate(filtersProcessing.endDate) : '',
    }

    return await state.searchProcessingOrders(searchParams)
  },

  // Search functions for CancelRequested orders
  searchCancelRequestedOrders: async (searchParams = {}) => {
    try {
      set({ searchCancelRequestedLoading: true, searchCancelRequestedError: null })

      const { searchCancelRequestedPagination } = get()
      const queryParams = {
        pageNumber: searchCancelRequestedPagination.currentPage,
        pageSize: searchCancelRequestedPagination.pageSize,
        searchTerm: searchParams.searchTerm || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
        status: 'CANCEL_REQUESTED', // Add status parameter for cancel requested orders
      }

      const response = await OrderService.searchOrdersByNameAndDate(queryParams)

      set({
        searchCancelRequestedResults: response.orders || [],
        searchCancelRequestedPagination: {
          currentPage: response.metadata?.currentPage || 1,
          pageSize: response.metadata?.pageSize || 5,
          totalItems: response.metadata?.totalCount || 0,
          totalPages: response.metadata?.totalPages || 0,
        },
        isSearchCancelRequestedMode: true,
        searchCancelRequestedLoading: false,
        searchCancelRequestedError: null,
      })

      return response
    } catch (error) {
      console.error('Error searching cancel requested orders:', error)
      // Suppress 404 errors for empty search results
      if (error.response?.status === 404 || error.message?.includes('404')) {
        set({
          searchCancelRequestedResults: [],
          searchCancelRequestedPagination: {
            currentPage: 1,
            pageSize: 5,
            totalItems: 0,
            totalPages: 0,
          },
          isSearchCancelRequestedMode: true,
          searchCancelRequestedLoading: false,
          searchCancelRequestedError: null,
        })
        return { orders: [], currentPage: 1, pageSize: 5, totalItems: 0, totalPages: 0 }
      }

      set({
        searchCancelRequestedError: error.message || 'Lỗi tìm kiếm đơn hàng chờ xác nhận hủy',
        searchCancelRequestedLoading: false,
        searchCancelRequestedResults: [],
      })
      throw error
    }
  },

  clearCancelRequestedSearch: () => {
    set({
      searchCancelRequestedResults: [],
      searchCancelRequestedPagination: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      isSearchCancelRequestedMode: false,
      searchCancelRequestedLoading: false,
      searchCancelRequestedError: null,
    })
  },

  changeSearchCancelRequestedPage: async (pageNumber) => {
    set(state => ({
      searchCancelRequestedPagination: {
        ...state.searchCancelRequestedPagination,
        currentPage: pageNumber,
      },
    }))

    const state = get()
    const { filtersCancelRequested } = state
    const searchParams = {
      searchTerm: filtersCancelRequested.searchTerm || '',
      startDate: filtersCancelRequested.startDate ? formatDate(filtersCancelRequested.startDate) : '',
      endDate: filtersCancelRequested.endDate ? formatDate(filtersCancelRequested.endDate) : '',
    }

    return await state.searchCancelRequestedOrders(searchParams)
  },

  changeSearchCancelRequestedPageSize: async (pageSize) => {
    set(state => ({
      searchCancelRequestedPagination: {
        ...state.searchCancelRequestedPagination,
        pageSize,
        currentPage: 1,
      },
    }))

    const state = get()
    const { filtersCancelRequested } = state
    const searchParams = {
      searchTerm: filtersCancelRequested.searchTerm || '',
      startDate: filtersCancelRequested.startDate ? formatDate(filtersCancelRequested.startDate) : '',
      endDate: filtersCancelRequested.endDate ? formatDate(filtersCancelRequested.endDate) : '',
    }

    return await state.searchCancelRequestedOrders(searchParams)
  },

  // Search functions for Confirmed orders
  searchConfirmedOrders: async (searchParams = {}) => {
    try {
      set({ searchConfirmedLoading: true, searchConfirmedError: null })

      const { searchConfirmedPagination } = get()
      const queryParams = {
        pageNumber: searchConfirmedPagination.currentPage,
        pageSize: searchConfirmedPagination.pageSize,
        searchTerm: searchParams.searchTerm || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
        status: 'CONFIRMED', // Add status parameter for confirmed orders
      }

      const response = await OrderService.searchOrdersByNameAndDate(queryParams)

      set({
        searchConfirmedResults: response.orders,
        searchConfirmedPagination: {
          ...get().searchConfirmedPagination,
          totalItems: response.metadata.totalCount,
          totalPages: response.metadata.totalPages,
        },
        isSearchConfirmedMode: true,
        searchConfirmedLoading: false,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.searchConfirmedOrders:', error)
      set({
        searchConfirmedError: error.message || 'Có lỗi xảy ra khi tìm kiếm đơn hàng',
        searchConfirmedLoading: false,
        searchConfirmedResults: [],
      })
      throw error
    }
  },

  clearConfirmedSearch: () => {
    set({
      searchConfirmedResults: [],
      searchConfirmedPagination: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      isSearchConfirmedMode: false,
      searchConfirmedLoading: false,
      searchConfirmedError: null,
    })
  },

  changeSearchConfirmedPage: async (pageNumber) => {
    set(state => ({
      searchConfirmedPagination: {
        ...state.searchConfirmedPagination,
        currentPage: pageNumber,
      },
    }))

    const state = get()
    const { filtersConfirmed } = state
    const searchParams = {
      searchTerm: filtersConfirmed.searchTerm || '',
      startDate: filtersConfirmed.startDate ? formatDate(filtersConfirmed.startDate) : '',
      endDate: filtersConfirmed.endDate ? formatDate(filtersConfirmed.endDate) : '',
    }

    return await state.searchConfirmedOrders(searchParams)
  },

  // Search functions for Shipping orders
  searchShippingOrders: async (searchParams = {}) => {
    try {
      set({ searchShippingLoading: true, searchShippingError: null })

      const { searchShippingPagination } = get()
      const queryParams = {
        pageNumber: searchShippingPagination.currentPage,
        pageSize: searchShippingPagination.pageSize,
        searchTerm: searchParams.searchTerm || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
        status: 'SHIPPING', // Add status parameter for shipping orders
      }

      const response = await OrderService.searchOrdersByNameAndDate(queryParams)

      set({
        searchShippingResults: response.orders,
        searchShippingPagination: {
          ...get().searchShippingPagination,
          totalItems: response.metadata.totalCount,
          totalPages: response.metadata.totalPages,
        },
        isSearchShippingMode: true,
        searchShippingLoading: false,
      })

      return response
    } catch (error) {
      console.error('Error in OrderStore.searchShippingOrders:', error)
      set({
        searchShippingError: error.message || 'Có lỗi xảy ra khi tìm kiếm đơn hàng',
        searchShippingLoading: false,
        searchShippingResults: [],
      })
      throw error
    }
  },

  clearShippingSearch: () => {
    set({
      searchShippingResults: [],
      searchShippingPagination: {
        currentPage: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
      },
      isSearchShippingMode: false,
      searchShippingLoading: false,
      searchShippingError: null,
    })
  },

  changeSearchShippingPage: async (pageNumber) => {
    set(state => ({
      searchShippingPagination: {
        ...state.searchShippingPagination,
        currentPage: pageNumber,
      },
    }))

    const state = get()
    const { filtersShipping } = state
    const searchParams = {
      searchTerm: filtersShipping.searchTerm || '',
      startDate: filtersShipping.startDate ? formatDate(filtersShipping.startDate) : '',
      endDate: filtersShipping.endDate ? formatDate(filtersShipping.endDate) : '',
    }

    return await state.searchShippingOrders(searchParams)
  },
}))

// Helper function để format date
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default useOrderStore

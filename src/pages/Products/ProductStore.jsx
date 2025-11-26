import { create } from 'zustand';
import ProductService from '../../services/Product/ProductServices';
import CategoryService from '../../services/Category/CategoryServices';
import CartService from '../../services/Cart/CartService';

export const useProductStore = create((set, get) => ({
  // State
  products: [],
  productDetails: null,
  loading: false,
  error: null,
  cartLoading: false,
  cartError: null,
  cartMessage: null,
  pagination: {
    currentPage: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false
  },
  filters: {
    categoryId: null,
    trendId: null,
    searchTerm: '',
    sortBy: 'ProductName',
    sortAscending: true,
    category: '',
    brand: '',
    priceMin: '',
    priceMax: ''
  },
  categories: [
    { id: null, value: 'Tất cả' },
  ],
  categoriesLoading: false,

  // Actions
  fetchCategories: async () => {
    try {
      set({ categoriesLoading: true });
      const response = await CategoryService.getAllCategories();
      // Xử lý an toàn cho category response
      let categoriesData = [];
      if (Array.isArray(response)) categoriesData = response;
      else if (Array.isArray(response.data)) categoriesData = response.data;
      else if (response.result && Array.isArray(response.result)) categoriesData = response.result;
      
      const formattedCategories = [
        { id: null, value: 'Tất cả' },
        ...categoriesData.map(category => ({
          id: category.id,
          value: category.name
        }))
      ];
      
      set({ categories: formattedCategories, categoriesLoading: false });
      return formattedCategories;
    } catch (error) {
      console.error('Error fetchCategories:', error);
      set({ categoriesLoading: false });
    }
  },

  /**
   * Fetch Products - PHIÊN BẢN "BÓC TÁCH" DỮ LIỆU
   * Tự động tìm 'content' và 'page' dù nó nằm sâu bao nhiêu lớp
   */
  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      
      const { filters, pagination } = get();
      console.log('🎯 FETCH PRODUCTS - Current pagination:', pagination);
      
      const apiPageNumber = pagination.currentPage > 0 ? pagination.currentPage - 1 : 0;
      console.log('🎯 FETCH PRODUCTS - API pageNumber (0-based):', apiPageNumber);

      const queryParams = {
        pageNumber: apiPageNumber, 
        pageSize: pagination.pageSize,
        ...filters
      };
      
      console.log('🎯 FETCH PRODUCTS - Query params:', queryParams);

      // Gọi API
      const rawResponse = await ProductService.getProducts(queryParams);

      console.log('🚀 RAW RESPONSE TỪ SERVICE:', rawResponse);
      console.log('🔍 Response Type:', typeof rawResponse);
      console.log('🔍 Response Keys:', Object.keys(rawResponse || {}));

      // --- BƯỚC 1: XỬ LÝ RESPONSE TỪ SERVICE ---
      // ProductService trả về: { metadata: {...}, products: [...] }
      const productsList = rawResponse?.products || [];
      const metadata = rawResponse?.metadata || {};
      
      console.log('📦 PRODUCTS LIST LENGTH:', productsList.length);
      console.log('📊 METADATA:', JSON.stringify(metadata, null, 2));

      // --- BƯỚC 2: TRÍCH XUẤT PAGINATION INFO ---
      const totalItems = metadata.totalCount || 0;
      const totalPages = metadata.totalPages || 0;
      const currentApiPage = (metadata.currentPage || 1) - 1; // Convert to 0-based
      const actualPageSize = metadata.pageSize || pagination.pageSize || 12;
      
      console.log('✅ KẾT QUẢ CUỐI CÙNG:', { 
        totalItems, 
        totalPages, 
        currentApiPage: currentApiPage + 1, // Show 1-based in log
        actualPageSize,
        productsCount: productsList.length,
        hasPrevious: metadata.hasPrevious,
        hasNext: metadata.hasNext
      });

      const newPagination = {
        ...get().pagination,
        totalItems: Number(totalItems),
        totalPages: Number(totalPages),
        currentPage: Number(currentApiPage) + 1, // Store as 1-based
        pageSize: Number(actualPageSize),
        hasPrevious: Boolean(metadata.hasPrevious),
        hasNext: Boolean(metadata.hasNext)
      };

      set({
        products: productsList,
        pagination: newPagination,
        loading: false
      });
      
      return rawResponse;
    } catch (error) {
      console.error('❌ Error fetchProducts:', error);
      set({ 
        error: error.message || 'Lỗi tải sản phẩm', 
        loading: false, 
        products: [] 
      });
    }
  },

  fetchProductDetails: async (productId) => {
    try {
      set({ loading: true, productDetails: null });
      const response = await ProductService.getProductById(productId);
      set({ productDetails: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addCart: async (productId, quantity, productSizeId) => {
    try {
      set({ cartLoading: true, cartError: null, cartMessage: null });
      if (!productSizeId) throw new Error('Chưa chọn size');
      const response = await CartService.addToCart(productId, quantity, productSizeId);
      set({ cartLoading: false, cartMessage: response.message });
      return response;
    } catch (error) {
      set({ cartError: error.message, cartLoading: false });
    }
  },

  updateFilters: async (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, currentPage: 1 }
    }));
    return await get().fetchProducts();
  },

  changePage: async (pageNumber) => {
    console.log('🔄 CHANGE PAGE CALLED:', pageNumber);
    
    // Set pagination state trước
    set(state => {
      console.log('📄 Current pagination before change:', state.pagination);
      return {
        pagination: { ...state.pagination, currentPage: pageNumber }
      };
    });
    
    console.log('📄 New pagination after change:', get().pagination);
    
    // ĐỢI state update xong, sau đó fetch với pageNumber mới
    // Sử dụng setTimeout để đảm bảo state đã được cập nhật
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const updatedPagination = get().pagination;
    console.log('📄 Pagination RIGHT BEFORE FETCH:', updatedPagination);
    
    return await get().fetchProducts();
  },

  changePageSize: async (pageSize) => {
    set(state => ({
      pagination: { ...state.pagination, pageSize, currentPage: 1 }
    }));
    return await get().fetchProducts();
  },

  updateCategoryFilter: async (v) => get().updateFilters({ category: v }),
  updateBrandFilter: async (v) => get().updateFilters({ brand: v }),
  updatePriceFilter: async (min, max) => get().updateFilters({ priceMin: min, priceMax: max }),
  
  clearAllFilters: async () => {
    set(state => ({
      filters: {
        categoryId: null, trendId: null, searchTerm: '', sortBy: 'ProductName', sortAscending: true,
        category: '', brand: '', priceMin: '', priceMax: ''
      },
      pagination: { ...state.pagination, currentPage: 1 }
    }));
    return await get().fetchProducts();
  },

  resetStore: () => {
    set({
      products: [], productDetails: null, loading: false, error: null,
      pagination: { currentPage: 1, pageSize: 12, totalItems: 0, totalPages: 0 },
      filters: { category: '', brand: '', priceMin: '', priceMax: '', searchTerm: '', sortBy: 'ProductName', sortAscending: true }
    });
  }
}));

export default useProductStore;
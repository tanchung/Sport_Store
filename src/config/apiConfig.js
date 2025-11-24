const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const apiConfig = {
  API_BASE_URL,
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    VERIFY_CODE: '/auth/verify-code',
    RESEND_EMAIL: '/auth/resend-email',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  PRODUCTS: {
    GET_ALL: '/products/getall',
    GET_PAGINATED: '/products',
    GET_PRODUCTS: '/products/get-products',
    GET_PRODUCTS_FILTER: '/products/get-products/filter',
    GET_BY_ID: '/products/getproduct/{id}/id',
    CREATE: '/products/create',
    UPDATE: '/products/update/{id}',
    DELETE: '/products/delete/{id}'
  },
  CART: {
    GET_CART: '/cart/get-cart/{id}',
    DELETE_CART: '/cart/delete-cart/{id}'
  },
  CART_ITEM: {
    ADD_ITEM: '/cartItem/add-cartItem',
    REMOVE_ITEM: '/cartItem/remove-cartItem',
    UPDATE_QUANTITY: '/cartItem/update-quantity',
    GET_ITEMS: '/cartItem/get-item/{cartId}',
    UPDATE_SELECTION: '/cartItem/selected/{id}'
  },
  CATEGORY: {
    GET_ALL: '/category/getall',
    GET_BY_ID: '/category/getcategory/{id}',
    GET_BY_NAME: '/category/getcategory/{name}',
    CREATE: '/category/create'
  },
  ORDERS: {
    CREATE: '/orders/create/{userId}',
    GET_BY_ID: '/orders/get-order/{orderId}',
    GET_HISTORY: '/orders/history-order/{userId}',
    APPLY_VOUCHER: '/orders/applyVoucher/{orderId}',
    TEST_VOUCHER: '/orders/applyVoucher/{orderId}'
  },
  VOUCHER: {
    GET_ALL: '/voucher/getAll',
    GET_BY_ID: '/voucher/getVoucher/{id}',
    CREATE: '/voucher/create',
    DELETE: '/voucher/delete/{id}'
  }
};

export default apiConfig;
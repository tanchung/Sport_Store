import api from "@services/apiClient";
import AuthService from "@services/Auth/AuthServices";

class CartService {
  /**
   * Get product image URL with proper fallback
   * @param {Array} images - Array of ImageDto objects from backend
   * @returns {string} Image URL or fallback
   */
  static getProductImageUrl(images) {
    // Check if images array exists and has items
    if (images && images.length > 0) {
      const firstImage = images[0];
      // Backend ImageDto has downloadUrl field
      if (firstImage.downloadUrl) {
        return this.normalizeImageUrl(firstImage.downloadUrl);
      }
    }

    // Return a working fallback image - use a data URL for a simple placeholder
    return this.getDefaultProductImage();
  }

  /**
   * Normalize image URL to handle both Cloudinary URLs and backend download URLs
   * @param {string} url - Image URL from backend
   * @returns {string} Normalized image URL
   */
  static normalizeImageUrl(url) {
    // If it's already a full URL (Cloudinary), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative URL, convert to backend download endpoint
    if (url.startsWith('api/v1/images/download/') || url.startsWith('/api/v1/images/download/')) {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const imageId = url.split('/').pop(); // Extract image ID
      return `${API_BASE_URL}/image/download/${imageId}`;
    }

    // If it's just an image ID or other format, construct the download URL
    if (/^\d+$/.test(url)) {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      return `${API_BASE_URL}/image/download/${url}`;
    }

    // Return as is for other cases
    return url;
  }

  /**
   * Get default product image as data URL to avoid external dependency
   * @returns {string} Data URL for default image
   */
  static getDefaultProductImage() {
    // Simple 150x150 gray placeholder as data URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEg5MFY5MEg2MFY2MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K';
  }

  /**
   * Get the current user's cart ID from authentication context
   * @returns {Promise<number>} Cart ID
   */
  static async getCurrentUserCartId() {
    try {
      const userInfo = await AuthService.info();
      if (userInfo.status === 200 && userInfo.data && userInfo.data.cart) {
        return userInfo.data.cart.id;
      }
      throw new Error('User cart not found');
    } catch (error) {
      console.error('Error getting user cart ID:', error);
      throw new Error('Failed to get user cart ID. Please ensure you are logged in.');
    }
  }

  static async fetchCartItems(PageNumber = 1, PageSize = 10, cartId = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      // Get the user's cart ID if not provided
      const targetCartId = cartId || await this.getCurrentUserCartId();

      // Use backend shopping_cart API endpoint
      const response = await api.get(`/cartItem/get-item/${targetCartId}`, {}, headers);

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to fetch cart items');
      }

      const cartItems = response.data.result.map(item => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        priceDefault: item.product.price,
        price: item.unitPrice,
        quantity: item.quantity,
        image: this.getProductImageUrl(item.product.images),
        size: "",
        available: item.product.inventory,
        selected: item.selected,
        totalPrice: item.totalPrice
      }));

      // Since backend doesn't provide pagination for cart items, we'll simulate it
      const startIndex = (PageNumber - 1) * PageSize;
      const endIndex = startIndex + PageSize;
      const paginatedItems = cartItems.slice(startIndex, endIndex);

      const metadata = {
        totalPages: Math.ceil(cartItems.length / PageSize),
        pageSize: PageSize,
        totalCount: cartItems.length,
        hasPrevious: PageNumber > 1,
        hasNext: endIndex < cartItems.length
      };

      return {
        items: paginatedItems,
        metadata: metadata
      };
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return {
        items: [],
        metadata: {
          totalPages: 0,
          pageSize: PageSize,
          totalCount: 0,
          hasPrevious: false,
          hasNext: false
        }
      };
    }
  }

  static async fetchAllCartItems(cartId = null) {
    try {
      // Get the user's cart ID if not provided
      const targetCartId = cartId || await this.getCurrentUserCartId();

      // Use backend shopping_cart API endpoint
      const response = await api.get(`/cartItem/get-item/${targetCartId}`, {}, {
        'Content-Type': 'application/json'
      });

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to fetch cart items');
      }

      const cartItems = response.data.result.map(item => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        priceDefault: item.product.price,
        price: item.unitPrice,
        quantity: item.quantity,
        image: this.getProductImageUrl(item.product.images),
        sizeId: item.productSizeId,
        sizeName: undefined,
        available: item.product.inventory,
        selected: item.selected,
        totalPrice: item.totalPrice
      }));

      return {
        items: cartItems,
        metadata: {
          totalCount: cartItems.length,
          totalPages: 1,
          pageSize: cartItems.length,
          hasPrevious: false,
          hasNext: false
        }
      };
    } catch (error) {
      console.error('Error fetching all cart items:', error);
      return { items: [], metadata: { totalCount: 0 } };
    }
  }

  static async addToCart(productId, quantity, productSizeId, cartId = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      // Validate required params
      if (!productId) throw new Error('productId is required');
      if (!quantity || quantity <= 0) throw new Error('quantity must be greater than 0');
      if (!productSizeId) throw new Error('productSizeId is required');

      // Get the user's cart ID if not provided
      const targetCartId = cartId || await this.getCurrentUserCartId();

      // If no cart ID available, throw a clear error for the caller to handle gracefully
      if (!targetCartId) {
        throw new Error('Unable to add to cart: user cart not available. Please ensure you are logged in.');
      }

      // Use backend shopping_cart API endpoint
      const params = new URLSearchParams();
      params.append('cartId', targetCartId);
      params.append('productId', productId);
      params.append('quantity', quantity);
      params.append('productSizeId', productSizeId);

      const response = await api.post(`/cartItem/add-cartItem?${params.toString()}`, {}, headers);

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to add item to cart');
      }

      return {
        statusCode: response.data.code,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  static async updateCartItem(cartIdOrItemId, productIdOrQuantity, quantity = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      let cartId, productId, targetQuantity;

      // Handle backward compatibility - if only two parameters are passed, it's the old signature
      if (quantity === null) {
        // Old signature: updateCartItem(itemId, quantity)
        // We need to find the cartId and productId from the item
        cartId = await this.getCurrentUserCartId();
        productId = cartIdOrItemId; // Assume itemId is productId
        targetQuantity = productIdOrQuantity;
        console.warn('Using backward compatibility mode for updateCartItem. Consider updating to use cartId, productId, quantity.');
      } else {
        // New signature: updateCartItem(cartId, productId, quantity)
        cartId = cartIdOrItemId || await this.getCurrentUserCartId();
        productId = productIdOrQuantity;
        targetQuantity = quantity;
      }

      // Use backend shopping_cart API endpoint
      const params = new URLSearchParams();
      params.append('cartId', cartId);
      params.append('productId', productId);
      params.append('quantity', targetQuantity);

      const response = await api.put(`/cartItem/update-quantity?${params.toString()}`, {}, headers);

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to update cart item');
      }

      return {
        statusCode: response.data.code,
        message: response.data.message,
        data: response.data.result
      };
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  static async deleteCartItem(cartIdOrItemId, productId = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      let cartId, targetProductId;

      // Handle backward compatibility - if only one parameter is passed, it's the old itemId
      if (productId === null) {
        // Old signature: deleteCartItem(itemId)
        // We need to find the cartId and productId from the item
        cartId = await this.getCurrentUserCartId();
        targetProductId = cartIdOrItemId;
        console.warn('Using backward compatibility mode for deleteCartItem. Consider updating to use cartId and productId.');
      } else {
        // New signature: deleteCartItem(cartId, productId)
        cartId = cartIdOrItemId || await this.getCurrentUserCartId();
        targetProductId = productId;
      }

      // Use backend shopping_cart API endpoint
      const params = new URLSearchParams();
      params.append('cartId', cartId);
      params.append('cartItemId', targetProductId);

      const response = await api.post(`/cartItem/remove-cartItem?${params.toString()}`, {}, headers);

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to remove cart item');
      }

      return {
        statusCode: response.data.code,
        message: response.data.message,
        data: response.data.result
      };
    } catch (error) {
      console.error('Error deleting cart item:', error);
      throw error;
    }
  }

  // New method to update item selection status
  static async updateCartItemSelection(cartItemId, selected) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      // Use backend shopping_cart API endpoint
      const params = new URLSearchParams();
      params.append('selected', selected);

      const response = await api.patch(`/cartItem/selected/${cartItemId}?${params.toString()}`, {}, headers);

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to update cart item selection');
      }

      return {
        statusCode: response.data.code,
        message: response.data.message,
        data: response.data.result
      };
    } catch (error) {
      console.error('Error updating cart item selection:', error);
      throw error;
    }
  }
}

export default CartService;
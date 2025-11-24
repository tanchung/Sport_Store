import api from '@services/apiClient';

class ProductSizeService {
  /**
   * Get sizes for a given product
   * Backend: GET /product-size/{productId}
   * Returns ApiResponse<List<ProductSize>>
   */
  async getByProductId(productId) {
    const res = await api.public.get(`/product-size/${productId}`);
    if (res?.data?.code !== 200) {
      throw new Error(res?.data?.message || 'Failed to fetch product sizes');
    }
    const raw = res.data.result || [];
    // Normalize to ensure UI has sizeName while preserving id for API
    return raw.map(item => ({
      id: item.id,
      sizeId: item.sizeId || item.size?.id || item.sizeName, // backend may return various shapes
      sizeName: item.sizeName || item.size?.sizeName || item.size?.name || item.size || item.label || String(item.id),
      raw: item
    }));
  }

  /**
   * Get a single productSize by id and normalize to include sizeName
   */
  async getById(productSizeId) {
    const res = await api.public.get(`/product-size/get-by-id/${productSizeId}`);
    if (res?.data?.code !== 200) {
      throw new Error(res?.data?.message || 'Failed to fetch product size');
    }
    const item = res.data.result;
    return {
      id: item.id,
      sizeId: item.sizeId || item.size?.id || item.sizeName,
      sizeName: item.sizeName || item.size?.sizeName || item.size?.name || item.size || String(item.id),
      raw: item,
    };
  }
}

export default new ProductSizeService();


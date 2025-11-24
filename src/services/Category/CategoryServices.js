import api from "@services/apiClient";

class CategoryService {

    async getAllCategories() {
        try {
            // Use backend shopping_cart API endpoint (public, no authentication required)
            const response = await api.public.get('/category/getall');

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch categories');
            }

            // Map the backend response to match frontend expectations
            const categories = response.data.result.map(category => ({
                id: category.id,
                name: category.name,
                value: category.name
            }));

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: categories
            };
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    async getAllCollections() {
        try {
            // Use backend shopping_cart API endpoint for collections (public)
            const response = await api.public.get('/collection/get-all');

            // Debug: Log the actual response structure
            console.log('Collections API Response:', response);
            console.log('Collections Response data:', response.data);

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch collections');
            }

            // Map the backend response to match frontend expectations
            const collections = response.data.result.map(collection => ({
                id: collection.id,
                name: collection.name,
                description: collection.description,
                imageUrl: collection.imageUrl,
                alt: collection.name
            }));

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: collections
            };
        } catch (error) {
            console.error('Error fetching collections:', error);
            throw error;
        }
    }

    async getCollectionById(id) {
        try {
            // Use backend shopping_cart API endpoint (public)
            const response = await api.public.get(`/collection/get-collection-by-id/${id}`);

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch collection');
            }

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error fetching collection:', error);
            throw error;
        }
    }

    async getProductsByCollectionId(collectionId) {
        try {
            // Use backend shopping_cart API endpoint (public)
            const response = await api.public.get(`/collection/get-all-products-by-collection-id/${collectionId}`);

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch collection products');
            }

            // Map the products to include proper image handling
            const mappedProducts = response.data.result.map(item => ({
                id: item.id,
                name: item.name,
                description: item.description || '',
                price: item.price || 0,
                brand: item.brand || '',
                inventory: item.inventory || 0,
                discountPercentage: item.discountPercentage || 0,
                images: item.images || [],
                thumbnail: this.getProductImageUrl(item.images || []),
                downloadUrl: item.images && item.images.length > 0 ? item.images[0].downloadUrl : null,
                imageUrl: item.images && item.images.length > 0 ? item.images[0].downloadUrl : null
            }));

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: mappedProducts
            };
        } catch (error) {
            console.error('Error fetching collection products:', error);
            throw error;
        }
    }

    /**
     * Get product image URL with proper fallback
     * @param {Array} images - Array of ImageDto objects from backend
     * @returns {string} Image URL or fallback
     */
    getProductImageUrl(images) {
        // Check if images array exists and has items
        if (images && images.length > 0) {
            const firstImage = images[0];
            // Backend ImageDto has downloadUrl field
            if (firstImage.downloadUrl) {
                return this.normalizeImageUrl(firstImage.downloadUrl);
            }
        }

        // Return a working fallback image
        return this.getDefaultProductImage();
    }

    /**
     * Normalize image URL to handle both Cloudinary URLs and backend download URLs
     * @param {string} url - Image URL from backend
     * @returns {string} Normalized image URL
     */
    normalizeImageUrl(url) {
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
    getDefaultProductImage() {
        // Simple 150x150 gray placeholder as data URL
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEg5MFY5MEg2MFY2MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K';
    }

    async getCategoryById(id) {
        try {
            // Use backend shopping_cart API endpoint
            const response = await api.get(`/category/getcategory/${id}`);

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch category');
            }

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error fetching category:', error);
            throw error;
        }
    }

    async getCategoryByName(name) {
        try {
            // Use backend shopping_cart API endpoint
            const response = await api.get(`/category/getcategory/${name}`);

            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch category');
            }

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: response.data.result
            };
        } catch (error) {
            console.error('Error fetching category:', error);
            throw error;
        }
    }

}

export default new CategoryService();
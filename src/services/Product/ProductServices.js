import api from "@services/apiClient";

class ProductService {
    /**
     * Map frontend sort fields to backend entity fields
     * @param {string} frontendField - Frontend sort field name
     * @returns {string} Backend entity field name
     */
    mapSortField(frontendField) {
        const fieldMapping = {
            'ProductName': 'name',
            'productName': 'name',
            'Price': 'price',
            'price': 'price',
            'priceActive': 'price',
            'priceDefault': 'price',
            'price-low-high': 'price',
            'price-high-low': 'price',
            'Brand': 'brand',
            'brand': 'brand',
            'Inventory': 'inventory',
            'inventory': 'inventory',
            'stockquantity': 'inventory',
            'Description': 'description',
            'description': 'description',
            'default': 'name'
        };

        return fieldMapping[frontendField] || frontendField;
    }

    /**
     * Get sort field and direction based on frontend sort parameters
     * @param {string} sortBy - Frontend sort field
     * @param {boolean} sortAscending - Frontend sort direction
     * @returns {Object} Object with field and direction properties
     */
    getSortInfo(sortBy, sortAscending) {
        // Handle special price sorting cases
        if (sortBy === 'price-low-high') {
            return { field: 'price', direction: 'asc' };
        }
        if (sortBy === 'price-high-low') {
            return { field: 'price', direction: 'desc' };
        }

        // Handle default and other cases
        const field = this.mapSortField(sortBy) || 'name';
        const direction = sortAscending !== false ? 'asc' : 'desc';

        return { field, direction };
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

        // Return a working fallback image - use a data URL for a simple placeholder
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

    /**
     * Get products with pagination and filtering
     * @param {Object} queryParams - Query parameters for filtering and pagination
     * @param {number} queryParams.pageNumber - Current page number (starting from 1)
     * @param {number} queryParams.pageSize - Number of items per page (max 20)
     * @param {string} [queryParams.categoryId] - Optional category ID filter
     * @param {string} [queryParams.trendId] - Optional trend ID filter
     * @param {string} [queryParams.searchTerm] - Optional search term
     * @param {string} [queryParams.sortBy] - Sort field (default: "ProductName")
     * @param {boolean} [queryParams.sortAscending] - Sort direction (default: true)
     * @param {string} [queryParams.category] - Optional category filter
     * @param {string} [queryParams.brand] - Optional brand filter
     * @param {number} [queryParams.priceMin] - Optional minimum price filter
     * @param {number} [queryParams.priceMax] - Optional maximum price filter
     * @returns {Promise} Promise containing the products data
     */
    async getProducts(queryParams) {
        try {
            let response;

            // Always use the working /products/get-products endpoint with query parameters
            // This endpoint supports: pageNumber, pageSize, category, brand, properties, sortDir, minPrice, maxPrice
            const sortInfo = this.getSortInfo(queryParams.sortBy, queryParams.sortAscending);

            const queryParamsForAPI = {
                pageNumber: ((queryParams.pageNumber || 1) - 1).toString(), // Convert to 0-based string
                pageSize: (queryParams.pageSize || 10 ).toString(),
                properties: sortInfo.field || 'name',
                sortDir: sortInfo.direction || 'asc',
                category: queryParams.category || queryParams.categoryId || '',
                brand: queryParams.brand || ''
            };

            // Add price filters if they exist
            // if (queryParams.priceMin !== undefined && queryParams.priceMin !== '') {
            //     queryParamsForAPI.minPrice = queryParams.priceMin.toString();
            // }
            // if (queryParams.priceMax !== undefined && queryParams.priceMax !== '') {
            //     queryParamsForAPI.maxPrice = queryParams.priceMax.toString();
            // }
            if (queryParams?.priceMin != null && queryParams.priceMin !== '') {
                queryParamsForAPI.minPrice = queryParams.priceMin.toString();
            }

            if (queryParams?.priceMax != null && queryParams.priceMax !== '') {
                queryParamsForAPI.maxPrice = queryParams.priceMax.toString();
            }

            // Use authenticated GET request (includes Authorization header)
            response = await api.public.get('/products/get-products', queryParamsForAPI);

            // Debug: Log the actual response structure
            console.log('API Response:', response);
            console.log('Response data:', response.data);
            console.log('Response data result:', response.data?.result);

            // Check if response has the expected structure
            if (!response.data || !response.data.result) {
                console.error('Invalid response structure. Full response:', JSON.stringify(response, null, 2));
                throw new Error('Invalid response structure from API');
            }

            let products = [];
            let paginationInfo = {};

            // Handle different response structures
            if (response.data.result.content) {
                // Old structure with content array
                products = response.data.result.content;
                paginationInfo = {
                    size: response.data.result.size,
                    number: response.data.result.number,
                    totalElements: response.data.result.totalElements,
                    totalPages: response.data.result.totalPages
                };
            } else if (response.data.result.page) {
                // New structure with page object
                products = response.data.result.products || response.data.result.data || [];
                paginationInfo = response.data.result.page;
            } else if (Array.isArray(response.data.result)) {
                // Direct array response (fallback for getall)
                products = response.data.result;
                paginationInfo = {
                    size: products.length,
                    number: 0,
                    totalElements: products.length,
                    totalPages: 1
                };
            } else {
                throw new Error('Unexpected response structure from API');
            }

            // Apply additional client-side filtering for search term only
            if (queryParams.searchTerm) {
                const searchLower = String(queryParams.searchTerm).toLowerCase();
                products = products.filter(item => (
                    (item.name || '').toLowerCase().includes(searchLower) ||
                    (item.description || '').toLowerCase().includes(searchLower) ||
                    (item.brand || '').toLowerCase().includes(searchLower)
                ));
            }

            // Map products to UI format
            const mappedProducts = products.map(item => ({
                id: item.id,
                title: item.name,
                description: item.description || '',
                rating: 0, // Backend doesn't provide rating in product list
                priceActive: item.price || 0,
                priceDefault: item.price || 0,
                thumbnail: this.getProductImageUrl(item.images),
                discountPercentage: 0, // Backend doesn't provide discount info
                brand: item.brand || '',
                stockquantity: item.inventory || 0,
                bar: '',
                sku: '',
                statusName: 'Active',
                isActive: true
            }));

            // Create metadata using new page structure
            const paginationMetadata = {
                totalCount: paginationInfo.totalElements,
                totalPages: paginationInfo.totalPages,
                pageSize: paginationInfo.size,
                currentPage: paginationInfo.number + 1, // Convert back to 1-based
                hasPrevious: paginationInfo.number > 0,
                hasNext: paginationInfo.number < (paginationInfo.totalPages - 1)
            };

            return {
                metadata: paginationMetadata,
                products: mappedProducts
            };

        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    /**
     * Get product details by ID
     * @param {string} id - Product ID
     * @returns {Promise} Promise containing the product data mapped to the format needed by the UI
     */
    async getProductById(id) {
        try {
            // Use backend shopping_cart API endpoint
            const response = await api.public.get(`/products/getproduct/${id}/id`);

            // Check if the request was successful
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch product');
            }

            const item = response.data.result;

            // Map the API response to the format needed by the UI
            const mappedProduct = {
                id: item.id,
                name: item.name,
                description: item.description || '',
                priceActive: item.price || 0,
                priceDefault: item.price || 0,
                images: item.images?.map(img => ({
                    id: img.imageId,
                    url: img.downloadUrl,
                    order: null,
                    publicId: null
                })) || [],
                thumbnail: this.getProductImageUrl(item.images),
                discountPercentage: 0, // Backend doesn't provide discount info
                category: item.category?.name || "Sữa", // Use category from backend
                brand: {
                    id: item.brand || '',
                    name: item.brand || ''
                },
                stockQuantity: item.inventory || 0,
                barcode: '',
                sku: '',
                status: {
                    id: '',
                    name: 'Active'
                },
                isActive: true,
                dimensions: [],
                unit: {
                    id: '',
                    name: ''
                },
                createdAt: null,
                updatedAt: null
            };

            return {
                success: true,
                statusCode: response.data.code,
                message: response.data.message,
                data: mappedProduct
            };
        } catch (error) {
            console.error(`Error fetching product with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get reviews for a specific product
     * @param {string} productId - The ID of the product to get reviews for
     * @param {Object} options - Optional parameters for pagination and filtering
     * @param {number} [options.pageNo=0] - Page number (0-based)
     * @param {number} [options.pageSize=5] - Number of reviews per page
     * @param {number} [options.rating] - Optional rating filter (1-5)
     * @returns {Promise} Promise containing reviews data with pagination
     */
    async getReviews(productId, options = {}) {
        try {
            if (!productId) {
                throw new Error('Product ID is required');
            }

            // Set default pagination parameters
            const { pageNo = 0, pageSize = 5, rating } = options;

            // Build query parameters
            const params = {
                pageNo,
                pageSize
            };

            // Add rating filter if provided
            if (rating !== undefined && rating !== null) {
                params.rating = rating;
            }

            // Call backend review API endpoint
            const response = await api.public.get(`/review/getList/${productId}`, params);

            // Check if the request was successful
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch reviews');
            }

            // Extract paginated review data
            const resultData = response.data.result;
            const reviews = resultData.content || [];
            const pageInfo = resultData.page || {};

            // Map backend ReviewDto to frontend format
            const mappedReviews = reviews.map(review => ({
                reviewId: review.id,
                productId: review.productId,
                userId: review.userId,
                rate: review.rating,
                content: review.comment,
                createdAt: review.createAt,
                // Use actual username from backend instead of placeholder
                customerName: review.username || `Khách hàng ${review.userId}`,
                // Add avatar URL from backend
                avatarUser: review.avatarUser || null,
                // Note: Backend doesn't provide ownership info, setting to false
                isOwner: false,
                // Note: Backend doesn't provide comments, setting empty array
                comments: []
            }));

            // Extract pagination metadata from the page object
            const paginationMetadata = {
                currentPage: pageInfo.number || 0,
                totalPages: pageInfo.totalPages || 1,
                pageSize: pageInfo.size || 5,
                totalElements: pageInfo.totalElements || 0,
                hasNext: pageInfo.number < (pageInfo.totalPages - 1),
                hasPrevious: pageInfo.number > 0
            };

            return {
                success: true,
                statusCode: 200,
                message: 'Reviews fetched successfully',
                data: mappedReviews,
                pagination: paginationMetadata
            };

        } catch (error) {
            console.error(`Error fetching reviews for product ${productId}:`, error);

            // Handle specific backend error for no reviews found
            if (error?.response?.data?.message?.includes('REVIEW_NOT_FOUND')) {
                return {
                    success: true,
                    statusCode: 200,
                    message: 'No reviews found for this product',
                    data: [],
                    pagination: {
                        currentPage: 0,
                        totalPages: 0,
                        pageSize: pageSize,
                        totalElements: 0,
                        hasNext: false,
                        hasPrevious: false
                    }
                };
            }

            throw error;
        }
    }

    async isAddReview(productId) {
        try {
            if (!productId) {
                throw new Error('Product ID is required');
            }

            // Backend has review endpoints, so users can add reviews
            // For now, return true - in a real app you might check if user has purchased the product
            return {
                success: true,
                statusCode: 200,
                message: 'User can add reviews',
                data: true
            };
        } catch (error) {
            console.error(`Error checking review status for product ${productId}:`, error);
            throw error;
        }
    }

    async createReview(productId, userId, rating, comment) {
        try {
            if (!productId || !userId || !rating || !comment) {
                throw new Error('Product ID, User ID, rating, and comment are required');
            }

            // Validate rating range
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            // Validate comment length (backend requires minimum 30 characters)
            if (comment.length < 30) {
                throw new Error('Comment must be at least 30 characters long');
            }

            // Create review request payload
            const reviewRequest = {
                productId: parseInt(productId),
                userId: parseInt(userId),
                rating: parseInt(rating),
                comment: comment.trim()
            };

            // Call backend create review endpoint
            const response = await api.post('/review/create', reviewRequest);

            // Check if the request was successful
            if (response.data.code !== 200) {
                throw new Error(response.data.message || 'Failed to create review');
            }

            // Map the response to frontend format
            const createdReview = response.data.result;
            return {
                success: true,
                statusCode: 200,
                message: 'Review created successfully',
                data: {
                    reviewId: createdReview.id,
                    productId: createdReview.productId,
                    userId: createdReview.userId,
                    rate: createdReview.rating,
                    content: createdReview.comment,
                    createdAt: createdReview.createAt,
                    customerName: `Khách hàng ${createdReview.userId}`,
                    isOwner: true,
                    comments: []
                }
            };
        } catch (error) {
            console.error(`Error creating review for product ${productId}:`, error);
            throw error;
        }
    }

    async deleteReview(reviewId) {
        try {
            if (!reviewId) {
                throw new Error('Review ID is required');
            }

            // Backend doesn't have delete review endpoint
            // Return error message indicating this functionality is not available
            throw new Error('Delete review functionality is not available in the current backend');
        } catch (error) {
            console.error(`Error deleting review with ID ${reviewId}:`, error);
            throw error;
        }
    }
}

export default new ProductService();
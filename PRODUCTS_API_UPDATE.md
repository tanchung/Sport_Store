# Cập nhật API Products - Phân trang và Lọc mới

## Tổng quan

Đã cập nhật hệ thống lấy danh sách sản phẩm để sử dụng 2 endpoint mới:

1. **Endpoint mặc định**: `GET /products/get-products?pageNumber=&pageSize=`
2. **Endpoint lọc**: `POST /products/get-products/filter`

## Cấu trúc API mới

### 1. Endpoint mặc định (GET)
```
GET /products/get-products?pageNumber=0&pageSize=10
```

### 2. Endpoint lọc (POST)
```
POST /products/get-products/filter
Content-Type: application/json

{
    "category": "",
    "brand": "",
    "priceMin": "",
    "priceMax": "",
    "sort": "",
    "propertySort": "",
    "page": "0",
    "size": "10"
}
```

### 3. Cấu trúc phản hồi mới
```json
{
    "code": 200,
    "message": "success",
    "result": {
        "products": [...],
        "page": {
            "size": 10,
            "number": 0,
            "totalElements": 50,
            "totalPages": 5
        }
    }
}
```

## Files đã cập nhật

### 1. `src/services/Product/ProductServices.js`
- Cập nhật method `getProducts()` để sử dụng endpoint mới
- Logic tự động chọn endpoint dựa trên việc có filter hay không
- Xử lý cấu trúc phản hồi mới với `page` object

### 2. `src/pages/Products/ProductStore.jsx`
- Thêm các filter mới: `category`, `brand`, `priceMin`, `priceMax`
- Thêm các action mới:
  - `updateCategoryFilter()`
  - `updateBrandFilter()`
  - `updatePriceFilter()`
  - `clearAllFilters()`

### 3. `src/config/apiConfig.js`
- Thêm endpoint mới:
  - `GET_PRODUCTS: '/products/get-products'`
  - `GET_PRODUCTS_FILTER: '/products/get-products/filter'`

### 4. Components mới
- `src/pages/Products/Components/NewProductFilters.jsx`: Component filter mới
- `src/pages/Products/ProductsDemo.jsx`: Trang demo để test API mới

## Cách sử dụng

### 1. Truy cập trang demo
```
http://localhost:5173/san-pham-demo
```

### 2. Test các tính năng
- **Tìm kiếm**: Nhập từ khóa vào ô search
- **Lọc danh mục**: Chọn danh mục từ dropdown
- **Lọc thương hiệu**: Chọn thương hiệu từ dropdown
- **Lọc giá**: Nhập khoảng giá và click "Áp dụng"
- **Phân trang**: Sử dụng các nút phân trang
- **Thay đổi kích thước trang**: Chọn số sản phẩm hiển thị

### 3. Sử dụng trong code

```javascript
import { useProductStore } from './ProductStore'

const MyComponent = () => {
  const {
    products,
    loading,
    filters,
    pagination,
    updateCategoryFilter,
    updateBrandFilter,
    updatePriceFilter,
    clearAllFilters
  } = useProductStore()

  // Lọc theo danh mục
  const handleCategoryFilter = (categoryId) => {
    updateCategoryFilter(categoryId)
  }

  // Lọc theo thương hiệu
  const handleBrandFilter = (brand) => {
    updateBrandFilter(brand)
  }

  // Lọc theo giá
  const handlePriceFilter = (min, max) => {
    updatePriceFilter(min, max)
  }

  // Xóa tất cả filter
  const handleClearFilters = () => {
    clearAllFilters()
  }

  return (
    // JSX component
  )
}
```

## Logic hoạt động

1. **Không có filter**: Sử dụng `GET /products/get-products`
2. **Có filter**: Sử dụng `POST /products/get-products/filter`
3. **Phân trang**: Dựa trên `page.number`, `page.size`, `page.totalElements`, `page.totalPages`
4. **Auto-reset**: Khi thay đổi filter, tự động reset về trang 1

## Debug

Trang demo hiển thị thông tin debug bao gồm:
- Current filters
- Pagination info
- Endpoint được sử dụng
- Số lượng sản phẩm

## Lưu ý

- Backend sử dụng 0-based indexing cho page number
- Frontend sử dụng 1-based indexing cho UI
- Conversion được xử lý tự động trong service layer
- Filter values có thể là string rỗng ("") để bỏ qua filter đó

## Testing

1. Mở trang demo: `http://localhost:5173/san-pham-demo`
2. Kiểm tra debug panel để xem endpoint nào được gọi
3. Test từng loại filter riêng biệt
4. Test combination của nhiều filter
5. Test phân trang với và không có filter
6. Kiểm tra Network tab trong DevTools để xem request/response

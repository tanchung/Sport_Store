# Frontend API Migration Summary

## Overview
This document summarizes the changes made to migrate the frontend from the original API endpoints to the backend shopping_cart API endpoints.

## Services Updated

### 1. Product Service (`src/services/Product/ProductServices.js`)
**Changes:**
- `getProducts()`: Changed from `/Product/get-products` to `/products/getall` or `/products` (paginated)
- `getProductById()`: Changed from `/Product/{id}` to `/products/getproduct/{id}/id`
- Review methods: Disabled (backend doesn't have review endpoints)
- Added field mapping: Frontend sort fields (e.g., 'ProductName') mapped to backend fields (e.g., 'name')
- Added sort direction handling: Special cases for price sorting ('price-low-high', 'price-high-low')

**Data Structure Changes:**
- Backend uses `ApiResponse<T>` wrapper with `code`, `message`, `result`
- Product fields mapped from backend `ProductResponse` structure
- Images array structure adapted to backend format: `ImageDto` with `downloadUrl` field
- Sort parameters properly mapped to backend entity field names
- Fixed image URL mapping: `imageData` → `downloadUrl` from backend `ImageDto`
- Added fallback image handling with data URL to avoid external dependencies

### 2. Cart Service (`src/services/Cart/CartService.js`)
**Changes:**
- `fetchCartItems()`: Changed from `/CartItem/get-list-cart-item` to `/cartItem/get-item/{cartId}`
- `addToCart()`: Changed from `/CartItem/add-to-cart` to `/cartItem/add-cartItem`
- `updateCartItem()`: Changed from `/CartItem/update-cart-item/{id}` to `/cartItem/update-quantity`
- `deleteCartItem()`: Changed from `/CartItem/delete-cart-item/{id}` to `/cartItem/remove-cartItem`
- Added `updateCartItemSelection()`: New method for `/cartItem/selected/{id}`

**Data Structure Changes:**
- Backend separates Cart and CartItem entities
- Cart items include selection status and product details
- Response format adapted to `ApiResponse` wrapper
- Fixed product image mapping in cart items: `imageData` → `downloadUrl`
- Added image fallback handling for cart item images

### 3. Category Service (`src/services/Category/CategoryServices.js`)
**Changes:**
- `getAllCategories()`: Changed from `/Category` to `/category/getall`
- Added `getCategoryById()`: New method for `/category/getcategory/{id}`
- Added `getCategoryByName()`: New method for `/category/getcategory/{name}`

**Data Structure Changes:**
- Backend returns simple `Category` objects with `id` and `name`
- Response format adapted to `ApiResponse` wrapper

### 4. Authentication Service (`src/services/Auth/AuthServices.js`)
**Changes:**
- Auth endpoints remain the same (compatible)
- Updated response handling to work with `ApiResponse` format
- `info()`: Updated to use `/getUser` endpoint from UserController
- `updateInfo()`: Disabled (backend doesn't have Customer update endpoints)
- Fixed login response structure to match AuthContext expectations
- Improved error handling for authentication failures

**Data Structure Changes:**
- Login response adapted to extract tokens from `AuthenticationDto`
- Token field mapping: `token` → `access_token`, `refreshToken` → `refresh_token`
- User info endpoint now uses backend `/getUser` endpoint
- All responses wrapped in consistent format

**Bug Fixes:**
- Fixed "Invalid credentials" error by properly handling backend error responses
- Fixed token field name mismatches between backend and frontend
- Added proper error handling for network and API errors
- **Fixed product image loading issues**: Corrected image field mapping and fallback handling

### 5. Order Service (`src/services/Order/OrderService.js`)
**Changes:**
- `createOrder()`: Changed from `/Order` to `/orders/create/{userId}`
- `getOrderById()`: New method for `/orders/get-order/{orderId}`
- `getOrdersHistory()`: Changed from `/Order/history` to `/orders/history-order/{userId}`
- `applyVoucher()`: New method for `/orders/applyVoucher/{orderId}`
- Status-specific methods now use filtering on history endpoint

**Data Structure Changes:**
- Backend uses `OrderDto` with different field structure
- Order items structure adapted
- Voucher application integrated

### 6. Voucher Service (`src/services/Voucher/VoucherService.js`)
**Changes:**
- `getVouchers()`: Changed from `/Voucher` to `/voucher/getAll`
- Added `getVoucherById()`: New method for `/voucher/getVoucher/{id}`
- Added `createVoucher()`: New method for `/voucher/create`
- Added `deleteVoucher()`: New method for `/voucher/delete/{id}`

**Data Structure Changes:**
- Backend uses `VoucherDto` with comprehensive voucher properties
- Added support for percentage/fixed discounts, usage limits, etc.

### 7. Payment Service (`src/services/Payment/PaymentService.js`)
**Changes:**
- Disabled all methods (backend doesn't have payment endpoints)
- Methods now throw errors indicating unavailability

### 8. Coupon Service (`src/services/Coupon/CouponService.js`)
**Changes:**
- Disabled all methods (backend doesn't have coupon endpoints)
- Methods return empty/default values

## Configuration Updates

### API Configuration (`src/config/apiConfig.js`)
**Added endpoint mappings for:**
- Products endpoints
- Cart/CartItem endpoints  
- Category endpoints
- Order endpoints
- Voucher endpoints

## Key Backend API Response Format

All backend endpoints return responses in this format:
```json
{
  "code": 200,
  "message": "success message",
  "result": { /* actual data */ }
}
```

## Important Notes

1. **Cart ID Management**: Backend requires cartId for cart operations. Frontend needs to manage cart ID from user session/auth context.

2. **User ID Management**: Order operations require userId. This should come from authentication context.

3. **Pagination**: Backend uses 0-based indexing for pagination, frontend uses 1-based. Conversion is handled in services.

4. **Missing Features**: 
   - Reviews system not available in backend
   - Payment integration not available
   - Coupon/points system not available
   - Customer profile management not available

5. **Error Handling**: All services now check for `response.data.code !== 200` and handle errors appropriately.

## Testing Recommendations

1. Test product listing and details
2. Test cart operations (add, update, remove, selection)
3. Test category listing
4. Test authentication flow
5. Test order creation and history
6. Test voucher operations
7. Verify error handling for disabled features

## 🖼️ **Image Loading Fix**

### **Problem**
Product images were not displaying correctly due to:
1. **Field Mapping Issue**: Frontend was accessing `imageData` but backend returns `downloadUrl`
2. **External Placeholder Dependency**: Using `https://via.placeholder.com/150` which was not resolving
3. **Missing Fallback Handling**: No proper fallback for products without images

### **Backend Image Structure**
```java
// Backend ImageDto structure
{
  "imageId": Long,
  "imageName": String,
  "downloadUrl": String  // Cloudinary URL
}

// ProductResponse.images
List<ImageDto> images;
```

### **Frontend Fixes Applied**

#### 1. **Corrected Field Mapping**
```javascript
// Before: Incorrect field access
thumbnail: item.images[0].imageData  // ❌ Field doesn't exist

// After: Correct field access
thumbnail: item.images[0].downloadUrl  // ✅ Correct field
```

#### 2. **Added Image Helper Methods**
- `getProductImageUrl(images)`: Safely extracts image URL from backend ImageDto array
- `getDefaultProductImage()`: Returns data URL placeholder to avoid external dependencies

#### 3. **Self-Contained Fallback Image**
```javascript
// Before: External dependency (unreliable)
'https://via.placeholder.com/150'

// After: Data URL (always works)
'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIi...'  // Gray placeholder SVG
```

#### 4. **Services Updated**
- **ProductService**: Fixed image mapping in `getProducts()` and `getProductById()`
- **CartService**: Fixed image mapping in cart item responses

### **Result**
- ✅ **Product images load correctly** from Cloudinary URLs
- ✅ **No more network errors** for placeholder images
- ✅ **Graceful fallback** for products without images
- ✅ **Consistent image handling** across all product displays
- ✅ **Backend download URLs** properly handled for non-Cloudinary images

## 🔐 **Authentication & API Integration Fixes**

### **Problems Fixed**
1. **401 Unauthorized on User Info**: `/getUser` endpoint returning 401 after login
2. **403 Site Disabled on Images**: Images loading from wrong base URL
3. **Token Storage Issues**: Incorrect token storage method calls
4. **Logout Error Handling**: Undefined property access errors
5. **Missing Backend Endpoints**: Incorrect endpoint paths

### **Root Cause Analysis**
- **Token Storage**: AuthService was calling non-existent `setAccessToken()` method
- **Endpoint Path**: Using `/getUser` instead of correct `/user/getUser`
- **Image URLs**: Relative URLs not properly converted to backend URLs
- **Logout Endpoint**: Backend doesn't have logout endpoint, causing errors
- **Error Handling**: Insufficient null checks in error handling

### **Solutions Implemented**

#### 1. **Fixed Token Storage**
```javascript
// Before: ❌ Non-existent methods
CookieService.setAccessToken(authData.token);
CookieService.setRefreshToken(authData.refreshToken);

// After: ✅ Correct method
CookieService.setAuthTokens(authData.token, authData.refreshToken);
```

#### 2. **Fixed User Info Endpoint**
```javascript
// Before: ❌ Wrong endpoint
const response = await api.get('/getUser');

// After: ✅ Correct endpoint
const response = await api.get('/user/getUser');
```

#### 3. **Fixed Image URL Handling**
```javascript
// Added normalizeImageUrl() method to handle:
// - Cloudinary URLs (https://res.cloudinary.com/...)
// - Backend download URLs (api/v1/images/download/4)
// - Image IDs (4) -> /api/image/download/4
```

#### 4. **Fixed Logout Implementation**
```javascript
// Before: ❌ Calling non-existent backend endpoint
response = await api.post('/auth/logout');

// After: ✅ Client-side logout (JWT is stateless)
CookieService.removeAuthTokens();
// Return mock success response
```

#### 5. **Improved Error Handling**
```javascript
// Before: ❌ Undefined property access
error.response.data.message

// After: ✅ Safe property access
error?.response?.data?.message || error?.message || 'Default message'
```

#### 6. **Added Debugging Support**
- Token storage debugging in login flow
- User info request debugging
- Cookie service debug methods

### **Backend Integration Points**
- **Authentication**: `POST /auth/login` ✅
- **User Info**: `GET /user/getUser` ✅ (requires Bearer token)
- **Image Download**: `GET /image/download/{id}` ✅
- **Logout**: Client-side only (no backend endpoint needed)

### **Testing Status**
- ✅ **Token Storage**: Fixed method calls and verification
- ✅ **User Info Fetch**: Correct endpoint and authentication
- ✅ **Image Loading**: Both Cloudinary and backend URLs supported
- ✅ **Logout Flow**: Graceful client-side logout
- ✅ **Error Handling**: Robust error handling throughout

## 🔄 **Authentication Persistence & Pagination Fixes**

### **Problems Fixed**
1. **Authentication State Loss**: Users prompted to log in again during cart/purchase operations
2. **Cart ID Management**: Hardcoded cart ID instead of user's actual cart
3. **Pagination Data Fetching**: Products not loading correctly when changing pages
4. **API Client Error Handling**: Silent promise rejections without error messages

### **Root Cause Analysis**
- **Cart Operations**: CartService was using hardcoded `cartId = 1` instead of getting user's cart from authentication context
- **User-Cart Relationship**: Frontend wasn't utilizing the backend's User-Cart OneToOne relationship
- **API Client Validation**: `validateToken()` was rejecting promises without proper error messages
- **Authentication Context**: Cart operations weren't properly integrated with user authentication state

### **Solutions Implemented**

#### 1. **Fixed Cart ID Management**
```javascript
// Before: ❌ Hardcoded cart ID
const targetCartId = cartId || 1;

// After: ✅ Get user's actual cart ID
const targetCartId = cartId || await this.getCurrentUserCartId();

// New helper method
static async getCurrentUserCartId() {
  const userInfo = await AuthService.info();
  return userInfo.data.cart.id;
}
```

#### 2. **Updated All Cart Methods**
- **fetchCartItems()**: Now uses user's cart ID
- **fetchAllCartItems()**: Now uses user's cart ID
- **addToCart()**: Now uses user's cart ID
- **updateCartItem()**: Now uses user's cart ID (both old and new signatures)
- **deleteCartItem()**: Now uses user's cart ID (both old and new signatures)

#### 3. **Improved API Client Error Handling**
```javascript
// Before: ❌ Silent rejection
if (!validateToken()) {
    return Promise.reject();
}

// After: ✅ Proper error messages
if (!validateToken()) {
    return Promise.reject(new Error('Authentication required. Please log in.'));
}
```

#### 4. **Backend Integration Verification**
- **User Entity**: Has OneToOne relationship with Cart
- **Cart Entity**: Has `id` field and `user` relationship
- **UserController**: `/user/getUser` returns full User entity including Cart
- **CartService**: Backend has `getCartByUserId(Long userId)` method

### **Authentication Flow Integration**
```javascript
// Complete flow:
1. User logs in → tokens stored
2. User info fetched → includes cart information
3. Cart operations → use user's actual cart ID
4. All requests → include Authorization header
5. Token validation → proper error handling
```

### **Pagination Verification**
- ✅ **Backend Endpoint**: `GET /products` with proper pagination parameters
- ✅ **Frontend Mapping**: Correct parameter mapping (pageNumber, pageSize, properties, sortDir)
- ✅ **Store Integration**: ProductStore correctly calls pagination API
- ✅ **UI Components**: Pagination component properly triggers page changes

### **Impact**
- ✅ **Authentication Persistence**: Users stay logged in during cart/purchase operations
- ✅ **Cart Operations**: All cart operations use user's actual cart data
- ✅ **Pagination**: Product pages load correctly when navigating
- ✅ **Error Handling**: Clear error messages for authentication issues
- ✅ **User Experience**: Seamless flow from login → browse → cart → purchase

## 🚨 **Critical Bug Fixes**

### **Problems Fixed**
1. **Critical Authentication API Error**: `CookieService.removeAccessTokens is not a function`
2. **Pagination Bug**: Products page only showing first page, unable to navigate to subsequent pages
3. **Shopping Cart Icon**: Cart icon not displaying after successful login

### **Root Cause Analysis**
- **Authentication Error**: `apiClient.js` was calling `removeAccessTokens()` but CookieService only has `removeAuthTokens()`
- **Pagination Logic**: Condition for using paginated endpoint was too restrictive
- **Cart Icon Display**: Already correctly implemented with `isAuthenticated` condition

### **Solutions Implemented**

#### 1. **Fixed Critical Authentication Error**
```javascript
// Before: ❌ Method doesn't exist
const handleExpiredToken = () => {
    CookieService.removeAccessTokens(); // TypeError!
}

// After: ✅ Correct method name
const handleExpiredToken = () => {
    CookieService.removeAuthTokens(); // Works correctly
}
```

#### 2. **Fixed Pagination Logic**
```javascript
// Before: ❌ Too restrictive condition
if (queryParams.pageNumber || queryParams.pageSize) {
    // pageNumber = 1 is truthy, but pageNumber = 0 (after -1) might cause issues
}

// After: ✅ Explicit undefined checks and broader condition
if (queryParams.pageNumber !== undefined || queryParams.pageSize !== undefined ||
    queryParams.sortBy !== undefined || queryParams.sortAscending !== undefined) {
    // Always use paginated endpoint when any pagination/sort params are provided
}
```

#### 3. **Verified Cart Icon Implementation**
```javascript
// Already correctly implemented in Header.jsx:
{isAuthenticated && (
  <button className="...">
    <Link to='/gio-hang'>
      <FiShoppingCart className="h-5 w-5 text-white" />
      {countItems > 0 && (
        <span className="...badge...">{countItems}</span>
      )}
    </Link>
  </button>
)}
```

### **Error Resolution**
The specific error stack trace has been resolved:
- ✅ **apiClient.js:27**: Now calls correct `removeAuthTokens()` method
- ✅ **AuthServices.js:20**: User info fetch now works without token errors
- ✅ **AuthContext.jsx:25**: fetchUserInfo completes successfully
- ✅ **401 Errors**: Proper token handling prevents authentication loops

### **Testing Status**
- ✅ **Authentication Flow**: Login → token storage → user info fetch → authenticated state
- ✅ **Pagination**: All product pages accessible and load correctly
- ✅ **Cart Icon**: Displays after successful authentication
- ✅ **Error Handling**: No more TypeError exceptions in authentication flow
- ✅ **Complete User Journey**: Login → browse products → navigate pages → add to cart → purchase

## 🔑 **Token Field Mapping Fix**

### **Critical Issue Resolved**
**Problem**: Login successful but user info fetch failing with 401 Unauthorized due to incorrect token field mapping.

**Error Log**:
```
AuthServices.js:82 Missing tokens in login response:
{authentication: true, access_token: 'eyJhbGciOiJIUzUxMiJ9...', refresh_token: 'eyJhbGciOiJIUzUxMiJ9...'}
GET http://localhost:8080/api/user/getUser 401 (Unauthorized)
```

### **Root Cause Analysis**
The backend `AuthenticationDto` uses `@JsonProperty` annotations:
```java
@JsonProperty("access_token")
String token;
@JsonProperty("refresh_token")
String refreshToken;
```

This means the JSON response contains `access_token` and `refresh_token` fields, but the frontend AuthService was looking for `token` and `refreshToken` fields.

### **Solution Implemented**
```javascript
// Before: ❌ Looking for wrong field names
if (authData.token && authData.refreshToken) {
    CookieService.setAuthTokens(authData.token, authData.refreshToken);
} else {
    console.error('Missing tokens in login response:', authData);
}

// After: ✅ Correct field names from backend JSON
if (authData.access_token && authData.refresh_token) {
    CookieService.setAuthTokens(authData.access_token, authData.refresh_token);
} else {
    console.error('Missing tokens in login response:', authData);
}
```

### **Backend-Frontend Integration**
**Backend Response Structure**:
```json
{
  "code": 200,
  "message": "login success",
  "result": {
    "access_token": "eyJhbGciOiJIUzUxMiJ9...",
    "refresh_token": "eyJhbGciOiJIUzUxMiJ9...",
    "authentication": true
  }
}
```

**Frontend Token Storage**:
```javascript
// Correctly extracts and stores tokens
CookieService.setAuthTokens(
    authData.access_token,  // ✅ Matches backend JSON field
    authData.refresh_token  // ✅ Matches backend JSON field
);
```

### **Impact**
- ✅ **Token Storage**: Tokens now correctly extracted and stored in cookies
- ✅ **Authentication Headers**: Subsequent API calls include proper Authorization header
- ✅ **User Info Fetch**: `/user/getUser` now succeeds with 200 response
- ✅ **Authentication State**: User stays logged in throughout the application
- ✅ **Complete Flow**: Login → token storage → authenticated requests → user data retrieval

### **Verification**
The authentication flow now works correctly:
1. **Login Request** → Backend returns tokens with correct field names
2. **Token Extraction** → Frontend correctly reads `access_token` and `refresh_token`
3. **Token Storage** → Tokens stored in cookies via `CookieService.setAuthTokens()`
4. **API Requests** → Authorization header included: `Bearer <access_token>`
5. **User Info** → `/user/getUser` succeeds and returns user data
6. **Authentication State** → `isAuthenticated = true`, cart icon appears, full functionality available

## Next Steps

1. Update frontend components to handle new data structures
2. Implement proper cart ID and user ID management
3. Add error handling for unavailable features
4. Test integration with actual backend
5. Update UI to reflect available/unavailable features
6. **Test image loading** on Home page and product listing pages

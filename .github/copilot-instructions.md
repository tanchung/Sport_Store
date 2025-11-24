# Copilot Instructions - Milk Store Frontend

## Project Architecture

**Tech Stack**: React 18 + Vite + TailwindCSS 4 + Zustand + Ant Design + Framer Motion  
**Language**: Vietnamese e-commerce application for dairy products

## Critical Development Knowledge

### API Integration Patterns
- **Dual API Architecture**: Uses both `authenticatedApi` and `publicApi` instances via `src/services/apiClient.js`
- **Backend Integration**: Proxies `/api/*` to ngrok tunnel (see `vite.config.js`)
- **Response Format**: All backend APIs return `{code: 200, message: string, result: T}` wrapper
- **Token Management**: JWT tokens stored via `CookieService` with automatic refresh on 401

### Service Layer Structure
```javascript
// All services follow this singleton pattern:
class XxxService {
  static async method() {
    const response = await api.get('/endpoint');
    return { success: response.data.code === 200, data: response.data.result };
  }
}
export default new XxxService(); // or XxxService for static methods
```

### State Management Patterns
- **Zustand Stores**: `useProductStore` in `src/pages/Products/ProductStore.jsx` - handles products, pagination, filters
- **Auth Context**: `AuthContext.jsx` - manages user state, login/logout, auto token refresh
- **Cart Hook**: `useCart.js` - global cart count with manual listener pattern (not React Context)

### Path Aliases (Critical for Imports)
```javascript
'@' -> '/src'
'@components' -> '/src/components'
'@pages' -> '/src/pages'  
'@services' -> '/src/services'
```

### Authentication Flow
1. Login → `AuthService.login()` → tokens stored in cookies
2. User info fetched via `/user/getUser` → `AuthContext` updated
3. Cart operations use user's actual cart ID (not hardcoded)
4. Protected routes redirect to `/dang-nhap` if not authenticated

### Vietnamese Route Structure
```javascript
'/dang-nhap' -> Login
'/dang-ky' -> Register  
'/san-pham' -> Products listing
'/san-pham/:id' -> Product detail
'/gio-hang' -> Cart
'/thanh-toan' -> Checkout
```

## Development Workflow

### Local Development
```bash
npm run dev          # Start dev server with API proxy
npm run build        # Production build
npm run lint         # ESLint check
```

### Key Debugging Points
- **API Calls**: Check Network tab for proxy routing to ngrok
- **Authentication**: Verify tokens in Application > Cookies
- **Image Loading**: Backend uses Cloudinary URLs + fallback data URIs
- **Pagination**: Uses 0-based backend, 1-based frontend (conversion in services)

## Critical Code Patterns

### Error Handling in Services
```javascript
try {
  const response = await api.get('/endpoint');
  if (response.data.code !== 200) {
    return { success: false, message: response.data.message };
  }
  return { success: true, data: response.data.result };
} catch (error) {
  return { success: false, message: error?.response?.data?.message || 'Network error' };
}
```

### Image URL Normalization
```javascript
// Handle Cloudinary URLs, backend download URLs, and fallbacks
const getProductImageUrl = (images) => {
  if (!images?.length) return getDefaultProductImage();
  return images[0].downloadUrl || getDefaultProductImage();
}
```

### Pagination Component Usage
```javascript
// Always provide these props to Pagination component:
<Pagination 
  currentPage={pagination.currentPage}
  totalPages={pagination.totalPages}
  onPageChange={handlePageChange}
  itemsPerPage={pagination.pageSize}
  totalItems={pagination.totalItems}
  hasPrevious={pagination.currentPage > 1}
  hasNext={pagination.currentPage < pagination.totalPages}
/>
```

## Common Issues & Fixes

### Cart Operations
- **Always use user's cart ID**: Get via `AuthService.info()` → `user.cart.id`
- **Never hardcode cart ID**: Backend enforces user-cart relationship

### Token Field Mapping
- **Backend returns**: `access_token`, `refresh_token` 
- **Frontend must use**: These exact field names (not `token`, `refreshToken`)

### API Client Content-Type Issues
- Set `'Content-Type': 'application/json'` in headers
- Use `api.public.*` for unauthenticated requests
- Use `api.*` for authenticated requests (auto-adds Bearer token)

## File Organization Conventions
- **Pages**: Feature-based folders in `src/pages/`
- **Components**: Shared in `src/components/`, page-specific in `src/pages/[Page]/Components/`
- **Services**: One service per entity in `src/services/[Entity]/`
- **Hooks**: Custom hooks in `src/hooks/`

When working with this codebase:
1. Always check `FRONTEND_API_MIGRATION_SUMMARY.md` for backend integration details
2. Use Vietnamese text for UI elements and error messages
3. Follow the established service pattern with proper error handling
4. Verify authentication state before cart/order operations
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import ProductCard from './Components/ProductCard'
import LoadingState from './Components/LoadingState'
import ErrorState from './Components/ErrorState'
import Pagination from './Components/Pagination'
import NewProductFilters from './Components/NewProductFilters'
import { useProductStore } from './ProductStore'

const ProductsDemo = () => {
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    fetchProducts,
    updateFilters,
    changePage,
    changePageSize,
    fetchCategories,
    categories,
    // New filter actions
    updateCategoryFilter,
    updateBrandFilter,
    updatePriceFilter,
    clearAllFilters,
  } = useProductStore()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [])

  const handlePageChange = (pageNumber) => {
    changePage(pageNumber)
  }

  const handlePageSizeChange = (pageSize) => {
    changePageSize(pageSize)
  }

  // Debug info
  const debugInfo = {
    currentFilters: filters,
    pagination: pagination,
    productsCount: products.length,
    hasFilters: !!(filters.category || filters.brand || filters.priceMin || filters.priceMax || filters.searchTerm)
  }

  if (loading && products.length === 0) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchProducts} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo Sản Phẩm - API Mới
          </h1>
          <p className="text-gray-600">
            Test endpoint /products/get-products và /products/get-products/filter
          </p>
        </div>

        {/* Debug Panel */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6 text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Current Filters:</strong>
              <pre className="mt-1 text-xs bg-white p-2 rounded">
                {JSON.stringify(filters, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Pagination:</strong>
              <pre className="mt-1 text-xs bg-white p-2 rounded">
                {JSON.stringify(pagination, null, 2)}
              </pre>
            </div>
          </div>
          <div className="mt-2">
            <strong>Products Count:</strong> {products.length} | 
            <strong> Has Filters:</strong> {debugInfo.hasFilters ? 'Yes' : 'No'} |
            <strong> API Endpoint:</strong> {debugInfo.hasFilters ? '/products/get-products/filter (POST)' : '/products/get-products (GET)'}
          </div>
        </div>

        {/* Filters */}
        <NewProductFilters
          filters={filters}
          categories={categories}
          onUpdateFilters={updateFilters}
          onUpdateCategoryFilter={updateCategoryFilter}
          onUpdateBrandFilter={updateBrandFilter}
          onUpdatePriceFilter={updatePriceFilter}
          onClearAllFilters={clearAllFilters}
        />

        {/* Products Grid */}
        <div className="mb-8">
          {loading && products.length > 0 && (
            <div className="text-center py-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                Đang tải...
              </div>
            </div>
          )}

          {products.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">Không tìm thấy sản phẩm nào</div>
              <p className="text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {products.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Hiển thị:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={12}>12</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700">sản phẩm</span>
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />

            <div className="text-sm text-gray-700">
              Trang {pagination.currentPage} / {pagination.totalPages} 
              ({pagination.totalItems} sản phẩm)
            </div>
          </div>
        )}

        {/* API Response Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Thông tin API Response:</h3>
          <div className="text-sm text-gray-600">
            <div>Endpoint được sử dụng: <code className="bg-gray-100 px-2 py-1 rounded">
              {debugInfo.hasFilters ? 'POST /products/get-products/filter' : 'GET /products/get-products'}
            </code></div>
            <div>Tổng số sản phẩm: {pagination.totalItems}</div>
            <div>Tổng số trang: {pagination.totalPages}</div>
            <div>Kích thước trang: {pagination.pageSize}</div>
            <div>Trang hiện tại: {pagination.currentPage}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsDemo

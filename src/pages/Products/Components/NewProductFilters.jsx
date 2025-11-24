import React, { useState } from 'react'
import { Search, Filter, X, DollarSign } from 'lucide-react'

const NewProductFilters = ({ 
  filters, 
  onUpdateCategoryFilter, 
  onUpdateBrandFilter, 
  onUpdatePriceFilter,
  onUpdateFilters,
  onClearAllFilters,
  categories = [] 
}) => {
  const [localPriceMin, setLocalPriceMin] = useState(filters.priceMin || '')
  const [localPriceMax, setLocalPriceMax] = useState(filters.priceMax || '')
  const [showFilters, setShowFilters] = useState(false)

  // Danh sách brand mẫu (có thể lấy từ API sau)
  const brands = [
    'Vinamilk',
    'TH True Milk',
    'Dutch Lady',
    'Nestlé',
    'Abbott',
    'Mead Johnson',
    'Friso',
    'Aptamil'
  ]

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value
    onUpdateFilters({ searchTerm })
  }

  const handleCategoryChange = (categoryId) => {
    onUpdateCategoryFilter(categoryId)
  }

  const handleBrandChange = (brand) => {
    onUpdateBrandFilter(brand)
  }

  const handlePriceFilter = () => {
    const minPrice = localPriceMin ? parseFloat(localPriceMin) : ''
    const maxPrice = localPriceMax ? parseFloat(localPriceMax) : ''
    onUpdatePriceFilter(minPrice, maxPrice)
  }

  const handleClearFilters = () => {
    setLocalPriceMin('')
    setLocalPriceMax('')
    onClearAllFilters()
  }

  const hasActiveFilters = filters.category || filters.brand || filters.priceMin || filters.priceMax || filters.searchTerm

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={filters.searchTerm || ''}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>Bộ lọc</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {[filters.category, filters.brand, filters.priceMin || filters.priceMax, filters.searchTerm].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.value}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thương hiệu
            </label>
            <select
              value={filters.brand || ''}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng giá
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Từ"
                  value={localPriceMin}
                  onChange={(e) => setLocalPriceMin(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative flex-1">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Đến"
                  value={localPriceMax}
                  onChange={(e) => setLocalPriceMax(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handlePriceFilter}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
            
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Danh mục: {categories.find(c => c.id === filters.category)?.value || filters.category}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.brand && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Thương hiệu: {filters.brand}
                <button
                  onClick={() => handleBrandChange('')}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {(filters.priceMin || filters.priceMax) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                Giá: {filters.priceMin || '0'} - {filters.priceMax || '∞'}
                <button
                  onClick={() => onUpdatePriceFilter('', '')}
                  className="ml-1 hover:text-yellow-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Tìm kiếm: "{filters.searchTerm}"
                <button
                  onClick={() => onUpdateFilters({ searchTerm: '' })}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NewProductFilters

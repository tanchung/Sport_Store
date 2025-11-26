/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import ProductCard from './Components/ProductCard'
import LoadingState from './Components/LoadingState'
import ErrorState from './Components/ErrorState'
import Pagination from './Components/Pagination'
import {
  Search,
  Check,
  ChevronDown,
  FilterX,
  SlidersHorizontal,
  Star,
  X,
  Loader2,
} from 'lucide-react'
import { useProductStore } from './ProductStore'
import { useLocation } from 'react-router-dom'

const Products = () => {
  const [searchText, setSearchText] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState({
    id: null,
    value: 'Tất cả',
  })
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    fetchProducts,
    updateFilters,
    changePage,
    changePageSize, // Sử dụng hàm này để set mặc định
    fetchCategories,
    categories,
  } = useProductStore()

  const location = useLocation()

  // --- THAY ĐỔI 1: Set mặc định pageSize là 12 khi vào trang ---
  useEffect(() => {
    changePageSize(12) // Bắt buộc lấy 12 sản phẩm mỗi trang
    fetchCategories()
    fetchProducts()
  }, [])
  // -----------------------------------------------------------

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const qpBrand = params.get('brand')
    if (qpBrand) {
      updateFilters({ brand: qpBrand })
    }
  }, [location.search])

  // Debug pagination changes
  useEffect(() => {
    console.log('🛒 Products Pagination Updated:', {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      pageSize: pagination.pageSize,
      hasPrevious: pagination.hasPrevious,
      hasNext: pagination.hasNext,
      productsLength: products.length
    });
  }, [pagination, products.length])

  useEffect(() => {
    let currentFilters = []

    if (selectedCategory.id !== null) {
      currentFilters.push({ type: 'category', value: selectedCategory.value })
    }

    if (filters.searchTerm) {
      currentFilters.push({ type: 'search', value: filters.searchTerm })
    }

    if (filters.brand) {
      currentFilters.push({ type: 'brand', value: filters.brand })
    }

    if (filters.priceMin || filters.priceMax) {
      let priceLabel = ''
      if (filters.priceMin && filters.priceMax) {
        priceLabel = `${filters.priceMin.toLocaleString()}₫ - ${filters.priceMax.toLocaleString()}₫`
      } else if (filters.priceMin) {
        priceLabel = `Trên ${filters.priceMin.toLocaleString()}₫`
      } else if (filters.priceMax) {
        priceLabel = `Dưới ${filters.priceMax.toLocaleString()}₫`
      }
      currentFilters.push({ type: 'price', value: priceLabel })
    }

    let sortLabel = ''
    switch (filters.sortBy) {
      case 'priceActive':
        sortLabel = filters.sortAscending
          ? 'Giá thấp đến cao'
          : 'Giá cao đến thấp'
        break
      case 'ProductName':
        sortLabel = 'Tên sản phẩm'
        break
      default:
        break
    }

    if (filters.sortBy !== 'ProductName' || !filters.sortAscending) {
      currentFilters.push({ type: 'sort', value: sortLabel })
    }

    setActiveFilters(currentFilters)
  }, [filters, selectedCategory])

  const handlePageChange = pageNumber => {
    changePage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Hàm này giờ ít dùng trực tiếp vì đã bỏ dropdown, nhưng vẫn giữ để logic không lỗi
  const _handlePageSizeChange = pageSize => {
    changePageSize(pageSize)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    updateFilters({ searchTerm: searchText })
  }

  const removeFilter = filter => {
    if (filter.type === 'category') {
      setSelectedCategory({ id: null, value: 'Tất cả' })
      updateFilters({ category: null })
    } else if (filter.type === 'search') {
      setSearchText('')
      updateFilters({ searchTerm: '' })
    } else if (filter.type === 'brand') {
      updateFilters({ brand: null })
    } else if (filter.type === 'price') {
      updateFilters({ priceMin: null, priceMax: null })
    } else if (filter.type === 'sort') {
      updateFilters({
        sortBy: 'ProductName',
        sortAscending: true,
      })
    }
  }

  const resetAllFilters = () => {
    setSearchText('')
    setSelectedCategory({ id: null, value: 'Tất cả' })
    setShowMobileFilters(false)
    setShowCategoryDropdown(false)
    setShowSortDropdown(false)

    updateFilters({
      category: null,
      brand: null,
      priceMin: null,
      priceMax: null,
      trendId: null,
      searchTerm: '',
      sortBy: 'ProductName',
      sortAscending: true,
    })
  }

  const handleClearSearch = () => {
    setSearchText('')
    updateFilters({ searchTerm: '' })
  }

  const handleCategoryChange = category => {
    setSelectedCategory(category)
    updateFilters({
      category: category.id || null,
    })
    setShowCategoryDropdown(false)
  }

  const handleSortChange = sortOption => {
    let sortBy = 'ProductName'
    let sortAscending = true

    switch (sortOption) {
      case 'price-low-high':
        sortBy = 'price-low-high'
        sortAscending = true
        break
      case 'price-high-low':
        sortBy = 'price-high-low'
        sortAscending = false
        break
      default:
        sortBy = 'ProductName'
        sortAscending = true
    }

    updateFilters({ sortBy, sortAscending })
    setShowSortDropdown(false)
  }

  if (loading && !products.length) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={fetchProducts} />

  // --- Logic tính toán hiển thị (Sử dụng pageSize mặc định 12) ---
  const displayPage = pagination.currentPage === 0 ? 1 : pagination.currentPage;
  const displayPageSize = pagination.pageSize || 12; // Mặc định hiển thị logic là 12
  
  const startItem = (displayPage - 1) * displayPageSize + 1;
  const effectiveTotalItems = pagination.totalItems > 0 ? pagination.totalItems : (products.length > 0 ? products.length : 0);
  const endItem = Math.min(displayPage * displayPageSize, effectiveTotalItems);
  // ---------------------------------------------------------------

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Mobile search & filter toggle */}
        <div className='mb-6 flex items-center justify-between md:hidden'>
          <form onSubmit={handleSearchSubmit} className='relative mr-2 flex-1'>
            <input
              type='text'
              placeholder='Tìm kiếm sản phẩm...'
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
              className='w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
            <button
              type='submit'
              className='absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400'
            >
              <Search size={18} />
            </button>
            {searchText && (
              <button
                type='button'
                onClick={handleClearSearch}
                className='absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400'
              >
                <X size={16} />
              </button>
            )}
          </form>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className='flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-gray-700 hover:bg-gray-50'
          >
            <SlidersHorizontal size={18} className='mr-1' />
            Lọc
          </button>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className='mb-6 flex flex-wrap items-center gap-2'>
            <span className='text-sm text-gray-500'>Lọc theo:</span>
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className='flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700'
              >
                <span>{filter.value}</span>
                <button
                  onClick={() => removeFilter(filter)}
                  className='ml-1 rounded-full p-1 hover:bg-blue-100'
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={resetAllFilters}
              className='ml-2 flex items-center text-sm text-red-600 hover:text-red-800'
            >
              <FilterX size={16} className='mr-1' />
              Xóa tất cả
            </button>
          </div>
        )}

        <div className='flex flex-col lg:flex-row'>
          {/* Sidebar */}
          <div
            className={`lg:block lg:w-1/4 lg:pr-8 ${showMobileFilters ? 'block' : 'hidden'} lg:sticky lg:top-4 lg:self-start`}
          >
            {/* ... (Giữ nguyên phần Sidebar Filters) ... */}
            <div className='mb-6 rounded-lg bg-white p-5 shadow-sm'>
              <div className='mb-4 flex items-center justify-between lg:hidden'>
                <h3 className='text-lg font-medium'>Bộ lọc</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X size={20} className='text-gray-500' />
                </button>
              </div>

              {/* Search Box */}
              <div className='mb-6 hidden md:block'>
                <form onSubmit={handleSearchSubmit} className='relative'>
                  <input
                    type='text'
                    placeholder='Tìm kiếm sản phẩm...'
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className='w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                  <button
                    type='submit'
                    className='absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400'
                  >
                    <Search size={18} />
                  </button>
                  {searchText && (
                    <button
                      type='button'
                      onClick={handleClearSearch}
                      className='absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                    >
                      <X size={16} />
                    </button>
                  )}
                </form>
              </div>

              {/* Categories */}
              <div className='mb-6'>
                <div className='relative'>
                  <button
                    className='flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <span>Danh mục: {selectedCategory.value}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${showCategoryDropdown ? 'rotate-180 transform' : ''}`}
                    />
                  </button>

                  {showCategoryDropdown && (
                    <div className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg'>
                      {categories.map(category => (
                        <button
                          key={category.id || 'all'}
                          onClick={() => handleCategoryChange(category)}
                          className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                            selectedCategory.id === category.id
                              ? 'bg-blue-50 font-medium text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{category.value}</span>
                          {selectedCategory.id === category.id && (
                            <Check size={16} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Filter */}
              <div className='mb-6'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-lg font-medium'>GIÁ</h3>
                  <ChevronDown size={16} className='text-gray-500' />
                </div>
                <div className='relative'>
                  <select
                    value={(() => {
                      if (!filters.priceMin && !filters.priceMax) return 'all';
                      if (filters.priceMin === 0 && filters.priceMax === 1000000) return 'under-1m';
                      if (filters.priceMin === 1000000 && filters.priceMax === 2000000) return '1m-2m';
                      if (filters.priceMin === 2000000 && filters.priceMax === 3000000) return '2m-3m';
                      if (filters.priceMin === 3000000 && filters.priceMax === 4000000) return '3m-4m';
                      if (filters.priceMin === 4000000 && (filters.priceMax === null || filters.priceMax === '' || filters.priceMax === undefined)) return 'over-4m';
                      return 'all';
                    })()}
                    onChange={(e) => {
                      const value = e.target.value;
                      switch (value) {
                        case 'all': updateFilters({ priceMin: '', priceMax: '' }); break;
                        case 'under-1m': updateFilters({ priceMin: 0, priceMax: 1000000 }); break;
                        case '1m-2m': updateFilters({ priceMin: 1000000, priceMax: 2000000 }); break;
                        case '2m-3m': updateFilters({ priceMin: 2000000, priceMax: 3000000 }); break;
                        case '3m-4m': updateFilters({ priceMin: 3000000, priceMax: 4000000 }); break;
                        case 'over-4m': updateFilters({ priceMin: 4000000, priceMax: null }); break;
                        default: updateFilters({ priceMin: '', priceMax: '' });
                      }
                    }}
                    className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  >
                    <option value='all'>Tất cả</option>
                    <option value='under-1m'>Dưới 1,000,000 VND</option>
                    <option value='1m-2m'>1,000,000 - 2,000,000 VND</option>
                    <option value='2m-3m'>2,000,000 - 3,000,000 VND</option>
                    <option value='3m-4m'>3,000,000 - 4,000,000 VND</option>
                    <option value='over-4m'>Trên 4,000,000 VND</option>
                  </select>
                </div>
                {(filters.priceMin || filters.priceMax) && (
                  <button
                    onClick={() => updateFilters({ priceMin: '', priceMax: '' })}
                    className='text-xs text-blue-600 hover:text-blue-800 mt-2'
                  >
                    Xóa bộ lọc giá
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              <div className='mb-6'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-lg font-medium'>THƯƠNG HIỆU</h3>
                  <ChevronDown size={16} className='text-gray-500' />
                </div>
                <div className='relative'>
                  <select
                    value={filters.brand || 'all'}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateFilters({ brand: value === 'all' ? '' : value });
                    }}
                    className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  >
                    <option value='all'>Tất cả</option>
                    <option value='Nike'>Nike</option>
                    <option value='Adidas'>Adidas</option>
                    <option value='Puma'>Puma</option>
                    <option value='Mizuno'>Mizuno</option>
                    <option value='Akka'>Akka</option>
                    <option value='Kamito'>Kamito</option>
                    <option value='Jogarbola'>Jogarbola</option>
                  </select>
                </div>
                {filters.brand && (
                  <button
                    onClick={() => updateFilters({ brand: '' })}
                    className='text-xs text-blue-600 hover:text-blue-800 mt-2'
                  >
                    Xóa bộ lọc thương hiệu
                  </button>
                )}
              </div>

              {/* Sort Options */}
              <div className='mb-6'>
                <div className='relative'>
                  <button
                    className='flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                  >
                    <span>
                      {filters.sortBy === 'priceActive' && filters.sortAscending
                        ? 'Sắp xếp: Giá thấp đến cao'
                        : filters.sortBy === 'priceActive' && !filters.sortAscending
                          ? 'Sắp xếp: Giá cao đến thấp'
                          : 'Sắp xếp: Mặc định'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${showSortDropdown ? 'rotate-180 transform' : ''}`}
                    />
                  </button>
                  {showSortDropdown && (
                    <div className='absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg'>
                      {[
                        { value: 'default', label: 'Mặc định' },
                        { value: 'price-low-high', label: 'Giá: Thấp đến Cao' },
                        { value: 'price-high-low', label: 'Giá: Cao đến Thấp' },
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                            (option.value === 'price-low-high' && filters.sortBy === 'priceActive' && filters.sortAscending) ||
                            (option.value === 'price-high-low' && filters.sortBy === 'priceActive' && !filters.sortAscending) ||
                            (option.value === 'default' && filters.sortBy === 'ProductName')
                              ? 'bg-blue-50 font-medium text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{option.label}</span>
                          {(option.value === 'price-low-high' && filters.sortBy === 'priceActive' && filters.sortAscending) ||
                            (option.value === 'price-high-low' && filters.sortBy === 'priceActive' && !filters.sortAscending) ||
                            (option.value === 'default' && filters.sortBy === 'ProductName' && <Check size={16} />)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Promotion Filters */}
              <div className='mb-6'>
                <h3 className='mb-3 text-lg font-medium'>Khuyến mãi</h3>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between rounded-md bg-gradient-to-r from-red-50 to-pink-50 px-3 py-2'>
                    <div className='flex items-center'>
                      <span className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white'>%</span>
                      <span className='text-sm text-gray-700'>Đang giảm giá</span>
                    </div>
                    <span className='text-sm font-medium text-red-600'>{products.filter(p => p.discountPercentage > 0).length}</span>
                  </div>
                  <div className='flex items-center justify-between rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2'>
                    <div className='flex items-center'>
                      <Star size={16} className='mr-2 text-yellow-500' />
                      <span className='mt-[0.5px] text-sm text-gray-700'>Đánh giá 4.5+</span>
                    </div>
                    <span className='text-sm font-medium text-blue-600'>{products.filter(p => p.rating >= 4.5).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            {/* Sort and Results Stats - Desktop */}
            <div className='mb-6 hidden items-center justify-between rounded-lg bg-white p-4 shadow-sm md:flex'>
              <div className='text-sm text-gray-600'>
                <span>Hiển thị </span>
                <span className='font-medium'>
                  {products.length === 0 ? '0' : startItem}
                  {' - '}
                  {endItem}
                </span>
                <span> trên </span>
                <span className='font-medium'>{effectiveTotalItems}</span>
                <span> sản phẩm</span>
              </div>
            </div>

            {products.length === 0 ? (
              <div className='rounded-lg bg-white p-8 text-center shadow-sm'>
                <img
                  src='https://cdn-icons-png.flaticon.com/512/6134/6134065.png'
                  alt='Không tìm thấy sản phẩm'
                  className='mx-auto h-20 w-20 opacity-70'
                />
                <h3 className='mt-4 text-lg font-medium text-gray-900'>
                  Không tìm thấy sản phẩm
                </h3>
                <p className='mt-2 text-gray-500'>
                  {filters.searchTerm
                    ? `Không có sản phẩm nào phù hợp với "${filters.searchTerm}"`
                    : 'Không có sản phẩm nào trong danh mục này'}
                </p>
                <button
                  onClick={resetAllFilters}
                  className='mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className='relative'>
                  <div className={`grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 ${loading ? 'opacity-50' : ''}`}>
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Loading overlay */}
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Đang tải sản phẩm...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- THAY ĐỔI 3: Giữ Pagination nhưng BỎ dropdown chọn số lượng --- */}
                <div className='mt-8 relative'>
                  {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Đang tải...</span>
                      </div>
                    </div>
                  )}

                  <div className={`${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Component phân trang (1, 2, 3...) vẫn được giữ lại */}
                    <Pagination
                      currentPage={displayPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={displayPageSize}
                      totalItems={effectiveTotalItems}
                      hasPrevious={pagination.hasPrevious}
                      hasNext={pagination.hasNext}
                      loading={loading}
                    />

                    {/* ĐÃ XÓA đoạn code hiển thị <select> ở đây */}
                  </div>
                </div>
                {/* ------------------------------------------------------------- */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
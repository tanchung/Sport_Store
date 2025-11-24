import React, { useState, useRef, useEffect } from 'react'
import { useOrderStore } from './OrderStore'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import moment from 'moment'
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  ShoppingBag,
  Calendar,
} from 'lucide-react'
import { DatePicker, Space } from 'antd'

const { RangePicker } = DatePicker

const OrderCancelRequested = () => {
  const {
    ordersCancelRequested,
    loading,
    error,
    paginationCancelRequested,
    filtersCancelRequested,
    updateCancelRequestedFilters,
    changeCancelRequestedPage,
    changeCancelRequestedPageSize,
    fetchOrdersCancelRequested,
    // Search related state
    searchCancelRequestedResults,
    searchCancelRequestedLoading,
    searchCancelRequestedError,
    searchCancelRequestedPagination,
    isSearchCancelRequestedMode,
    changeSearchCancelRequestedPage,
    changeSearchCancelRequestedPageSize,
    searchCancelRequestedOrders,
    clearCancelRequestedSearch,
  } = useOrderStore()

  const [hoveredOrder, setHoveredOrder] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState(null)

  const containerRef = useRef(null)

  // Fetch cancel requested orders when component mounts
  useEffect(() => {
    console.log('CancelRequested: Fetching orders...')
    fetchOrdersCancelRequested()
  }, [fetchOrdersCancelRequested])

  // Debug: Log orders data when it changes
  useEffect(() => {
    console.log('CancelRequested: Orders data changed:', {
      ordersCancelRequested,
      loading,
      error,
      isSearchMode: isSearchCancelRequestedMode,
      searchResults: searchCancelRequestedResults
    })
  }, [ordersCancelRequested, loading, error, isSearchCancelRequestedMode, searchCancelRequestedResults])

  const handleMouseEnter = (order, event) => {
    if (!order.orderDetails || order.orderDetails.length === 0) return

    const rect = event.target.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()

    if (containerRect) {
      setTooltipPosition({
        top: rect.top - containerRect.top + rect.height + 5,
        left: rect.left - containerRect.left,
      })
    }

    setHoveredOrder(order)
  }

  const handleSortChange = field => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className='ml-1 h-4 w-4' />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className='ml-1 h-4 w-4' />
    ) : (
      <ArrowDown className='ml-1 h-4 w-4' />
    )
  }

  const handleSearch = async () => {
    if (!searchTerm.trim() && !dateRange) {
      alert('Vui lòng nhập từ khóa tìm kiếm hoặc chọn khoảng thời gian')
      return
    }

    let startDate = ''
    let endDate = ''

    if (dateRange && dateRange.length === 2) {
      startDate = moment(dateRange[0]).format('YYYY-MM-DD')
      endDate = moment(dateRange[1]).format('YYYY-MM-DD')
    }

    const searchParams = {
      searchTerm: searchTerm.trim(),
      startDate,
      endDate,
    }

    try {
      await searchCancelRequestedOrders(searchParams)
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setDateRange(null)
    clearCancelRequestedSearch()
  }

  const OrderDetailsTooltip = ({ order }) => {
    if (!order || !order.orderDetails || order.orderDetails.length === 0) {
      return null
    }

    return (
      <div
        className='ring-opacity-5 fixed z-50 w-96 rounded-md bg-white p-4 shadow-lg ring-1 ring-black'
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        <div className='mb-3 border-b pb-2'>
          <h3 className='text-lg font-semibold text-gray-900'>Chi tiết đơn hàng</h3>
          <p className='text-sm text-gray-600'>
            Mã đơn hàng: {order.orderCode || order.orderNumber || order.id}
          </p>
        </div>

        <div className='space-y-3'>
          {order.orderDetails.map((item, index) => (
            <div key={index} className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3'>
              <div className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-200'>
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center'>
                    <ShoppingBag className='h-6 w-6 text-gray-400' />
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {item.productName || 'Sản phẩm'}
                </p>
                <p className='text-sm text-gray-500'>
                  Số lượng: {item.quantity || 0}
                </p>
                <p className='text-sm text-gray-500'>
                  Giá: {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(item.price || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 border-t pt-3'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>Phí vận chuyển:</span>
            <span className='font-medium'>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(order.shippingFee || 0)}
            </span>
          </div>
          <div className='flex justify-between text-base font-semibold'>
            <span>Tổng cộng:</span>
            <span className='text-blue-600'>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(order.totalAmount || order.totalPrice || 0)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='relative container mx-auto' ref={containerRef}>
      {/* Search Error Display */}
      {searchCancelRequestedError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Search className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lỗi tìm kiếm</h3>
              <p className="mt-1 text-sm text-red-700">{searchCancelRequestedError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {isSearchCancelRequestedMode && !searchCancelRequestedLoading && !searchCancelRequestedError && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-blue-400 mr-2" />
            <p className="text-sm text-blue-800">
              Tìm thấy <strong>{searchCancelRequestedPagination.totalItems}</strong> đơn hàng
            </p>
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className='mb-6 rounded-lg bg-white p-4 shadow'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <Search className='h-4 w-4 text-gray-500' />
            </div>
            <input
              type='text'
              placeholder='Tìm kiếm đơn hàng...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
          </div>

          <div className='relative'>
           
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              allowClear={true}
              size='large'
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              className='w-full rounded-md border border-gray-300 py-1 pl-10'
            />
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={handleSearch}
              disabled={searchCancelRequestedLoading}
              className='flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {searchCancelRequestedLoading ? (
                              <Loader2 className='h-4 w-4 animate-spin mr-2' />
                            ) : (
                              <Search className='h-4 w-4 mr-2' />
                            )}
                Tìm
            </button>

            {isSearchCancelRequestedMode && (
              <button
                onClick={handleClearSearch}
                className='rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500'
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className='mb-4 rounded-md bg-red-50 p-3 text-red-700'>
          {error}
        </div>
      )}

      <div className='overflow-hidden rounded-lg bg-white shadow'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Mã đơn hàng
                </th>
                <th
                  className='cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'
                  onClick={() => handleSortChange('orderDate')}
                >
                  <div className='flex items-center'>
                    Ngày đặt hàng
                    <SortIcon field='orderDate' />
                  </div>
                </th>
                <th
                  className='cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'
                  onClick={() => handleSortChange('totalAmount')}
                >
                  <div className='flex items-center'>
                    Tổng tiền
                    <SortIcon field='totalAmount' />
                  </div>
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Phương thức thanh toán
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Trạng thái thanh toán
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Địa chỉ giao hàng
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {(isSearchCancelRequestedMode ? searchCancelRequestedLoading : loading) ? (
                <tr>
                  <td colSpan='6' className='px-6 py-4 text-center'>
                    <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                    <p className='mt-2 text-gray-500'>
                      {isSearchCancelRequestedMode ? 'Đang tìm kiếm...' : 'Đang tải dữ liệu...'}
                    </p>
                  </td>
                </tr>
              ) : (isSearchCancelRequestedMode ? searchCancelRequestedResults : ordersCancelRequested).length === 0 ? (
                <tr>
                  <td
                    colSpan='6'
                    className='px-6 py-4 text-center text-gray-500'
                  >
                    {isSearchCancelRequestedMode ? 'Không tìm thấy đơn hàng nào' : 'Không có đơn hàng nào'}
                  </td>
                </tr>
              ) : (
                (isSearchCancelRequestedMode ? searchCancelRequestedResults : ordersCancelRequested).map(order => (
                  <tr
                    key={order.id}
                    className='hover:bg-blue-50'
                    onMouseLeave={() => setHoveredOrder(null)}
                  >
                    <td
                      className='px-6 py-4 text-sm font-medium whitespace-nowrap text-blue-600'
                      onMouseEnter={e => handleMouseEnter(order, e)}
                    >
                      {order.orderCode || order.orderNumber || order.id}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                      {order.orderDate ? format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm', {
                        locale: vi,
                      }) : '—'}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.totalAmount || 0)}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                      {order.payment?.method || order.paymentMethodName || order.paymentMethod || '—'}
                    </td>
                    <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                      {order.payment?.status || '—'}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500 break-words'>
                      {order.shippingAddress || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredOrder && <OrderDetailsTooltip order={hoveredOrder} />}
    </div>
  )
}

export default OrderCancelRequested

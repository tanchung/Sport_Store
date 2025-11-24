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

const OrderWaiting = () => {
  const {
    ordersWaiting,
    loading,
    error,
    paginationWaiting,
    filtersWaiting,
    updateWaitingFilters,
    changeWaitingPage,
    changeWaitingPageSize,
    cancelOrder,
    fetchOrdersWaiting
  } = useOrderStore()

  const [hoveredOrder, setHoveredOrder] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  const containerRef = useRef(null)

  // Tự động tải dữ liệu khi component mount
  useEffect(() => {
    fetchOrdersWaiting()
  }, [fetchOrdersWaiting])

  const handleSearchChange = e => {
    const searchTerm = e.target.value
    updateWaitingFilters({ searchTerm })
  }

  const handleDateChange = dates => {
    if (dates && dates.length === 2) {
      updateWaitingFilters({
        startDate: dates[0].toDate(),
        endDate: dates[1].toDate(),
      })
    } else {
      updateWaitingFilters({
        startDate: null,
        endDate: null,
      })
    }
  }

  const handleSortChange = sortField => {
    if (filtersWaiting.sortBy === sortField) {
      updateWaitingFilters({ sortAscending: !filtersWaiting.sortAscending })
    } else {
      updateWaitingFilters({ sortBy: sortField, sortAscending: false })
    }
  }

  const handleMouseEnter = (order, e) => {
    if (!containerRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    const tooltipWidth = 384 // w-96 = 24rem = 384px
    const tooltipHeight = 400
    let left = rect.left - containerRect.left + rect.width + 10
    if (left + tooltipWidth > containerRect.width) {
      left = rect.left - containerRect.left - tooltipWidth - 10
    }
    let top = rect.top - containerRect.top + rect.height / 2 - tooltipHeight / 2

    if (top < 0) {
      top = 10
    }
    if (top + tooltipHeight > containerRect.height) {
      top = containerRect.height - tooltipHeight - 10
    }
    setTooltipPosition({ top, left })
    setHoveredOrder(order)
  }

  const Pagination = () => {
    const pageNumbers = []
    const { currentPage, totalPages } = paginationWaiting

    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, startPage + 4)

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div className='mt-4 flex items-center justify-between'>
        <div>
          <span className='text-sm text-gray-700'>
            Hiển thị{' '}
            <span className='font-medium'>
              {(currentPage - 1) * paginationWaiting.pageSize + 1}
            </span>{' '}
            đến{' '}
            <span className='font-medium'>
              {Math.min(
                currentPage * paginationWaiting.pageSize,
                paginationWaiting.totalItems
              )}
            </span>{' '}
            trong tổng số{' '}
            <span className='font-medium'>{paginationWaiting.totalItems}</span>{' '}
            đơn hàng
          </span>
        </div>
        <div>
          <nav className='flex items-center space-x-1'>
            <button
              onClick={() => changeWaitingPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`rounded px-2 py-1 ${currentPage === 1 ? 'cursor-not-allowed text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              Trước
            </button>

            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => changeWaitingPage(number)}
                className={`rounded px-3 py-1 ${currentPage === number ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() =>
                changeWaitingPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`rounded px-2 py-1 ${currentPage === totalPages ? 'cursor-not-allowed text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              Tiếp
            </button>
          </nav>
        </div>
      </div>
    )
  }

  const SortIcon = ({ field }) => {
    if (filtersWaiting.sortBy !== field) {
      return <ArrowUpDown className='ml-1 h-4 w-4' />
    }
    return filtersWaiting.sortAscending ? (
      <ArrowUp className='ml-1 h-4 w-4' />
    ) : (
      <ArrowDown className='ml-1 h-4 w-4' />
    )
  }

  const OrderDetailsTooltip = ({ order }) => {
    if (!order || !order.orderDetails || order.orderDetails.length === 0) {
      return null
    }

    return (
      <div
        className='ring-opacity-5 absolute z-50 w-96 rounded-md bg-white p-4 shadow-lg ring-1 ring-black'
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        <div className='mb-3 flex items-center'>
          <ShoppingBag className='mr-2 h-5 w-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Chi tiết đơn hàng
          </h3>
        </div>

        <div className='space-y-2'>
          <div className='mb-3 grid grid-cols-2 gap-2'>
            <div>
              <p className='text-sm font-medium text-gray-700'>Mã đơn hàng:</p>
              <p className='text-sm text-gray-900'>
                {order.orderNumber || order.id}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Ngày đặt:</p>
              <p className='text-sm text-gray-900'>
                {format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm', {
                  locale: vi,
                })}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>
                Phí vận chuyển:
              </p>
              <p className='text-sm text-gray-900'>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(order.shippingFee || 0)}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Ghi chú:</p>
              <p className='text-sm text-gray-900'>
                {order.notes || 'Không có'}
              </p>
            </div>
          </div>

          <div className='border-t border-gray-200 pt-3'>
            <h4 className='mb-2 text-sm font-semibold text-gray-700'>
              Sản phẩm:
            </h4>
            {order.orderDetails.map((item, index) => (
              <div
                key={item.orderDetailId || index}
                className='flex items-center border-b border-gray-100 py-2 last:border-b-0'
              >
                <div className='mr-3 h-12 w-12 flex-shrink-0'>
                  {item.img ? (
                    <img
                      src={item.img}
                      alt={item.productName}
                      className='h-full w-full rounded object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center rounded bg-gray-200'>
                      <ShoppingBag className='h-6 w-6 text-gray-400' />
                    </div>
                  )}
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-800'>
                    {item.productName}
                  </p>
                  <div className='mt-1 flex justify-between text-xs text-gray-600'>
                    <span>SL: {item.quantity}</span>
                    <span>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.price || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {order.appliedVouchers && order.appliedVouchers.length > 0 && (
            <div className='border-t border-gray-200 pt-3'>
              <h4 className='mb-2 text-sm font-semibold text-gray-700'>
                Vouchers áp dụng:
              </h4>
              {order.appliedVouchers.map((voucher, index) => (
                <div key={index} className='text-sm text-gray-700'>
                  {voucher.code}: {voucher.description || voucher.discountValue}
                </div>
              ))}
            </div>
          )}

          <div className='mt-2 border-t border-gray-200 pt-3'>
            <div className='flex justify-between text-sm font-semibold'>
              <span className='text-gray-700'>Tổng cộng:</span>
              <span className='text-blue-600'>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(order.totalPrice || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tạo các hàng trống để giữ chiều cao cố định của bảng
  const renderEmptyRows = () => {
    const currentOrders = ordersWaiting.length
    const rowsToRender = paginationWaiting.pageSize - currentOrders

    if (rowsToRender <= 0) return null

    return Array(rowsToRender)
      .fill(0)
      .map((_, index) => (
        <tr key={`empty-${index}`} className='h-14'>
          <td
            colSpan='6'
            className='border-b border-gray-200 px-6 py-4 whitespace-nowrap'
          ></td>
        </tr>
      ))
  }

  return (
    <div className='relative container mx-auto' ref={containerRef}>
      <div className='mb-6 rounded-lg bg-white p-4 shadow'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <Search className='h-4 w-4 text-gray-500' />
            </div>
            <input
              type='text'
              placeholder='Tìm kiếm đơn hàng...'
              value={filtersWaiting.searchTerm}
              onChange={handleSearchChange}
              className='w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
          </div>

          <div className='relative'>
            <RangePicker
              onChange={handleDateChange}
              className='w-full rounded-md border border-gray-300 py-1 pl-10'
              format='DD/MM/YYYY'
              placeholder={['Từ ngày', 'Đến ngày']}
              allowClear={true}
              size='large'
              value={[
                filtersWaiting.startDate
                  ? moment(filtersWaiting.startDate)
                  : null,
                filtersWaiting.endDate ? moment(filtersWaiting.endDate) : null,
              ]}
            />
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
                  Địa chỉ giao hàng
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {loading ? (
                <tr>
                  <td colSpan='6' className='px-6 py-4 text-center'>
                    <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                    <p className='mt-2 text-gray-500'>Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : ordersWaiting.length === 0 ? (
                <>
                  <tr>
                    <td
                      colSpan='6'
                      className='px-6 py-4 text-center text-gray-500'
                    >
                      Không có đơn hàng nào
                    </td>
                  </tr>
                  {renderEmptyRows()}
                </>
              ) : (
                <>
                  {ordersWaiting.map(order => (
                    <tr
                      key={order.id}
                      className='hover:bg-blue-50'
                      onMouseLeave={() => setHoveredOrder(null)}
                    >
                      <td
                        className='px-6 py-4 text-sm font-medium whitespace-nowrap text-blue-600'
                        onMouseEnter={e => handleMouseEnter(order, e)}
                      >
                        {order.orderNumber || order.id}
                      </td>
                      <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                        {format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm', {
                          locale: vi,
                        })}
                      </td>
                      <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(order.totalPrice)}
                      </td>
                      <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                        {order.paymentMethodName || order.paymentMethod}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500 break-words'>
                        {order.shippingAddress}
                      </td>
                      <td className='max-w-xs truncate px-6 py-4 text-sm text-gray-500'>
                        {order.notes || '-'}
                      </td>
                    </tr>
                  ))}
                  {renderEmptyRows()}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className='border-t border-gray-200 px-6 py-4'>
          <Pagination />

          <div className='mt-2 flex items-center'>
            <span className='mr-2 text-sm text-gray-700'>Hiển thị:</span>
            <select
              value={paginationWaiting.pageSize}
              onChange={e => changeWaitingPageSize(Number(e.target.value))}
              className='rounded-md border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
            >
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hoveredOrder && <OrderDetailsTooltip order={hoveredOrder} />}
    </div>
  )
}

export default OrderWaiting

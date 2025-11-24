import React from 'react'
import { Link } from 'react-router-dom'

const CartItemsList = ({
  items,
  itemCount,
  handleUpdateQuantity,
  handleRemoveItem,
  checkedItems = [],
  onCheckedItemsChange,
  onToggleItemSelection,
}) => {
  const isChecked = item => checkedItems.some(checked => checked.id === item.id)

  const handleCheckboxChange = item => {
    if (onToggleItemSelection) {
      onToggleItemSelection(item)
      return
    }
    // Fallback: local toggle only
    let newChecked
    if (isChecked(item)) {
      newChecked = checkedItems.filter(checked => checked.id !== item.id)
    } else {
      newChecked = [...checkedItems, item]
    }
    if (onCheckedItemsChange) onCheckedItemsChange(newChecked)
  }

  const formatPrice = price => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <div className='h-full rounded-lg bg-white p-6 shadow-sm'>
      <h2 className='mb-4 text-xl font-semibold text-gray-800'>
        Giỏ hàng ({itemCount} sản phẩm)
      </h2>

      <div className='mb-4 grid grid-cols-12 gap-4 border-b pb-3 text-sm text-gray-600'>
        <div className='col-span-6'>Chi tiết sản phẩm</div>
        <div className='col-span-2 text-center'>Giá</div>
        <div className='col-span-2 text-center'>Số lượng</div>
        <div className='col-span-2 text-center'>Tổng</div>
      </div>

      {/* Container có khả năng cuộn với chiều cao cố định bằng với tóm tắt đơn hàng */}
      <div
        className='mb-4 overflow-y-auto pr-2'
        style={{ height: 'calc(100% - 120px)' }}
      >
        {items.map(item => (
          <div
            key={item.id}
            className='group relative grid grid-cols-12 items-center gap-4 border-b border-gray-100 py-4'
          >
            <div className='col-span-1 flex justify-center'>
              <input
                type='checkbox'
                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                checked={isChecked(item)}
                onChange={() => handleCheckboxChange(item)}
              />
            </div>
            <div className='col-span-5'>
              <div className='flex items-center gap-4'>
                <Link
                  to={`/san-pham/${item.productId || item.id}`}
                  className='group flex items-center gap-4'
                >
                  <div className='relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100'>
                    <img
                      src={item.image}
                      alt={item.name}
                      className='h-full w-full object-cover transition-transform group-hover:scale-105'
                    />
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-800 transition-colors group-hover:text-blue-600'>
                      {item.name}
                    </h3>
                    {/* <p className="text-sm text-gray-500 mt-1">Kích thước: {item.size}</p> */}
                  </div>
                </Link>
              </div>
            </div>
            {/* <div className="col-span-2 text-center text-gray-800">{formatPrice(item.price)}</div> */}
            <div className='col-span-2 text-center text-gray-800'>
              <div>{formatPrice(item.price)}</div>
              {item.price !== item.priceDefault && (
                <div className='text-sm text-red-500 line-through'>
                  {formatPrice(item.priceDefault)}
                </div>
              )}
            </div>
            <div className='col-span-2'>
              <div className='flex items-center justify-center'>
                <button
                  className={`flex h-8 w-8 items-center justify-center rounded-l border border-gray-300 transition-colors hover:bg-gray-100 ${item.quantity <= 1 ? 'cursor-not-allowed' : ''}`}
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <input
                  type='text'
                  className='h-8 w-12 border-y border-gray-300 text-center text-gray-800'
                  value={item.quantity}
                  readOnly
                />
                <button
                  className={`flex h-8 w-8 items-center justify-center rounded-r border border-gray-300 transition-colors hover:bg-gray-100 ${item.quantity >= item.available ? 'cursor-not-allowed' : ''}`}
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity + 1)
                  }
                  disabled={item.quantity >= item.available}
                >
                  +
                </button>
              </div>
            </div>
            <div className='col-span-2 text-center text-gray-800'>
              <div>{formatPrice(item.price * item.quantity)}</div>
              {item.price !== item.priceDefault && (
                <div className='text-sm text-red-500 line-through'>
                  {formatPrice(item.priceDefault * item.quantity)}
                </div>
              )}
            </div>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className='absolute right-0 text-xl text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500'
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className='mt-6'>
        <Link
          to='/san-pham'
          className='flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700'
        >
          <span>←</span> Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  )
}

export default CartItemsList

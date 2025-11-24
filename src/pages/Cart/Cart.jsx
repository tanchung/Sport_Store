import React, { useState, useEffect } from 'react'
import CartHeader from './Components/CartHeader'
import CartItemsList from './Components/CartItemsList'
import CartSummary from './Components/CartSummary'
import EmptyCart from './Components/EmptyCart'
import CartService from '@services/Cart/CartService'
import { message, Spin } from 'antd'
import { setGlobalCartCount } from '@/hooks/useCart'

const Cart = () => {
  const [items, setItems] = useState([])
  const [shipping] = useState(20000)
  const [subTotal, setSubTotal] = useState(0)
  const [checkedItems, setCheckedItems] = useState([])
  const [itemCount, setItemCount] = useState(0)
  const [loading, setLoading] = useState(true) // Add loading state

  const fetchItems = async () => {
    try {
      setLoading(true) // Set loading to true when starting fetch
      // Lấy tất cả sản phẩm trong giỏ hàng (không phân trang)
      const { items, metadata } = await CartService.fetchAllCartItems()
      setItems(items)
      setItemCount(metadata.totalCount)
      setGlobalCartCount(metadata.totalCount)
    } catch (error) {
      console.error('Error fetching cart items:', error)
      message.error('Không thể tải giỏ hàng. Vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      fetchItems()
    }, 300)
  }, [])

  useEffect(() => {
    const newTotal = checkedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    setSubTotal(newTotal)
  }, [checkedItems])

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity > 0) {
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
      setItems(updatedItems)

      const updatedCheckedItems = checkedItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
      setCheckedItems(updatedCheckedItems)

      const { statusCode, message: apiMessage } =
        await CartService.updateCartItem(itemId, newQuantity)
      if (statusCode !== 200) {
        message.error(apiMessage)
      }
    }
  }

  const handleRemoveItem = async itemId => {
    const { statusCode, message: apiMessage } =
      await CartService.deleteCartItem(itemId)
    if (statusCode === 200) {
      message.success(apiMessage)
      const newItems = await CartService.fetchAllCartItems()
      setItems(newItems.items)
      setItemCount(newItems.metadata.totalCount)
      setGlobalCartCount(newItems.metadata.totalCount)
    } else {
      message.error(apiMessage)
    }
  }

  const handleCheckedItemsChange = newChecked => {
    setCheckedItems(newChecked)
  }
  const toggleItemSelection = async (item) => {
    try {
      const updated = items.map(i => i.id === item.id ? { ...i, selected: !i.selected } : i)
      setItems(updated)
      // Persist to backend
      await CartService.updateCartItemSelection(item.id, !item.selected)
      // Update checkedItems used for totals
      const newChecked = !item.selected
        ? [...checkedItems, { ...item, selected: true }]
        : checkedItems.filter(ci => ci.id !== item.id)
      setCheckedItems(newChecked)
    } catch (e) {
      message.error('Không thể cập nhật lựa chọn sản phẩm. Vui lòng thử lại!')
    }
  }

  const grandTotal = subTotal + shipping

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white'>
      <CartHeader />

      <div className='container mx-auto px-4 pb-12'>
        {loading ? (
          // Loading spinner when data is being fetched
          <div
            className='flex items-center justify-center'
            style={{ height: '500px' }}
          >
            <Spin size='large' tip='Đang tải giỏ hàng...' />
          </div>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
              <div className='lg:col-span-2' style={{ height: '450px' }}>
                <CartItemsList
                  items={items}
                  itemCount={itemCount}
                  handleUpdateQuantity={handleUpdateQuantity}
                  handleRemoveItem={handleRemoveItem}
                  checkedItems={checkedItems}
                  onCheckedItemsChange={handleCheckedItemsChange}
                  onToggleItemSelection={toggleItemSelection}
                />
              </div>

              <div className='lg:col-span-1' style={{ height: '450px' }}>
                <CartSummary
                  subTotal={subTotal}
                  shipping={shipping}
                  grandTotal={grandTotal}
                  checkedItems={checkedItems}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart

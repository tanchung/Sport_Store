import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaCreditCard, FaMoneyBillWave, FaPaypal } from 'react-icons/fa'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import OrderSummary from './components/OrderSummary'
import VoucherBox from './components/VoucherBox'
import OrderService from '@services/Order/OrderService'
import CartService from '@services/Cart/CartService'
import PaymentService from '@services/Payment/PaymentService'
import PayPalService from '@services/Payment/PayPalService'
import { message } from 'antd'
import { resolveSizeNameForItems } from '../../utils/sizeName'

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [voucher, setVoucher] = useState(null)
  const [discountValue, setDiscountValue] = useState(0)
  const [searchParams] = useSearchParams()
  const [checkStatusPayment, setCheckStatusPayment] = useState(false)
  const [orderNumber, setOrderNumber] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [confirmItems, setConfirmItems] = useState([])
  const [confirmOrder, setConfirmOrder] = useState(null)

  // Get form data from location state
  const formData = location.state?.formData || {}
  const paymentMethodRaw = location.state?.paymentMethod || localStorage.getItem('payment_method') || 'cash'
  const order = location.state?.order || {}
  const buyNow = location.state?.buyNow || false

  // Map payment method to backend format
  const normalizePaymentMethod = (method) => {
    const methodLower = String(method).toLowerCase()
    if (methodLower === 'payos') return 'PAYOS'
    if (methodLower === 'paypal') return 'PAYPAL'
    if (methodLower === 'cash' || methodLower === 'cod') return 'COD'
    return 'COD' // Default to COD
  }

  const paymentMethod = normalizePaymentMethod(paymentMethodRaw)

  // Log để debug
  console.log('💳 Payment method:', {
    raw: paymentMethodRaw,
    normalized: paymentMethod,
    fromLocationState: location.state?.paymentMethod,
    fromLocalStorage: localStorage.getItem('payment_method')
  })

  // const discountValue = order?.total * (voucher?.discount || 0) / 100 || 0;

  useEffect(() => {
    const code = searchParams.get('code');
    const id = searchParams.get('id');
    const cancel = searchParams.get('cancel');
    const status = searchParams.get('status');
    const orderCode = searchParams.get('orderCode');
    const paymentId = searchParams.get('paymentId');
    const payerId = searchParams.get('PayerID');
    const token = searchParams.get('token');
    const urlOrderId = searchParams.get('orderId');

    console.log('📥 Payment callback params:', { code, id, cancel, status, orderCode, paymentId, payerId, token, urlOrderId });

    const handlePaymentCallback = async () => {
      // ============================================
      // PAYPAL CALLBACK HANDLING
      // ============================================
      // PayPal redirect về với: status, cancel, paymentId, PayerID, token
      // URL mẫu: ?orderId=123&status=PAID&cancel=false&paymentId=xxx&token=yyy&PayerID=zzz
      if (paymentId && payerId) {
        console.log('💙 Detected PayPal callback - executing payment');
        console.log('📥 Full URL params:', Object.fromEntries(searchParams.entries()));
        setCheckStatusPayment(true);
        setIsProcessing(true);

        // Lấy orderId và orderCode từ URL params, localStorage, state, hoặc location.state
        const savedOrderId = localStorage.getItem('paypal_order_id');
        const savedOrderCode = localStorage.getItem('paypal_order_code');
        const currentOrderId = urlOrderId || savedOrderId || orderId || location.state?.orderId;
        const currentOrderCode = savedOrderCode || orderNumber || location.state?.orderCode;

        console.log('🔍 Looking for orderId and orderCode:', {
          urlOrderId,
          savedOrderId,
          savedOrderCode,
          orderId,
          locationState: location.state?.orderId,
          finalOrderId: currentOrderId,
          finalOrderCode: currentOrderCode
        });

        if (!currentOrderId) {
          console.error('❌ Order ID not found for PayPal execution');
          message.error('Không tìm thấy mã đơn hàng! Vui lòng thử lại.');
          setIsProcessing(false);
          setIsSuccess(false);
          return;
        }

        console.log(`💳 Executing PayPal payment: orderId=${currentOrderId}, paymentId=${paymentId}, payerId=${payerId}`);

        // Gọi backend để execute PayPal payment và update database
        const executeResponse = await PayPalService.executePayment(currentOrderId, paymentId, payerId);

        console.log('📦 Execute response:', executeResponse);

        if (executeResponse && executeResponse.success) {
          console.log('✅ PayPal payment executed successfully');
          setIsSuccess(true);
          setOrderNumber(currentOrderCode || currentOrderId); // Ưu tiên orderCode
          message.success('Thanh toán PayPal thành công!');

          // Xóa orderId, orderCode và paymentMethod khỏi localStorage sau khi execute thành công
          localStorage.removeItem('paypal_order_id');
          localStorage.removeItem('paypal_order_code');
          localStorage.removeItem('payment_method');
          console.log('🗑️ Removed orderId, orderCode and paymentMethod from localStorage');
        } else {
          console.error('❌ Execute failed:', executeResponse?.message);
          message.error(executeResponse?.message || 'Thanh toán PayPal thất bại!');
          setIsSuccess(false);
        }

        setIsProcessing(false);
        return;
      }

      // ============================================
      // PAYPAL CANCEL/FAILURE HANDLING
      // ============================================
      // Backend redirect về khi PayPal cancel: ?status=CANCELLED&cancel=true
      // Không có paymentId và PayerID
      if (status && cancel === 'true' && !paymentId && !payerId && !code && !orderCode) {
        console.log('💙 Detected PayPal cancel callback');
        setCheckStatusPayment(true);
        setIsProcessing(false);

        const currentOrderId = urlOrderId || orderId || location.state?.orderId;

        console.log('❌ PayPal payment cancelled by user');
        setIsSuccess(false);
        if (currentOrderId) {
          setOrderNumber(currentOrderId);
        }
        message.error('Đơn hàng PayPal đã bị hủy!');

        // Xóa localStorage
        localStorage.removeItem('paypal_order_id');
        localStorage.removeItem('paypal_order_code');
        localStorage.removeItem('payment_method');
        return;
      }

      // ============================================
      // PAYOS CALLBACK HANDLING
      // ============================================
      // Kiểm tra nếu có query params từ PayOS
      if (code && status && orderCode) {
        console.log('💳 Detected PayOS callback');
        setCheckStatusPayment(true);
        setIsProcessing(false);

        // Kiểm tra nếu đơn hàng bị hủy
        // cancel=true HOẶC status=CANCELLED = đơn hàng đã bị hủy
        const isCancelled = (cancel === 'true' || status === 'CANCELLED');

        // Kiểm tra thanh toán thành công
        // code=00 VÀ status=PAID VÀ KHÔNG bị cancel = thành công
        const isPaymentSuccess = (code === '00' && status === 'PAID' && !isCancelled);

        if (isCancelled) {
          console.log('❌ Payment cancelled by user');
          setIsSuccess(false);
          setOrderNumber(orderCode);
          message.error('Đơn hàng đã bị hủy!');
          // Xóa payment_method khỏi localStorage
          localStorage.removeItem('payment_method');
        } else if (isPaymentSuccess) {
          console.log('✅ Payment successful from PayOS');
          setIsSuccess(true);
          setOrderNumber(orderCode);
          message.success('Thanh toán thành công!');
          // Xóa payment_method khỏi localStorage
          localStorage.removeItem('payment_method');
        } else {
          console.log('⚠️ Payment failed with status:', status);
          setIsSuccess(false);
          setOrderNumber(orderCode);
          message.error(`Thanh toán thất bại! Trạng thái: ${status}`);
          // Xóa payment_method khỏi localStorage
          localStorage.removeItem('payment_method');
        }
      }
    };

    handlePaymentCallback();
  }, [searchParams, orderId, location.state])

  useEffect(() => {
    if (voucher) {
      const minOrder = voucher.minOrder ?? voucher.minOrderAmount ?? 0
      if ((order?.total || order?.subtotal || 0) < minOrder) {
        setVoucher(null)
        message.error(
          `Đơn hàng tối thiểu để áp dụng mã giảm giá là ${formatPrice(minOrder)}`
        )
        return
      }
      const isPercent = voucher.isPercentage ?? voucher.percentTage ?? false
      const amount = voucher.discount ?? voucher.discountAmount ?? 0
      let calculatedDiscount = 0
      if (isPercent) {
        calculatedDiscount = ((order?.subtotal || order?.total || 0) * amount) / 100
      } else {
        calculatedDiscount = amount
      }
      const maxDiscount = voucher.maxDiscount ?? voucher.maxDiscountAmount
      if (maxDiscount && calculatedDiscount > maxDiscount) {
        setDiscountValue(maxDiscount)
      } else {
        setDiscountValue(calculatedDiscount)
      }
    } else {
      setDiscountValue(0)
    }
  }, [voucher])

  const formatPrice = price => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const handleProcessPayment = async () => {
    setCheckStatusPayment(true)
    setIsProcessing(true)

    try {
      // Get userId and addressId from formData
      const userId = null // Will use authenticated user from OrderService
      const userAddressId = formData?.addressId || null

      console.log('🚀 Starting payment process:', {
        userId,
        userAddressId,
        hasVoucher: !!voucher,
        voucherId: voucher?.id,
        paymentMethod
      })

      // Step 1: Create order with or without address
      console.log('📦 Step 1: Creating order...')
      const createOrderResponse = await OrderService.createOrder(userId, userAddressId)

      if (!createOrderResponse || !createOrderResponse.success) {
        throw new Error('Failed to create order')
      }

      const createdOrderId = createOrderResponse.data.id || createOrderResponse.data.orderId
      console.log('✅ Order created with ID:', createdOrderId)

      setOrderId(createdOrderId)
      setOrderNumber(createOrderResponse.data.orderCode || `ORD-${createdOrderId}`)
      setConfirmOrder(createOrderResponse.data)

      // Step 2: Apply voucher if selected
      if (voucher?.id) {
        try {
          console.log('🎟️ Step 2: Applying voucher...')
          await OrderService.applyVoucher(createdOrderId, voucher.id)
          message.success('Áp dụng mã giảm giá thành công!')
        } catch (voucherError) {
          console.warn('⚠️ Could not apply voucher:', voucherError)
          message.warning('Không áp dụng được mã giảm giá.')
        }
      }

      // Step 3: Fetch order details for display
      try {
        console.log('📋 Step 3: Fetching order details...')
        const orderDetailsResponse = await OrderService.getOrderById(createdOrderId)
        if (orderDetailsResponse && orderDetailsResponse.success) {
          setConfirmOrder(orderDetailsResponse.data)
          const rawItems = orderDetailsResponse.data.orderItems || orderDetailsResponse.data.orderDetails || []
          const enriched = await resolveSizeNameForItems(rawItems)
          setConfirmItems(enriched)
        }
      } catch (detailsError) {
        console.warn('⚠️ Could not fetch order details:', detailsError)
      }

      // Step 4: Handle payment method specific logic
      console.log(`💳 Step 4: Processing payment with method: ${paymentMethod}`)

      if (paymentMethod === 'PAYPAL') {
        // For PayPal, create payment and redirect to approval URL
        console.log('💳 Creating PayPal payment...')

        // Lưu orderId, orderCode và paymentMethod vào localStorage để sử dụng khi PayPal redirect về
        const currentOrderCode = createOrderResponse.data.orderCode || `ORD-${createdOrderId}`
        setOrderId(createdOrderId)
        localStorage.setItem('paypal_order_id', createdOrderId.toString())
        localStorage.setItem('paypal_order_code', currentOrderCode)
        localStorage.setItem('payment_method', 'PAYPAL')
        console.log('💾 Saved to localStorage:', { orderId: createdOrderId, orderCode: currentOrderCode, paymentMethod: 'PAYPAL' })

        const paypalResponse = await PayPalService.createPayment(createdOrderId)

        if (!paypalResponse || !paypalResponse.success) {
          throw new Error('Failed to create PayPal payment')
        }

        console.log('✅ PayPal payment created:', paypalResponse.data)

        // Extract approval URL from response
        let approvalUrl = null

        if (typeof paypalResponse.data === 'string') {
          approvalUrl = paypalResponse.data
        } else if (paypalResponse.data && typeof paypalResponse.data === 'object') {
          approvalUrl = paypalResponse.data.approvalUrl ||
                       paypalResponse.data.approval_url ||
                       paypalResponse.data.checkoutUrl ||
                       paypalResponse.data.url
        }

        if (approvalUrl && typeof approvalUrl === 'string' && approvalUrl.trim()) {
          console.log('🔗 Redirecting to PayPal approval page:', approvalUrl)
          console.log('📝 Order ID saved for callback:', createdOrderId)
          message.success('Đang chuyển đến trang thanh toán PayPal...')
          setTimeout(() => {
            window.location.href = approvalUrl
          }, 1000)
          return
        } else {
          console.error('❌ PayPal response data:', paypalResponse.data)
          throw new Error('PayPal approval URL not found in response')
        }
      } else if (paymentMethod === 'PAYOS') {
        // For PAYOS, create payment link and redirect
        console.log('💳 Creating PayOS payment link...')

        // Lưu paymentMethod vào localStorage để sử dụng khi PayOS redirect về
        localStorage.setItem('payment_method', 'PAYOS')
        console.log('💾 Saved paymentMethod to localStorage: PAYOS')

        const paymentResponse = await PaymentService.createPaymentLink(
          createdOrderId,
          paymentMethod
        )

        if (!paymentResponse || !paymentResponse.success) {
          throw new Error('Failed to create payment link')
        }

        console.log('✅ Payment link created:', paymentResponse.data)

        // Extract checkout URL from response
        let checkoutUrl = null

        if (typeof paymentResponse.data === 'string') {
          checkoutUrl = paymentResponse.data
        } else if (paymentResponse.data && typeof paymentResponse.data === 'object') {
          checkoutUrl = paymentResponse.data.checkoutUrl ||
                       paymentResponse.data.paymentUrl ||
                       paymentResponse.data.url ||
                       paymentResponse.data.link
        }

        if (checkoutUrl && typeof checkoutUrl === 'string' && checkoutUrl.trim()) {
          console.log('🔗 Redirecting to PayOS checkout:', checkoutUrl)
          message.success('Đang chuyển đến trang thanh toán PayOS...')
          setTimeout(() => {
            window.location.href = checkoutUrl
          }, 1000)
          return
        } else {
          console.error('❌ Payment response data:', paymentResponse.data)
          throw new Error('Payment URL not found in response')
        }
      } else if (paymentMethod === 'COD') {
        // For COD, just show success
        console.log('✅ COD payment confirmed')
      }

      // For COD, delete cart items and show success
      if (!buyNow) {
        for (const item of order.items) {
          try {
            await CartService.deleteCartItem(item.cartItemId || item.id)
          } catch (err) {
            console.error('Error deleting cart item:', err)
          }
        }
      }

      setIsProcessing(false)
      setIsSuccess(true)
    } catch (error) {
      console.error('Error processing payment:', error)
      setIsProcessing(false)
      setIsSuccess(false)
      message.error(error.message || 'Payment failed. Please try again.')
    }
  }

  const handleApplyVoucher = async voucherObj => {
    setVoucher(voucherObj)
    if (!voucherObj) return;
    try {
      // Create a temporary order to apply voucher requires orderId; our backend applies voucher to an existing order
      // Here we assume createOrder has been called or we only validate on submit; for simplicity, just compute discount locally
      // If you want to validate with backend, call OrderService.testApplyVoucher(orderId, voucherObj.id)
    } catch (e) {
      console.warn('Voucher apply validation failed', e)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 pb-10'>
      {/* Header */}
      {/* Payment Header Banner - Softer Colors */}
      <div className='relative overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100'>
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-gradient-to-r from-blue-200/30 to-indigo-200/30'></div>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)`,
          }}
        ></div>

        {/* Content Container */}
        <div className='relative px-4 py-12'>
          {/* Main Title Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='mb-8 text-center'
          >
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='rounded-full border border-white/40 bg-white/60 p-3 shadow-lg backdrop-blur-sm'>
                <FaCreditCard className='text-3xl text-blue-600' />
              </div>
              <h1 className='text-5xl font-bold tracking-wide text-gray-700'>
                THANH TOÁN
              </h1>
            </div>
            <div className='mx-auto h-1 w-24 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent'></div>
          </motion.div>

          {/* Breadcrumb Navigation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='flex justify-center'
          >
            <div className='rounded-full border border-white/60 bg-white/40 px-6 py-3 shadow-lg backdrop-blur-md'>
              <div className='flex items-center gap-3 text-sm font-medium text-gray-600'>
                <span
                  className='flex cursor-pointer items-center gap-1 transition-colors duration-300 hover:text-blue-600'
                  onClick={() => navigate('/trang-chu')}
                >
                  <span>🏠</span>
                  <span>Trang chủ</span>
                </span>
                <span className='text-gray-400'>→</span>
                <span
                  className='flex cursor-pointer items-center gap-1 transition-colors duration-300 hover:text-blue-600'
                  onClick={() => navigate('/gio-hang')}
                >
                  <span>🛒</span>
                  <span>Giỏ hàng</span>
                </span>
                <span className='text-gray-400'>→</span>
                <span
                  className='flex cursor-pointer items-center gap-1 transition-colors duration-300 hover:text-blue-600'
                  onClick={() => navigate('/thanh-toan')}
                >
                  <span>💳</span>
                  <span>Thanh toán</span>
                </span>
                <span className='text-gray-400'>→</span>
                <span className='flex items-center gap-1 font-semibold text-blue-600'>
                  <span>✅</span>
                  <span>Xác nhận thanh toán</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Wave Effect */}
        <div className='absolute right-0 bottom-0 left-0'>
          <svg
            viewBox='0 0 1200 120'
            preserveAspectRatio='none'
            className='h-8 w-full fill-gray-50'
          >
            <path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z'></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      {!checkStatusPayment ? (
        <div className='mx-auto max-w-4xl px-8'>
          <div className='grid gap-6 md:grid-cols-2'>
            <OrderSummary formData={formData} paymentMethod={paymentMethod} />
            <VoucherBox onApply={handleApplyVoucher} />
          </div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='rounded-xl bg-white shadow-lg md:p-6'
          >
            {/* Payment Status */}
            <div className='text-center'>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProcessPayment}
                className='w-full max-w-md rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500'
              >
                Xác nhận thanh toán
              </motion.button>
            </div>

            {/* Order Details */}
            <div className='mt-4 border-t pt-2'>
              <h3 className='mb-2 text-lg font-semibold'>📦 Chi tiết đơn hàng</h3>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Tạm tính</span>
                  <span className='font-medium'>
                    {formatPrice(order?.subtotal || 0)}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Phí vận chuyển</span>
                  <span className='font-medium'>
                    {formatPrice(order.shipping || 0)}
                  </span>
                </div>
                <div className='flex justify-between border-t pt-2 text-sm'>
                  <span className='text-gray-600'>Voucher:</span>
                  <span className='font-medium'>
                    -{formatPrice(discountValue)}
                  </span>
                </div>
                <div className='flex justify-between border-t pt-4'>
                  <span className='font-semibold'>Tổng cộng</span>
                  <span className='text-lg font-bold'>
                    {formatPrice(order?.total - discountValue || 0)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="bg-white rounded-xl shadow-lg px-8 py-10 flex flex-col items-center max-w-md w-full">
            {/* Thông tin đơn hàng */}
            <div className="mb-4 w-full text-center border-b pb-4">
              <div className="flex items-center justify-center gap-2 text-base font-semibold text-gray-700">
                <span>🧾</span>
                <span>Mã giao dịch:</span>
                <span className="text-blue-600 font-bold">
                  {orderNumber || (searchParams.get('orderCode') ? "ORD-" + searchParams.get('orderCode') : '---')}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Tổng tiền:&nbsp;
                <span className="font-semibold text-gray-800">
                  {formatPrice((order?.total || 0) - discountValue)}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Phương thức:&nbsp;
                <span className="font-semibold text-gray-800 capitalize">
                  {paymentMethod === 'PAYOS' ? 'PayOS' : 'Thanh toán khi nhận hàng'}
                </span>
              </div>

              {/* Danh sách sản phẩm đã đặt */}
              {confirmItems && confirmItems.length > 0 && (
                <div className='mt-4 w-full text-left'>
                  <div className='mb-2 text-sm font-semibold text-gray-700'>Sản phẩm đã đặt</div>
                  <ul className='space-y-1 text-sm text-gray-700'>
                    {confirmItems.map((it, idx) => (
                      <li key={idx} className='flex justify-between'>
                        <span>{`${it.productName || it.name || 'Sản phẩm'} - ${it.sizeName || ('Size ' + (it.sizeId || ''))}`}</span>
                        <span>x{it.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            </div>
            {/* Trạng thái */}
            {isProcessing && (
              <div className='space-y-4 flex flex-col items-center'>
                <div className='mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
                <p className='text-lg text-gray-600'>
                  Đang xử lý thanh toán...
                </p>
              </div>
            )}
            {isSuccess && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className='space-y-4 flex flex-col items-center'
              >
                <FaCheckCircle className='mx-auto h-16 w-16 text-green-500' />
                <p className='text-lg text-green-600 font-semibold flex items-center gap-2'>
                  Đặt hàng thành công!
                </p>
              </motion.div>
            )}
            {!isProcessing && !isSuccess && (
              <div className='space-y-4 flex flex-col items-center'>
                <span className="mx-auto">
                  <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white"/>
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 9l6 6m0-6l-6 6"/>
                  </svg>
                </span>
                <p className='text-lg text-red-600 font-semibold flex items-center gap-2'>
                  <span className="inline-block">❌</span> Đặt hàng thất bại hoặc đã hủy!
                </p>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button
                className="flex items-center gap-2 px-5 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                onClick={() => navigate('/don-hang')}
              >
                <span>🧾</span> Xem đơn hàng
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                onClick={() => navigate('/san-pham')}
              >
                <span>🛒</span> Về trang sản phẩm
              </button>
            </div>
          </div>
        // </div>
      )}
    </div>
  )
}

export default Payment

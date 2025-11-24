import React, { useState, useEffect, useRef } from 'react'
import VoucherService from '@services/Voucher/VoucherService'
import { useAuth } from '../../../context/AuthContext'
import { message } from 'antd'

const VoucherBox = ({ onApply }) => {
  const [voucherInput, setVoucherInput] = useState('')
  const [listVoucher, setListVoucher] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef()
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth()

  const userId = currentUser?.id
  const ready = isAuthenticated && !!userId && !authLoading

  useEffect(() => {
    if (!ready) {
      setListVoucher([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchVouchers(voucherInput)
    }, 400)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line
  }, [voucherInput, ready, userId])

  const fetchVouchers = async (SearchTerm = null) => {
    if (!ready) return
    setLoading(true)
    try {
      const all = await VoucherService.getUserVouchers(userId)
      const filtered = SearchTerm
        ? all.filter(v => v.code.toLowerCase().includes(SearchTerm.toLowerCase()))
        : all
      setListVoucher(filtered)
    } catch (error) {
      setListVoucher([])
      console.error('Failed to fetch vouchers:', error)
    }
    setLoading(false)
  }

  const handleApply = () => {
    if (!ready) {
      message.warning('Vui lòng đăng nhập để áp dụng voucher')
      return
    }
    const found = listVoucher.find(v => v.code === voucherInput)
    if (!found) {
      message.warning('Mã voucher không hợp lệ hoặc không thuộc sở hữu của bạn')
      return
    }
    if (onApply) onApply(found)
  }

  const handleSelectVoucher = code => {
    setVoucherInput(code)
  }

  return (
    <div className='mb-4 rounded-xl bg-white p-6 shadow'>
      <h2 className='mb-4 text-2xl font-semibold text-gray-800'>Voucher</h2>
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <input
            type='text'
            value={voucherInput}
            onChange={e => setVoucherInput(e.target.value)}
            placeholder='Nhập mã giảm giá'
            className='w-full rounded border border-gray-300 px-3 py-2 pr-8'
          />
          {voucherInput && (
            <button
              type='button'
              onClick={() => {
                setVoucherInput('')
                if (onApply) onApply(null)
              }}
              className='absolute top-1/2 right-2 -translate-y-1/2 text-lg text-gray-400 hover:text-red-500'
              tabIndex={-1}
              aria-label='Xóa'
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={handleApply}
          className='rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700'
        >
          Áp dụng
        </button>
      </div>
      {loading && (
        <div className='mt-4 text-sm text-gray-500'>Đang tìm kiếm...</div>
      )}
      {!loading && listVoucher.length > 0 && (
        <div className='mt-4'>
          <div className='mb-2 text-sm text-gray-600'>
            {voucherInput ? 'Kết quả tìm kiếm:' : 'Mã gợi ý:'}
          </div>
          <div className='flex flex-wrap gap-2'>
            {listVoucher.slice(0, 3).map(v => (
              <button
                key={v.code}
                type='button'
                onClick={() => handleSelectVoucher(v.code)}
                className='rounded border border-blue-200 bg-blue-100 px-3 py-1 text-blue-700 transition hover:bg-blue-200'
              >
                {v.code}
              </button>
            ))}
          </div>
        </div>
      )}
      {!loading && voucherInput && listVoucher.length === 0 && (
        <div className='mt-4 text-sm text-gray-500'>
          Không tìm thấy mã phù hợp.
        </div>
      )}
    </div>
  )
}

export default VoucherBox

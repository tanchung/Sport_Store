import React, { useState } from 'react'
import { Search, Calendar, X, Loader2 } from 'lucide-react'
import { DatePicker, Button, Input, Space, message } from 'antd'
import { useOrderStore } from '../OrderStore'

const { RangePicker } = DatePicker

const SearchForm = () => {
  const {
    searchOrders,
    clearSearch,
    isSearchMode,
    searchLoading,
    searchError,
    searchFilters,
    searchResults,
    searchPagination,
  } = useOrderStore()

  const [searchTerm, setSearchTerm] = useState(searchFilters.searchTerm || '')
  const [dateRange, setDateRange] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Format date to yyyy-mm-dd
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleSearch = async () => {
    try {
      // Validate inputs
      if (!searchTerm.trim() && !dateRange) {
        message.warning('Vui lòng nhập từ khóa tìm kiếm hoặc chọn khoảng thời gian')
        return
      }

      let startDate = ''
      let endDate = ''

      if (dateRange && dateRange.length === 2) {
        startDate = formatDate(dateRange[0])
        endDate = formatDate(dateRange[1])

        // Validate date range
        if (new Date(startDate) > new Date(endDate)) {
          message.error('Ngày bắt đầu không thể sau ngày kết thúc')
          return
        }
      }

      const searchParams = {
        searchTerm: searchTerm.trim(),
        startDate,
        endDate,
      }

      await searchOrders(searchParams)
      message.success(`Tìm thấy ${searchResults.length} đơn hàng`)
    } catch (error) {
      console.error('Search error:', error)
      message.error(error.message || 'Có lỗi xảy ra khi tìm kiếm')
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setDateRange(null)
    clearSearch()
    setIsExpanded(false)
    message.info('Đã xóa kết quả tìm kiếm')
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
    
    </div>
  )
}

export default SearchForm

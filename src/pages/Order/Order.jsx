import React, { useEffect, useState } from 'react'
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { Menu } from 'antd'
import OrderHistory from './History'
import OrderPending from './Pending'
import OrderConfirmed from './Confirmed'
import OrderShipping from './Shipping'
import OrderProcessing from './Processing'
import OrderCancelRequested from './CancelRequested'
import SearchForm from './Components/SearchForm'
import { useOrderStore } from './OrderStore'

const items = [
  {
    label: 'Chờ xác nhận',
    key: 'PENDING',
    icon: <MailOutlined />,
  },
  {
    label: 'Chờ xác nhận hủy',
    key: 'CANCEL_REQUESTED',
    icon: <MailOutlined />,
  },
  {
    label: 'Đã xác nhận',
    key: 'CONFIRMED',
    icon: <AppstoreOutlined />,
  },
  {
    label: 'Đang xử lý',
    key: 'PROCESSING',
    icon: <SyncOutlined />,
  },
  {
    label: 'Đang giao',
    key: 'SHIPPING',
    icon: <SettingOutlined />,
  },
  {
    label: 'Lịch sử đơn hàng',
    key: 'HISTORY',
    icon: <SettingOutlined />,
  },
]

const Order = () => {
  const {
    fetchOrdersShipping,
    fetchOrdersConfirmed,
    fetchOrdersHistory,
    fetchOrdersPending,
    fetchOrdersProcessing,
  } = useOrderStore()
  useEffect(() => {
    const loadAllOrders = async () => {
      try {
        await Promise.all([
          fetchOrdersPending(),
          fetchOrdersProcessing(),
          fetchOrdersConfirmed(),
          fetchOrdersShipping(),
          fetchOrdersHistory(),
        ])
      } catch (error) {}
    }

    loadAllOrders()
  }, [
    fetchOrdersPending,
    fetchOrdersProcessing,
    fetchOrdersConfirmed,
    fetchOrdersShipping,
    fetchOrdersHistory,
  ])
  const [current, setCurrent] = useState('PENDING')

  const onClick = e => {
    setCurrent(e.key)
  }

  const renderContent = () => {
    switch (current) {
      case 'PENDING':
        return <OrderPending />
      case 'CANCEL_REQUESTED':
        return <OrderCancelRequested />
      case 'PROCESSING':
        return <OrderProcessing />
      case 'CONFIRMED':
        return <OrderConfirmed />
      case 'SHIPPING':
        return <OrderShipping />
      case 'HISTORY':
        return <OrderHistory />
      default:
        return <OrderPending />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        mode='horizontal'
        items={items}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      />
      <div
        style={{
          padding: '20px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Search Form - Always visible */}
        <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '20px' }}>
          <SearchForm />
        </div>

        {/* Order Content */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default Order

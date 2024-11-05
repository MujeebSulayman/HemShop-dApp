import withBuyerLayout from '@/components/hoc/withBuyerLayout'
import React from 'react'

const OrdersPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Orders</h1>
    </div>
  )
}

export default withBuyerLayout(OrdersPage)

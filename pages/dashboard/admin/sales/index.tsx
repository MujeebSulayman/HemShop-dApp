import React from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'

const SalesOverviewPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sales Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400">Total Sales</h3>
          <p className="text-2xl text-white">0</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400">Service Fees Collected</h3>
          <p className="text-2xl text-white">0 ETH</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400">Active Sellers</h3>
          <p className="text-2xl text-white">0</p>
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(SalesOverviewPage) 
import React from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'

const AdminOrdersPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Add your orders content here */}
      </div>
    </div>
  )
}

export default withAdminLayout(AdminOrdersPage)

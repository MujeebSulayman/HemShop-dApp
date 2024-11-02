import React from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'

const AdminProducts = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Products Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Add your products table or grid here */}
        <div className="grid gap-4">
          {/* Product list and management tools */}
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(AdminProducts)

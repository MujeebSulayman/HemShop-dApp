import DashboardLayout from '@/components/dashboard/DashboardLayout'
import React from 'react'

const SellerProfilePage = () => {
  return (
    <DashboardLayout userRole="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Seller Profile</h1>
      </div>
    </DashboardLayout>
  )
}

export default SellerProfilePage 
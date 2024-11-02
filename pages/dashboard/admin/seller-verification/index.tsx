import React from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'

const SellerVerificationPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Seller Verification</h1>
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          <h2 className="text-xl text-white">Pending Verifications</h2>
          <div className="grid gap-4">
            {/* Seller verification table */}
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="text-left text-gray-300">Seller Address</th>
                  <th className="text-left text-gray-300">Status</th>
                  <th className="text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {/* Seller rows */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(SellerVerificationPage) 
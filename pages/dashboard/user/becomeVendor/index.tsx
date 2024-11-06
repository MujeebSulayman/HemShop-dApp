import withUserLayout from '@/components/hoc/withUserLayout'
import React from 'react'

const BecomeVendor = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Become a Vendor</h1>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {/* Add your vendor application form here */}
        <p className="text-gray-300">Complete the form below to become a vendor</p>
      </div>
    </div>
  )
}

export default withUserLayout(BecomeVendor)

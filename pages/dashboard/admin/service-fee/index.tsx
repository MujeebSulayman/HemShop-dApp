import React, { useState } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'

const ServiceFeePage = () => {
  const [newFee, setNewFee] = useState<number>(0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Service Fee Management</h1>
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Current Service Fee (%)</label>
            <div className="text-2xl text-white">5%</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">New Service Fee (%)</label>
            <input 
              type="number" 
              min="0" 
              max="100"
              value={newFee}
              onChange={(e) => setNewFee(Number(e.target.value))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Update Service Fee
          </button>
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(ServiceFeePage) 
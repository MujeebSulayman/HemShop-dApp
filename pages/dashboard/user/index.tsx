import React from 'react'
import withUserLayout from '@/components/hoc/withUserLayout'

const UserDashboard = () => {
  const stats = [
    { label: 'Total Sales', value: '$12,345', change: '+12%' },
    { label: 'Active Products', value: '48', change: '+3' },
    { label: 'Pending Orders', value: '5', change: '-2' },
    { label: 'Customer Rating', value: '4.8', change: '+0.2' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Seller Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">{stat.label}</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-2xl font-semibold text-white">{stat.value}</div>
              <div className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default withUserLayout(UserDashboard)

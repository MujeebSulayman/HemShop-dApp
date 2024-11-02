import React from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { 
  UsersIcon, ShoppingCartIcon, 
  CubeIcon, CurrencyDollarIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon 
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  const stats = [
    { 
      title: 'Total Users', 
      value: '1,234', 
      change: '+12.5%',
      trend: 'up',
      icon: UsersIcon 
    },
    { 
      title: 'Total Orders', 
      value: '567', 
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCartIcon 
    },
    { 
      title: 'Total Products', 
      value: '890', 
      change: '-3.1%',
      trend: 'down',
      icon: CubeIcon 
    },
    { 
      title: 'Total Revenue', 
      value: '$12,345', 
      change: '+15.3%',
      trend: 'up',
      icon: CurrencyDollarIcon 
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Dashboard Overview</h1>
        <div className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
          
          return (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-700/50 rounded-lg">
                  <Icon className="w-6 h-6 text-gray-300" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-gray-400 text-sm">{stat.title}</h3>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional dashboard content can go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          {/* Add recent activity content */}
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Performance Overview</h2>
          {/* Add performance metrics content */}
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(AdminDashboard)

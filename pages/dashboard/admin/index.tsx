import React from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { 
  UsersIcon, ShoppingCartIcon, 
  CubeIcon, CurrencyDollarIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  UserGroupIcon, ChartBarIcon, ScaleIcon, TagIcon,
  ClockIcon, CheckCircleIcon
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  const mainMetrics = [
    { 
      title: 'Gross Merchandise Value', 
      value: '$123,456', 
      change: '+15.3%',
      trend: 'up',
      icon: CurrencyDollarIcon 
    },
    { 
      title: 'Total Orders', 
      value: '567', 
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCartIcon 
    },
    { 
      title: 'Active Sellers', 
      value: '89', 
      change: '+12.5%',
      trend: 'up',
      icon: UserGroupIcon 
    },
    { 
      title: 'Conversion Rate', 
      value: '3.2%', 
      change: '+0.5%',
      trend: 'up',
      icon: ChartBarIcon 
    },
  ]

  const secondaryMetrics = [
    {
      title: 'Average Order Value',
      value: '$217.89',
      change: '+5.2%',
      trend: 'up',
      icon: ScaleIcon
    },
    {
      title: 'Active Products',
      value: '1,234',
      change: '+2.1%',
      trend: 'up',
      icon: CubeIcon
    },
    {
      title: 'Customer Acquisition Cost',
      value: '$24.50',
      change: '-8.3%',
      trend: 'down',
      icon: TagIcon
    },
    {
      title: 'Fulfillment Time',
      value: '2.3 days',
      change: '-12.5%',
      trend: 'down',
      icon: ClockIcon
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Dashboard Overview</h1>
        <div className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</div>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-200">Primary Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainMetrics.map((stat, index) => {
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
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-200">Secondary Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {secondaryMetrics.map((stat, index) => {
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
          {/* Add order table with columns: Order ID, Customer, Amount, Status, Date */}
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Top Selling Products</h2>
          {/* Add product table with columns: Product, Sales, Revenue, Trend */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Customer Satisfaction</h2>
          {/* Add satisfaction metrics and ratings distribution */}
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Seller Performance</h2>
          {/* Add seller ratings and performance metrics */}
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Revenue Distribution</h2>
          {/* Add revenue by category/seller pie chart */}
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(AdminDashboard)

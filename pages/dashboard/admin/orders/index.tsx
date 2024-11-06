import React, { useEffect, useState } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { getSellerPurchaseHistory, fromWei } from '@/services/blockchain'
import { PurchaseHistoryStruct } from '@/utils/type.dt'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import {
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiSearch,
} from 'react-icons/fi'

const AdminOrdersPage = () => {
  const { address } = useAccount()
  const [orders, setOrders] = useState<PurchaseHistoryStruct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'delivered' | 'pending'>('all')

  useEffect(() => {
    if (address) {
      fetchOrders()
    }
  }, [address])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getSellerPurchaseHistory(address as string)
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productId.toString().includes(searchTerm)

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'delivered' && order.isDelivered) ||
      (filterStatus === 'pending' && !order.isDelivered)

    return matchesSearch && matchesStatus
  })

  const stats = [
    {
      title: 'Total Orders',
      value: orders.length,
      icon: FiPackage,
      color: 'text-blue-500',
    },
    {
      title: 'Total Revenue',
      value: `${orders.reduce((acc, order) => acc + order.totalAmount, 0).toFixed(4)} ETH`,
      icon: FiDollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Delivered Orders',
      value: orders.filter((order) => order.isDelivered).length,
      icon: FiTruck,
      color: 'text-indigo-500',
    },
    {
      title: 'Pending Orders',
      value: orders.filter((order) => !order.isDelivered).length,
      icon: FiTruck,
      color: 'text-yellow-500',
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Orders Management</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by buyer address or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'delivered' | 'pending')}
          className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
        >
          <option value="all">All Orders</option>
          <option value="delivered">Delivered</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={`${order.productId}-${order.timestamp}`} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-white">#{order.productId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {order.buyer.slice(0, 6)}...{order.buyer.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {order.totalAmount.toFixed(4)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          order.isDelivered
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {order.isDelivered ? 'Delivered' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(order.timestamp * 1000).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(AdminOrdersPage)

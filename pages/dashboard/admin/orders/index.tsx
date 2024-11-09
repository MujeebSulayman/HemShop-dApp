import withAdminLayout from '@/components/hoc/withAdminLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getAllOrders } from '@/services/blockchain'
import { PurchaseHistoryStruct } from '@/utils/type.dt'
import { format } from 'date-fns'
import { FiPackage, FiEye, FiFilter, FiSearch } from 'react-icons/fi'
import { Loader2 } from 'lucide-react'

const AdminOrdersPage = () => {
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseHistoryStruct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered'>('all')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getAllOrders()
      // Sort by timestamp descending (newest first)
      const sortedOrders = data.sort((a, b) => b.timestamp - a.timestamp)
      setOrders(sortedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productId.toString().includes(searchQuery)

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'delivered' && order.isDelivered) ||
      (statusFilter === 'pending' && !order.isDelivered)

    return matchesSearch && matchesStatus
  })

  const getOrderStats = () => {
    return {
      total: orders.length,
      delivered: orders.filter(order => order.isDelivered).length,
      pending: orders.filter(order => !order.isDelivered).length,
      totalValue: orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    }
  }

  const stats = getOrderStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Delivered Orders</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{stats.delivered}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalValue.toFixed(4)} ETH</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name, buyer, or seller address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-400"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'delivered')}
            className="px-4 py-2 bg-gray-800 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
          </select>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={`${order.productId}-${order.timestamp}`}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16">
                  {order.orderDetails.images[0] ? (
                    <img
                      src={order.orderDetails.images[0]}
                      alt={order.orderDetails.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 rounded-md flex items-center justify-center">
                      <FiPackage className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{order.orderDetails.name}</h3>
                  <p className="text-sm text-gray-400">
                    Order #{order.productId.toString().padStart(8, '0')}
                  </p>
                  <p className="text-sm text-gray-400">
                    Buyer: {order.buyer.slice(0, 6)}...{order.buyer.slice(-4)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {format(order.timestamp * 1000, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-white font-medium">
                    {order.totalAmount.toFixed(4)} ETH
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      order.isDelivered
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {order.isDelivered ? 'Delivered' : 'Pending'}
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/admin/orders/${order.productId}`)}
                  className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <FiEye className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <FiPackage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-100 mb-2">No Orders Found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default withAdminLayout(AdminOrdersPage)

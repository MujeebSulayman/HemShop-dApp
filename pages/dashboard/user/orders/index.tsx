import withUserLayout from '@/components/hoc/withUserLayout'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
import { getBuyerPurchaseHistory } from '@/services/blockchain'
import { PurchaseHistoryStruct } from '@/utils/type.dt'
import { format } from 'date-fns'
import { FiPackage, FiEye } from 'react-icons/fi'
import { Loader2 } from 'lucide-react'

const UserOrders = () => {
  const { address } = useAccount()
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseHistoryStruct[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    if (!address) return
    try {
      setLoading(true)
      const data = await getBuyerPurchaseHistory(address)
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
    if (address) {
      fetchOrders()
    }
  }, [address])

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

  if (!orders.length) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <FiPackage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-100 mb-2">No Orders Yet</h3>
          <p className="text-gray-400">Your order history will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
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
                  onClick={() => router.push(`/dashboard/user/orders/${order.productId}`)}
                  className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <FiEye className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default withUserLayout(UserOrders)

import withUserLayout from '@/components/hoc/withUserLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { PurchaseHistoryStruct } from '@/utils/type.dt'
import { getBuyerPurchaseHistory, markPurchaseDelivered, isOwnerOrVerifiedSeller } from '@/services/blockchain'
import { FiPackage, FiTruck, FiUser, FiMapPin } from 'react-icons/fi'

const OrderDetail = () => {
  const router = useRouter()
  const { id } = router.query
  const { address } = useAccount()
  const [order, setOrder] = useState<PurchaseHistoryStruct | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (address && id) {
      fetchOrder()
      checkAuthorization()
    }
  }, [address, id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const history = await getBuyerPurchaseHistory(address as string)
      const orderDetail = history.find(
        (order) => order.productId.toString() === id
      )
      if (orderDetail) {
        setOrder(orderDetail)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAuthorization = async () => {
    try {
      const authorized = await isOwnerOrVerifiedSeller()
      setIsAuthorized(authorized)
    } catch (error) {
      console.error('Error checking authorization:', error)
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || !address) return

    try {
      setUpdating(true)
      await markPurchaseDelivered(order.productId, order.buyer)
      await fetchOrder()
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-400">Loading order details...</div>
  }

  if (!order) {
    return <div className="p-6 text-center text-gray-400">Order not found</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Order #{order.productId.toString()}</h1>
        {isAuthorized && !order.isDelivered && (
          <button
            onClick={handleUpdateStatus}
            disabled={updating}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Mark as Delivered'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Info */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Order Information</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <FiPackage className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="text-gray-400">Status</p>
                <p className={`text-lg ${order.isDelivered ? 'text-green-400' : 'text-yellow-400'}`}>
                  {order.isDelivered ? 'Delivered' : 'Pending'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <FiTruck className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <p className="text-gray-400">Amount</p>
                <p className="text-lg text-white">{order.totalAmount.toFixed(4)} ETH</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiUser className="w-5 h-5 text-indigo-500 mr-3" />
              <div>
                <p className="text-gray-400">Seller</p>
                <p className="text-lg text-white">
                  {order.seller.slice(0, 6)}...{order.seller.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Shipping Details</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <FiMapPin className="w-5 h-5 text-purple-500 mr-3 mt-1" />
              <div className="flex-1">
                <p className="text-gray-400">Delivery Address</p>
                <p className="text-lg text-white">{order.shippingDetails.fullName}</p>
                <p className="text-gray-300">{order.shippingDetails.streetAddress}</p>
                <p className="text-gray-300">
                  {order.shippingDetails.city}, {order.shippingDetails.state}{' '}
                  {order.shippingDetails.postalCode}
                </p>
                <p className="text-gray-300">{order.shippingDetails.country}</p>
                <p className="text-gray-300 mt-2">
                  Phone: {order.shippingDetails.phone}
                </p>
                <p className="text-gray-300">
                  Email: {order.shippingDetails.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withUserLayout(OrderDetail)

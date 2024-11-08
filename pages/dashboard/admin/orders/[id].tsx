import withAdminLayout from '@/components/hoc/withAdminLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { PurchaseHistoryStruct, OrderStatus } from '@/utils/type.dt'
import { getAllOrders, markPurchaseDelivered } from '@/services/blockchain'
import { FiPackage, FiTruck, FiUser, FiMapPin, FiClock, FiArrowLeft } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'

const AdminOrderDetail = () => {
  const router = useRouter()
  const { id } = router.query
  const { address } = useAccount()
  const [order, setOrder] = useState<PurchaseHistoryStruct | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      fetchOrder()
    }
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const orders = await getAllOrders()
      const orderDetail = orders.find(
        (order) => order.productId === Number(id)
      )
      if (orderDetail) {
        setOrder(orderDetail)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || !address) return

    try {
      setUpdating(true)
      await markPurchaseDelivered(order.productId, order.buyer)
      await fetchOrder()
      toast.success('Order status updated successfully')
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-gray-400">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-400">
          <p className="text-xl">Order not found</p>
          <button
            onClick={() => router.push('/dashboard/admin/orders')}
            className="mt-4 text-indigo-400 hover:text-indigo-300"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/admin/orders')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Order #{order.productId.toString()}
            </h1>
            <p className="text-gray-400 mt-1">
              Placed on {new Date(order.timestamp * 1000).toLocaleString()}
            </p>
          </div>
        </div>
        {!order.isDelivered && (
          <button
            onClick={handleUpdateStatus}
            disabled={updating}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updating
              ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FiPackage className="w-4 h-4" />
                  <span>Mark as Delivered</span>
                </>
              )}
          </button>
        )}
      </div>

      {/* Add Order Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Details Card */}
        <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white mb-4">
            <FiMapPin className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Shipping Details</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm">Full Name</label>
              <p className="text-white">{order.shippingDetails.fullName}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <p className="text-white">{order.shippingDetails.email}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Phone</label>
              <p className="text-white">{order.shippingDetails.phone}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Address</label>
              <p className="text-white">{order.shippingDetails.streetAddress}</p>
              <p className="text-white">
                {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.postalCode}
              </p>
              <p className="text-white">{order.shippingDetails.country}</p>
            </div>
          </div>
        </div>

        {/* Order Details Card - New Addition */}
        <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white mb-4">
            <FiPackage className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Order Details</h2>
          </div>

          <div className="space-y-4">
            {/* Product Information */}
            <div className="flex gap-4 border-b border-gray-700/50 pb-4">
              <img
                src={order.orderDetails.images?.[0] || '/placeholder.png'}
                alt="Product"
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-white font-medium">{order.orderDetails.name}</h3>
                
                {/* Product Variations */}
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-400">
                    Color: {order.orderDetails.selectedColor}
                  </p>
                  <p className="text-sm text-gray-400">
                    Size: {order.orderDetails.selectedSize}
                  </p>
                  <p className="text-sm text-gray-400">
                    Quantity: {order.orderDetails.quantity}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">
                  {order.basePrice.toFixed(4)} ETH
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{order.basePrice.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-white">~0.001 ETH</span>
              </div>
              <div className="border-t border-gray-700/50 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white font-medium">
                    {order.totalAmount.toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Card */}
        <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white mb-4">
            <FiClock className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Order Status</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                order.isDelivered 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {order.isDelivered ? 'Delivered' : 'Pending'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Order Date</span>
                <span className="text-white">
                  {new Date(order.timestamp * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Buyer Address</span>
                <span className="text-white">
                  {`${order.buyer.slice(0, 6)}...${order.buyer.slice(-4)}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Seller Address</span>
                <span className="text-white">
                  {`${order.seller.slice(0, 6)}...${order.seller.slice(-4)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <div className="flex items-center gap-2 text-white mb-4">
          <FiTruck className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Delivery Timeline</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${
              order.isDelivered ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <div>
              <p className="text-white font-medium">
                {order.isDelivered ? 'Order Delivered' : 'Order Processing'}
              </p>
              <p className="text-sm text-gray-400">
                {order.isDelivered 
                  ? `Delivered on ${new Date((order.lastUpdated || order.timestamp) * 1000).toLocaleString()}`
                  : 'Awaiting delivery confirmation'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(AdminOrderDetail)

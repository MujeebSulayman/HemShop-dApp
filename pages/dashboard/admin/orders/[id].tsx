import React, { useEffect, useState } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { useRouter } from 'next/router'
import { getBuyerPurchaseHistory, fromWei } from '@/services/blockchain'
import { PurchaseHistoryStruct } from '@/utils/type.dt'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import {
  FiPackage,
  FiUser,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiTruck,
  FiArrowLeft,
} from 'react-icons/fi'
import Link from 'next/link'

const OrderDetail = () => {
  const router = useRouter()
  const { id } = router.query
  const { address } = useAccount()
  const [order, setOrder] = useState<PurchaseHistoryStruct | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address && id) {
      fetchOrderDetails()
    }
  }, [address, id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const orders = await getBuyerPurchaseHistory(address as string)
      const orderDetail = orders.find(
        (o) => o.productId.toString() === id
      )
      if (orderDetail) {
        setOrder(orderDetail)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-400">
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/dashboard/admin/orders" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
            ← Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/admin/orders"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Order #{order.productId}</h1>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            order.isDelivered
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {order.isDelivered ? 'Delivered' : 'Pending'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Order Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FiPackage className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Product ID</p>
                <p className="text-white">{order.productId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiDollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Total Amount</p>
                <p className="text-white">{order.totalAmount.toFixed(4)} ETH</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiClock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Order Date</p>
                <p className="text-white">
                  {new Date(order.timestamp * 1000).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Customer Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FiUser className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Buyer Address</p>
                <p className="text-white">{order.buyer}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiMapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Shipping Address</p>
                <p className="text-white">
                  {order.shippingDetails.street}, {order.shippingDetails.city}
                  <br />
                  {order.shippingDetails.state}, {order.shippingDetails.country}
                  <br />
                  {order.shippingDetails.zipCode}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 md:col-span-2"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Shipping Details</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FiTruck className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Delivery Status</p>
                <p className="text-white">
                  {order.isDelivered ? 'Delivered' : 'In Transit'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiUser className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Contact Information</p>
                <p className="text-white">
                  {order.shippingDetails.phone}
                  <br />
                  {order.shippingDetails.email}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default withAdminLayout(OrderDetail)

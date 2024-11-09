import withUserLayout from '@/components/hoc/withUserLayout'
import React, { useEffect, useState } from 'react'
import { getBuyerPurchaseHistory } from '@/services/blockchain'
import { PurchaseHistoryStruct } from '@/utils/type.dt'
import { useAccount } from 'wagmi'
import { format } from 'date-fns'
import { FiPackage, FiTruck, FiCheck } from 'react-icons/fi'

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState<PurchaseHistoryStruct[]>([])
  const [loading, setLoading] = useState(true)
  const { address } = useAccount()

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        if (!address) return
        const history = await getBuyerPurchaseHistory(address)
        const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp)
        setPurchases(sortedHistory)
      } catch (error) {
        console.error('Error fetching purchase history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchaseHistory()
  }, [address])

  const getOrderStatus = (purchase: PurchaseHistoryStruct) => {
    if (purchase.isDelivered) {
      return {
        icon: <FiCheck className="w-5 h-5" />,
        label: 'Delivered',
        color: 'text-green-400',
        bgColor: 'bg-green-900/30',
      }
    }
    return {
      icon: <FiTruck className="w-5 h-5" />,
      label: 'In Transit',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30',
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6">
              <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!purchases.length) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <FiPackage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-100 mb-2">No Orders Yet</h3>
          <p className="text-gray-400">When you place orders, they will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Order History</h1>
        
        <div className="space-y-4">
          {purchases.map((purchase, index) => {
            const status = getOrderStatus(purchase)
            return (
              <div key={`${purchase.productId}-${index}`} className="bg-gray-800 rounded-lg">
                {/* Order Header */}
                <div className="border-b border-gray-700 p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">
                      ORDER PLACED: {format(purchase.timestamp * 1000, 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-400">
                      ORDER ID: #{purchase.productId.toString().padStart(8, '0')}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bgColor} ${status.color}`}>
                    {status.icon}
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 flex-shrink-0">
                      {purchase.orderDetails.images[0] ? (
                        <img
                          src={purchase.orderDetails.images[0]}
                          alt={purchase.orderDetails.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded-md flex items-center justify-center">
                          <FiPackage className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-lg text-gray-100">
                        {purchase.orderDetails.name}
                      </h3>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-400">
                        <div>
                          <p>Quantity: {purchase.orderDetails.quantity}</p>
                          <p>Unit Price: ${purchase.basePrice}</p>
                          {purchase.orderDetails.selectedColor && (
                            <p>Color: {purchase.orderDetails.selectedColor}</p>
                          )}
                          {purchase.orderDetails.selectedSize && (
                            <p>Size: {purchase.orderDetails.selectedSize}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-100">
                            Total: ${purchase.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="font-medium text-gray-100 mb-2">Shipping Details</h4>
                    <div className="text-sm text-gray-400">
                      <p>{purchase.shippingDetails.fullName}</p>
                      <p>{purchase.shippingDetails.streetAddress}</p>
                      <p>
                        {purchase.shippingDetails.city}, {purchase.shippingDetails.state}{' '}
                        {purchase.shippingDetails.postalCode}
                      </p>
                      <p>{purchase.shippingDetails.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default withUserLayout(PurchaseHistory)

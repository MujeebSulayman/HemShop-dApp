import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { getBuyerPurchaseHistory } from '@/services/blockchain'
import { PurchaseHistoryStruct } from '@/utils/type.dt'
import { formatEther } from 'viem'
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { Loader2 } from 'lucide-react'
import withBuyerLayout from '@/components/hoc/withBuyerLayout'


const BuyerDashboard = () => {
  const { address } = useAccount()
  const [purchases, setPurchases] = useState<PurchaseHistoryStruct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBuyerData = async () => {
      if (!address) return
      try {
        const purchaseHistory = await getBuyerPurchaseHistory(address)
        setPurchases(purchaseHistory)
      } catch (error) {
        console.error('Error loading buyer data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBuyerData()
  }, [address])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // Calculate total spent
  const totalSpent = purchases.reduce((acc, purchase) => acc + Number(purchase.totalAmount), 0)

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Buyer Dashboard</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-gray-400">{address}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <ShoppingBagIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-white">{purchases.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-white">{formatEther(BigInt(totalSpent))} ETH</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <ClockIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pending Orders</p>
                <p className="text-2xl font-bold text-white">
                  {purchases.filter(p => !p.isDelivered).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <StarIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Reviews Given</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {purchases.slice(0, 5).map((purchase, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">Product #{purchase.productId}</p>
                  <p className="text-sm text-gray-400">
                    {purchase.isDelivered ? 'Delivered' : 'Pending'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {formatEther(BigInt(purchase.totalAmount))} ETH
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(Number(purchase.timestamp) * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withBuyerLayout(BuyerDashboard)

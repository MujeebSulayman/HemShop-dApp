import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { getMyProducts, getSellerStatus, getSellerBalance } from '@/services/blockchain'
import { ProductStruct, SellerStatus } from '@/utils/type.dt'
import { formatEther } from 'viem'

import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  TagIcon,
  ChartBarIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { Loader2 } from 'lucide-react'
import withSellerLayout from '@/components/hoc/withSellerLayout'

const SellerDashboard = () => {
  const { address } = useAccount()
  const [products, setProducts] = useState<ProductStruct[]>([])
  const [balance, setBalance] = useState<string>('0')
  const [status, setStatus] = useState<SellerStatus>(SellerStatus.Unverified)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSellerData = async () => {
      if (!address) return
      try {
        const [productsData, balanceData, statusData] = await Promise.all([
          getMyProducts(),
          getSellerBalance(address),
          getSellerStatus(address),
        ])
        setProducts(productsData)
        setBalance(formatEther(BigInt(balanceData)))
        setStatus(statusData)
      } catch (error) {
        console.error('Error loading seller data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSellerData()
  }, [address])

  const getStatusColor = (status: SellerStatus) => {
    switch (status) {
      case SellerStatus.Verified:
        return 'text-green-400 bg-green-400/10'
      case SellerStatus.Pending:
        return 'text-yellow-400 bg-yellow-400/10'
      case SellerStatus.Suspended:
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Seller Dashboard</h1>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}
            >
              {SellerStatus[status]}
            </span>
            <span className="text-gray-400">•</span>
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
                <p className="text-sm text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Available Balance</p>
                <p className="text-2xl font-bold text-white">{balance} ETH</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <TagIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Listings</p>
                <p className="text-2xl font-bold text-white">
                  {products.filter((p) => !p.soldout && !p.deleted).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withSellerLayout(SellerDashboard)

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import { getAllSellers } from '@/services/blockchain'
import { SellerData, SellerStatus } from '@/utils/type.dt'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Search, Package, TrendingUp, Users, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface StatusCount {
  [SellerStatus.Unverified]: number
  [SellerStatus.Pending]: number
  [SellerStatus.Verified]: number
  [SellerStatus.Suspended]: number
}

const VendorsPage = () => {
  const [sellers, setSellers] = useState<SellerData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all' | SellerStatus>('all')

  const router = useRouter()

  useEffect(() => {
    loadSellers()
  }, [])

  const loadSellers = async () => {
    try {
      setLoading(true)
      const data = await getAllSellers()
      setSellers(data)
    } catch (error: any) {
      console.error('Error loading sellers:', error)
      setError(error.message || 'Failed to load sellers')
    } finally {
      setLoading(false)
    }
  }

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.profile.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || seller.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusCounts = (): StatusCount => {
    return sellers.reduce(
      (acc, seller) => {
        acc[seller.status] = (acc[seller.status] || 0) + 1
        return acc
      },
      {
        [SellerStatus.Unverified]: 0,
        [SellerStatus.Pending]: 0,
        [SellerStatus.Verified]: 0,
        [SellerStatus.Suspended]: 0,
      }
    )
  }

  const getStatusColor = (status: SellerStatus): string => {
    switch (status) {
      case SellerStatus.Verified:
        return 'bg-green-500/20 text-green-400'
      case SellerStatus.Pending:
        return 'bg-yellow-500/20 text-yellow-400'
      case SellerStatus.Suspended:
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (loading) return <LoadingSpinner />
  if (error)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg border border-red-500/20">
          {error}
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 pt-[4rem] sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Marketplace Vendors</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover trusted vendors and explore their unique product offerings
          </p>
        </div> 

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl
              bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Search by business name, email, or address..."
          />
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSellers.map((seller) => (
            <div
              key={seller.address}
              onClick={() => router.push(`/vendor/${seller.address}`)}
              className="group bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 
                overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer
                hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {seller.profile.logo ? (
                    <img
                      src={seller.profile.logo}
                      alt={seller.profile.businessName}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-700 group-hover:ring-indigo-500/50"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-xl bg-gray-700/50 flex items-center justify-center
                      ring-2 ring-gray-700 group-hover:ring-indigo-500/50"
                    >
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {seller.profile.businessName}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1
                      ${getStatusColor(seller.status)}`}
                    >
                      {SellerStatus[seller.status]}
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {seller.profile.description}
                </p>

                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Products Available</span>
                    <span className="text-white font-medium bg-gray-700/50 px-2 py-1 rounded">
                      {seller.productIds?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VendorsPage

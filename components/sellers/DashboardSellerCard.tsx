import { SellerData, SellerStatus } from '@/utils/type.dt'
import { Loader2, Store, Package, Wallet, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatEther } from 'viem'
import SellerVerificationBadge from './SellerVerificationBadge'

interface DashboardSellerCardProps {
  seller: SellerData
  loading?: boolean
  updating: string | null
  mode: 'management' | 'verification'
  onUpdateStatus: (address: string, newStatus: SellerStatus) => Promise<void>
}

const DashboardSellerCard = ({ seller, loading, updating, mode, onUpdateStatus }: DashboardSellerCardProps) => {
  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 animate-pulse">
        <div className="h-20 bg-gray-700/50 rounded-lg mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
          <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <Link href={`/dashboard/admin/sellers/${seller.address}`}>
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 
        hover:border-indigo-500/50 transition-all duration-200 group">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 
              transition-colors">
              {seller.profile.businessName}
            </h3>
            <p className="text-sm text-gray-400 mt-1 font-mono">
              {seller.address.slice(0, 6)}...{seller.address.slice(-4)}
            </p>
          </div>
          <SellerVerificationBadge status={seller.status} size="sm" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Package className="w-4 h-4" />
              <span className="text-xs">Products</span>
            </div>
            <p className="text-white font-semibold">{seller.productIds.length}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Wallet className="w-4 h-4" />
              <span className="text-xs">Balance</span>
            </div>
            <p className="text-white font-semibold">
              {formatEther(BigInt(seller.balance))} ETH
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Store className="w-4 h-4" />
              <span className="text-xs">Store</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300">
              <span className="text-sm">View</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Registered:</span>
            <span className="text-sm text-white">
              {new Date(Number(seller.profile.registeredAt) * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default DashboardSellerCard 
import { SellerData, SellerStatus } from '@/utils/type.dt'
import { Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface SellerCardProps {
  seller: SellerData
  mode: 'verification' | 'management'
  updating: string | null
  onUpdateStatus: (address: string, status: number) => Promise<void>
}

export const SellerCard = ({ seller, mode, updating, onUpdateStatus }: SellerCardProps) => {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const cardContent = (
    <>
      {/* Business Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {seller.profile.businessName}
          {seller.profile.logo && (
            <img src={seller.profile.logo} alt="Logo" className="w-6 h-6 rounded-full" />
          )}
        </h3>
        <p className="text-sm text-gray-400 mt-1">{seller.profile.email}</p>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-400">
          <span className="font-medium text-gray-300">Status:</span>{' '}
          {SellerStatus[seller.status]}
        </p>
        <p className="text-sm text-gray-400">
          <span className="font-medium text-gray-300">Phone:</span> {seller.profile.phone}
        </p>
        <p className="text-sm text-gray-400">
          <span className="font-medium text-gray-300">Address:</span>{' '}
          <a
            href={`https://etherscan.io/address/${seller.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
          >
            {truncateAddress(seller.address)}
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>

      {/* Actions */}
      {mode === 'verification' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateStatus(seller.address, SellerStatus.Verified)}
            disabled={updating === seller.address}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50"
          >
            {updating === seller.address ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Approve
          </button>
          <button
            onClick={() => onUpdateStatus(seller.address, SellerStatus.Suspended)}
            disabled={updating === seller.address}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
          >
            {updating === seller.address ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Reject
          </button>
        </div>
      )}
    </>
  )

  if (mode === 'management') {
    return (
      <Link
        href={`/dashboard/admin/sellers/${seller.address}`}
        className="block bg-gray-800/30 hover:bg-gray-800/50 rounded-2xl transition-all duration-300"
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 relative group">
      {cardContent}
    </div>
  )
} 
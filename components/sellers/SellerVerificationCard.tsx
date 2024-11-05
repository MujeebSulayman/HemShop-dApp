import { SellerData, SellerStatus } from '@/utils/type.dt'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SellerVerificationCardProps {
  seller: SellerData
  onVerify: (address: string) => Promise<void>
  onReject: (address: string) => Promise<void>
  isProcessing?: boolean
}

export const SellerVerificationCard = ({
  seller,
  onVerify,
  onReject,
  isProcessing
}: SellerVerificationCardProps) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {seller.profile.businessName}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Registered {formatDistanceToNow(seller.profile.registeredAt * 1000)} ago
          </p>
        </div>
        <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-400">
          Pending
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-300">{seller.profile.description}</p>
        <p className="text-sm text-gray-400">
          Email: {seller.profile.email}
        </p>
        <p className="text-sm text-gray-400">
          Phone: {seller.profile.phone}
        </p>
        <p className="text-sm font-mono text-gray-400">
          Address: {seller.address.slice(0, 6)}...{seller.address.slice(-4)}
        </p>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => onVerify(seller.address)}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
            bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 
            disabled:opacity-50 transition-colors"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Verify
        </button>
        <button
          onClick={() => onReject(seller.address)}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
            bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 
            disabled:opacity-50 transition-colors"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Reject
        </button>
      </div>
    </div>
  )
} 
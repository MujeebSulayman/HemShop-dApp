import { SellerData, SellerStatus } from '@/utils/type.dt'
import Link from 'next/link'

interface SellerCardProps {
  seller: SellerData
  mode?: 'management'
  updating: string | null
  onUpdateStatus: (address: string, status: SellerStatus) => void
}

const SellerCard = ({ seller, mode, updating, onUpdateStatus }: SellerCardProps) => {
  const getStatusBadge = (status: SellerStatus) => {
    switch (status) {
      case SellerStatus.Verified:
        return <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">Verified</span>
      case SellerStatus.Pending:
        return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm">Pending</span>
      case SellerStatus.Suspended:
        return <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-sm">Suspended</span>
      default:
        return null
    }
  }

  return (
    <Link href={`/dashboard/admin/sellers/${seller.address}`}>
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-indigo-500/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{seller.profile.businessName}</h3>
            <p className="text-sm text-gray-400">{seller.address}</p>
          </div>
          {getStatusBadge(seller.status)}
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Products</span>
            <span className="text-white">{seller.productIds.length}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Balance</span>
            <span className="text-white">{seller.balance} ETH</span>
          </div>

          {mode === 'management' && seller.status === SellerStatus.Pending && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onUpdateStatus(seller.address, SellerStatus.Verified)
                }}
                disabled={!!updating}
                className="flex-1 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg
                  hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                {updating === seller.address ? 'Verifying...' : 'Verify'}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onUpdateStatus(seller.address, SellerStatus.Suspended)
                }}
                disabled={!!updating}
                className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg
                  hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {updating === seller.address ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default SellerCard 
import { useEffect, useState } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { getAllSellers, updateSellerStatus } from '@/services/blockchain'
import { SellerProfile, SellerStatus } from '@/utils/type.dt'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'

interface SellerData {
  address: string
  profile: SellerProfile
  status: SellerStatus
}

const SellerManagementPage = () => {
  const [sellers, setSellers] = useState<SellerData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadSellers()
  }, [])

  const loadSellers = async () => {
    try {
      const data = await getAllSellers()
      setSellers(data)
    } catch (error) {
      console.error('Error loading sellers:', error)
      toast.error('Failed to load sellers')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (address: string, newStatus: SellerStatus) => {
    setUpdating(address)
    try {
      await updateSellerStatus(address, newStatus)
      await loadSellers() // Refresh the list
      toast.success('Seller status updated successfully')
    } catch (error) {
      console.error('Error updating seller status:', error)
      toast.error('Failed to update seller status')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Seller Management</h1>
        <span className="text-gray-400">{sellers.length} Sellers</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sellers.map((seller) => (
          <div
            key={seller.address}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {seller.profile.businessName}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{seller.profile.email}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                seller.status === SellerStatus.Verified
                  ? 'bg-green-500/20 text-green-400'
                  : seller.status === SellerStatus.Pending
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {SellerStatus[seller.status]}
              </span>
            </div>

            <p className="text-sm text-gray-400 line-clamp-2">
              {seller.profile.description}
            </p>

            <div className="pt-4 border-t border-gray-700/50">
              <div className="flex gap-2">
                {seller.status === SellerStatus.Pending && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(seller.address, SellerStatus.Verified)}
                      disabled={updating === seller.address}
                      className="flex-1 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg
                        hover:bg-green-600/30 disabled:opacity-50 transition-all duration-200"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(seller.address, SellerStatus.Suspended)}
                      disabled={updating === seller.address}
                      className="flex-1 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg
                        hover:bg-red-600/30 disabled:opacity-50 transition-all duration-200"
                    >
                      Reject
                    </button>
                  </>
                )}
                {seller.status === SellerStatus.Verified && (
                  <button
                    onClick={() => handleUpdateStatus(seller.address, SellerStatus.Suspended)}
                    disabled={updating === seller.address}
                    className="w-full px-3 py-2 bg-red-600/20 text-red-400 rounded-lg
                      hover:bg-red-600/30 disabled:opacity-50 transition-all duration-200"
                  >
                    Suspend
                  </button>
                )}
                {seller.status === SellerStatus.Suspended && (
                  <button
                    onClick={() => handleUpdateStatus(seller.address, SellerStatus.Verified)}
                    disabled={updating === seller.address}
                    className="w-full px-3 py-2 bg-green-600/20 text-green-400 rounded-lg
                      hover:bg-green-600/30 disabled:opacity-50 transition-all duration-200"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default withAdminLayout(SellerManagementPage)

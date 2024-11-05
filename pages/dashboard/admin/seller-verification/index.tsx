import { useEffect, useState } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { getPendingVerificationUsers, getSellerProfile, updateSellerStatus } from '@/services/blockchain'
import { SellerData, SellerStatus } from '@/utils/type.dt'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'
import { SellerCard } from '@/components/sellers/SellerCard'

const SellerVerificationPage = () => {
  const [sellers, setSellers] = useState<SellerData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadPendingSellers()
  }, [])

  const loadPendingSellers = async () => {
    try {
      const pendingAddresses = await getPendingVerificationUsers()
      const sellersData = await Promise.all(
        pendingAddresses.map(async (address) => {
          const data = await getSellerProfile(address)
          return {
            address,
            profile: data,
            status: SellerStatus.Pending,
            balance: 0,
            productIds: []
          }
        })
      )
      setSellers(sellersData)
    } catch (error) {
      console.error('Error loading pending sellers:', error)
      toast.error('Failed to load pending sellers')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (address: string, newStatus: SellerStatus) => {
    setUpdating(address)
    try {
      await updateSellerStatus(address, newStatus)
      setSellers((prev) => prev.filter((seller) => seller.address !== address))
      toast.success(`Seller ${newStatus === SellerStatus.Verified ? 'approved' : 'rejected'}`)
    } catch (error) {
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
        <h1 className="text-2xl font-bold text-white">Seller Verification</h1>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm">
            {sellers.length} Pending
          </span>
        </div>
      </div>

      {sellers.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
          <p className="text-gray-400">No pending seller verifications</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sellers.map((seller) => (
            <SellerCard
              key={seller.address}
              seller={seller}
              mode="verification"
              updating={updating}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default withAdminLayout(SellerVerificationPage)

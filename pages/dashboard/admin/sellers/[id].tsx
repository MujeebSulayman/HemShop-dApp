import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { getSellerProfile, getSellerStatus, updateSellerStatus } from '@/services/blockchain'
import { SellerProfile, SellerStatus } from '@/utils/type.dt'
import { toast } from 'react-toastify'
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import DashboardSellerCard from '@/components/sellers/DashboardSellerCard'

const SellerDetailsPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [seller, setSeller] = useState<{
    address: string
    profile: SellerProfile
    status: SellerStatus
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadSellerDetails(id)
    }
  }, [id])

  const loadSellerDetails = async (address: string) => {
    try {
      const [profile, status] = await Promise.all([
        getSellerProfile(address),
        getSellerStatus(address),
      ])
      setSeller({ address, profile, status })
    } catch (error) {
      console.error('Error loading seller details:', error)
      toast.error('Failed to load seller details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: SellerStatus) => {
    if (!seller) return
    if (newStatus === seller.status) {
      toast.error('Seller already has this status')
      return
    }
    setUpdating(true)
    try {
      await updateSellerStatus(seller.address, newStatus)
      await loadSellerDetails(seller.address)
      toast.success('Seller status updated successfully')
    } catch (error: any) {
      const errorMessage = error?.reason || 'Failed to update seller status'
      toast.error(errorMessage)
    } finally {
      setUpdating(false)
    }
  }
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-400">Seller not found</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/sellers"
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Seller Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Business Information</h2>
            <div className="mt-4 space-y-3">
              <p className="text-sm">
                <span className="text-gray-400">Business Name:</span>{' '}
                <span className="text-white">{seller.profile.businessName}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-400">Email:</span>{' '}
                <span className="text-white">{seller.profile.email}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-400">Phone:</span>{' '}
                <span className="text-white">{seller.profile.phone}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-400">Wallet Address:</span>{' '}
                <span className="text-white font-mono">{seller.address}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-400">Registration Date:</span>{' '}
                <span className="text-white">
                  {new Date(seller.profile.registeredAt * 1000).toLocaleDateString()}
                </span>
              </p>
              <div className="text-sm">
                <span className="text-gray-400">Status:</span>{' '}
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs ${getStatusColor(
                    seller.status
                  )}`}
                >
                  {seller.status}
                </span>
              </div>
            </div>
          </div>

          {seller.profile.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
              <p className="text-sm text-white">{seller.profile.description}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Actions</h2>
          <div className="space-y-3">
            {seller.status !== SellerStatus.Verified && (
              <button
                onClick={() => handleUpdateStatus(SellerStatus.Verified)}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 
                  bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 
                  disabled:opacity-50 transition-all duration-200"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Verify Seller
              </button>
            )}

            {seller.status !== SellerStatus.Pending && (
              <button
                onClick={() => handleUpdateStatus(SellerStatus.Pending)}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 
                  bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 
                  disabled:opacity-50 transition-all duration-200"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Set as Pending
              </button>
            )}

            {seller.status !== SellerStatus.Suspended && (
              <button
                onClick={() => handleUpdateStatus(SellerStatus.Suspended)}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 
                  bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 
                  disabled:opacity-50 transition-all duration-200"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Suspend Seller
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(SellerDetailsPage)

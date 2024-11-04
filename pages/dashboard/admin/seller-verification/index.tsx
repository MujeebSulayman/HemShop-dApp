import React, { useEffect, useState } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { getPendingSellers, updateSellerStatus, getSellerStatus } from '@/services/blockchain'
import { SellerStatus } from '@/utils/type.dt'
import { toast } from 'react-toastify'

const SellerVerificationPage = () => {
  const [pendingSellers, setPendingSellers] = useState<Array<{ address: string; status: SellerStatus }>>([])
  const [loading, setLoading] = useState(true)

  const loadPendingSellers = async () => {
    try {
      const sellers = await getPendingSellers()
      const sellersWithStatus = await Promise.all(
        sellers.map(async (address) => ({
          address,
          status: await getSellerStatus(address)
        }))
      )
      setPendingSellers(sellersWithStatus)
    } catch (error) {
      toast.error('Failed to load pending sellers')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (seller: string, status: SellerStatus) => {
    try {
      await updateSellerStatus(seller, status)
      toast.success('Seller status updated successfully')
      await loadPendingSellers() // Refresh the list
    } catch (error) {
      toast.error('Failed to update seller status')
      console.error(error)
    }
  }

  useEffect(() => {
    loadPendingSellers()
  }, [])

  const getStatusColor = (status: SellerStatus): string => {
    switch (status) {
      case SellerStatus.Verified:
        return 'text-green-400'
      case SellerStatus.Suspended:
        return 'text-red-400'
      case SellerStatus.Pending:
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusText = (status: SellerStatus): string => {
    switch (status) {
      case SellerStatus.Verified:
        return 'Verified'
      case SellerStatus.Suspended:
        return 'Suspended'
      case SellerStatus.Pending:
        return 'Pending'
      case SellerStatus.Unverified:
        return 'Unverified'
      default:
        return 'Unknown'
    }
  }

  const renderActionButtons = (address: string, status: SellerStatus) => {
    switch (status) {
      case SellerStatus.Pending:
        return (
          <>
            <button
              onClick={() => handleUpdateStatus(address, SellerStatus.Verified)}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleUpdateStatus(address, SellerStatus.Suspended)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reject
            </button>
          </>
        )
      case SellerStatus.Verified:
        return (
          <button
            onClick={() => handleUpdateStatus(address, SellerStatus.Suspended)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Suspend
          </button>
        )
      case SellerStatus.Suspended:
        return (
          <button
            onClick={() => handleUpdateStatus(address, SellerStatus.Verified)}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Reactivate
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Seller Management</h1>
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          <h2 className="text-xl text-white">Seller Status</h2>
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : (
            <div className="grid gap-4">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300">Seller Address</th>
                    <th className="px-4 py-3 text-left text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {pendingSellers.map(({ address, status }) => (
                    <tr key={address}>
                      <td className="px-4 py-3 text-white">{address}</td>
                      <td className={`px-4 py-3 ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {renderActionButtons(address, status)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendingSellers.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No sellers found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(SellerVerificationPage) 
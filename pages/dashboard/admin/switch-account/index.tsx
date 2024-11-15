import React, { useEffect, useState } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { getAllSellers, impersonateAccount, stopImpersonating } from '@/services/blockchain'
import { SellerData } from '@/utils/type.dt'
import { toast } from 'react-toastify'
import { FaUserCircle, FaSearch, FaArrowLeft } from 'react-icons/fa'
import { useRouter } from 'next/router'

const AdminSwitchAccountPage = () => {
  const [sellers, setSellers] = useState<SellerData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeller, setSelectedSeller] = useState<SellerData | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadSellers()
  }, [])

  const loadSellers = async () => {
    try {
      const data = await getAllSellers()
      setSellers(data)
    } catch (error) {
      console.error('Failed to load sellers:', error)
      toast.error('Failed to load sellers')
    }
  }

  const handleImpersonateAccount = async (seller: SellerData) => {
    setLoading(true)
    try {
      await impersonateAccount(seller.address)
      toast.success(`Successfully switched to ${seller.profile.businessName}`)
      setSelectedSeller(seller)
      // Redirect to seller dashboard after successful impersonation
      router.push('/dashboard/user')
    } catch (error) {
      console.error('Failed to impersonate account:', error)
      toast.error('Failed to switch account')
    }
    setLoading(false)
  }

  const handleStopImpersonating = async () => {
    setLoading(true)
    try {
      await stopImpersonating()
      toast.success('Returned to original account')
      setSelectedSeller(null)
      // Redirect back to admin dashboard
      router.push('/dashboard/admin')
    } catch (error) {
      console.error('Failed to stop impersonating:', error)
      toast.error('Failed to return to original account')
    }
    setLoading(false)
  }

  const filteredSellers = sellers.filter(seller => 
    seller.profile.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Account Switching Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage and switch between seller accounts</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by business name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSellers.map((seller) => (
            <div
              key={seller.address}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleImpersonateAccount(seller)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {seller.profile.logo ? (
                    <img 
                      src={seller.profile.logo} 
                      alt={seller.profile.businessName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <FaUserCircle className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {seller.profile.businessName}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{seller.address}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-600">Balance: {seller.balance} ETH</p>
                <p className="text-sm text-gray-600">Products: {seller.productIds.length}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSeller && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <FaUserCircle className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium">
                Viewing as {selectedSeller.profile.businessName}
              </span>
            </div>
            <button
              onClick={handleStopImpersonating}
              disabled={loading}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
            >
              Stop Impersonating
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default withAdminLayout(AdminSwitchAccountPage)

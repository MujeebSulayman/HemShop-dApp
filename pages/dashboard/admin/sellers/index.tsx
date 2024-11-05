import { useEffect, useState } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { getAllSellers, updateSellerStatus } from '@/services/blockchain'
import { SellerData, SellerStatus } from '@/utils/type.dt'
import { toast } from 'react-toastify'
import { Loader2, Search, Filter } from 'lucide-react'
import { SellerCard } from '@/components/sellers/SellerCard'

const SellerManagementPage = () => {
  const [sellers, setSellers] = useState<SellerData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<SellerStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadAllSellers()
  }, [])

  const loadAllSellers = async () => {
    try {
      const data = await getAllSellers()
      setSellers(data)
    } catch (error) {
      toast.error('Failed to load sellers')
    } finally {
      setLoading(false)
    }
  }

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.profile.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.profile.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || seller.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = async (address: string, newStatus: SellerStatus) => {
    setUpdating(address)
    try {
      await updateSellerStatus(address, newStatus)
      await loadAllSellers()
      toast.success('Seller status updated successfully')
    } catch (error) {
      toast.error('Failed to update seller status')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-gray-400 animate-pulse">Loading sellers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-gray-800/40 p-6 rounded-2xl backdrop-blur-lg">
        <div>
          <h1 className="text-3xl font-bold text-white">Seller Management</h1>
          <p className="text-gray-400 mt-2">Manage and monitor seller accounts</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 
              group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl
                text-sm text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                transition-all duration-200"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4
              group-focus-within:text-indigo-500 transition-colors" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SellerStatus | 'all')}
              className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl
                text-sm text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value={SellerStatus.Pending}>Pending</option>
              <option value={SellerStatus.Verified}>Verified</option>
              <option value={SellerStatus.Suspended}>Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredSellers.map((seller) => (
          <SellerCard
            key={seller.address}
            seller={seller}
            mode="management"
            updating={updating}
            onUpdateStatus={handleUpdateStatus}
          />
        ))}
      </div>
    </div>
  )
}

export default withAdminLayout(SellerManagementPage)

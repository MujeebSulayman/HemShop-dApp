import React, { useState, useEffect } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { useRouter } from 'next/router'
import { getSeller, getSellerProducts, updateSellerStatus, safeFromWei } from '@/services/blockchain'
import { SellerData, ProductStruct, SellerStatus } from '@/utils/type.dt'
import { 
  Loader2, Store, Package, Mail, Phone,
  Calendar, CheckCircle, XCircle, AlertTriangle, ChevronDown
} from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'

const SellerDetail = () => {
  const router = useRouter()
  const { id } = router.query
  const [seller, setSeller] = useState<SellerData | null>(null)
  const [products, setProducts] = useState<ProductStruct[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  useEffect(() => {
    if (id) {
      fetchSellerData()
    }
  }, [id])

  const fetchSellerData = async () => {
    try {
      const sellerData = await getSeller(id as string)
      const sellerProducts = await getSellerProducts(id as string)
      setSeller(sellerData)
      setProducts(sellerProducts)
    } catch (error) {
      console.error('Error fetching seller data:', error)
      toast.error('Failed to fetch seller data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: SellerStatus) => {
    if (!seller) return
    setUpdating(true)
    try {
      await updateSellerStatus(seller.address, newStatus)
      await fetchSellerData()
      toast.success('Seller status updated successfully')
    } catch (error) {
      toast.error('Failed to update seller status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: SellerStatus) => {
    switch (status) {
      case SellerStatus.Verified:
        return 'bg-green-500/20 text-green-400'
      case SellerStatus.Pending:
        return 'bg-yellow-500/20 text-yellow-400'
      case SellerStatus.Suspended:
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-gray-400">Loading seller data...</p>
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Seller not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          {seller.profile.logo ? (
            <img 
              src={seller.profile.logo} 
              alt={seller.profile.businessName}
              className="w-20 h-20 rounded-xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gray-800 flex items-center justify-center">
              <Store className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {seller.profile.businessName}
            </h1>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                seller.status === SellerStatus.Verified ? 'bg-green-500/20 text-green-400' :
                seller.status === SellerStatus.Pending ? 'bg-yellow-500/20 text-yellow-400' :
                seller.status === SellerStatus.Suspended ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {SellerStatus[seller.status]}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{seller.balance.toFixed(4)} ETH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Management Section - Add relative positioning */}
      <div className="relative mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Status Management</h2>
              <p className="text-sm text-gray-400">Manage seller verification status</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              seller.status === SellerStatus.Verified ? 'bg-green-500/20 text-green-400' :
              seller.status === SellerStatus.Pending ? 'bg-yellow-500/20 text-yellow-400' :
              seller.status === SellerStatus.Suspended ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              Current: {SellerStatus[seller.status]}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="w-full px-4 py-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 
                transition-colors flex items-center justify-between"
            >
              <span className="text-gray-300">Change Seller Status</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 
                ${showStatusMenu ? 'transform rotate-180' : ''}`} 
              />
            </button>

            {showStatusMenu && (
              <div className="absolute w-full mt-2 bg-gray-800/95 backdrop-blur-sm rounded-lg 
                border border-gray-700/50 shadow-xl overflow-hidden z-50">
                {seller.status !== SellerStatus.Verified && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(SellerStatus.Verified)
                      setShowStatusMenu(false)
                    }}
                    disabled={updating}
                    className="w-full px-4 py-3 hover:bg-gray-700/50 transition-colors 
                      flex items-center gap-3 text-left"
                  >
                    {updating ? (
                      <Loader2 className="w-5 h-5 animate-spin text-green-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    <div>
                      <p className="text-green-400 font-medium">Verify Seller</p>
                      <p className="text-sm text-gray-400">Allow seller to list and sell products</p>
                    </div>
                  </button>
                )}

                {seller.status !== SellerStatus.Suspended && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(SellerStatus.Suspended)
                      setShowStatusMenu(false)
                    }}
                    disabled={updating}
                    className="w-full px-4 py-3 hover:bg-gray-700/50 transition-colors 
                      flex items-center gap-3 text-left"
                  >
                    {updating ? (
                      <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-red-400 font-medium">Suspend Seller</p>
                      <p className="text-sm text-gray-400">Temporarily disable seller account</p>
                    </div>
                  </button>
                )}

                {seller.status === SellerStatus.Suspended && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(SellerStatus.Verified)
                      setShowStatusMenu(false)
                    }}
                    disabled={updating}
                    className="w-full px-4 py-3 hover:bg-gray-700/50 transition-colors 
                      flex items-center gap-3 text-left"
                  >
                    {updating ? (
                      <Loader2 className="w-5 h-5 animate-spin text-green-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    <div>
                      <p className="text-green-400 font-medium">Reactivate Seller</p>
                      <p className="text-sm text-gray-400">Restore seller account access</p>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Status Info */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <AlertTriangle className="w-4 h-4" />
              <p>
                {seller.status === SellerStatus.Verified && "This seller is verified and can list products."}
                {seller.status === SellerStatus.Pending && "This seller is awaiting verification."}
                {seller.status === SellerStatus.Suspended && "This seller is currently suspended and cannot list new products."}
                {seller.status === SellerStatus.Unverified && "This seller needs to complete verification."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add margin when dropdown is active */}
      <div className={`transition-all duration-200 ${showStatusMenu ? 'mt-[200px]' : 'mt-0'}`}>
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 
            border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">{seller.profile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">{seller.profile.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">
                  Registered on {new Date(seller.profile.registeredAt * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 
            border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Business Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 mb-1">Description</p>
                <p className="text-gray-300">{seller.profile.description}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Wallet Address</p>
                <p className="text-gray-300 break-all">{seller.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 
          border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Products ({products.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                key={product.id}
                href={`/dashboard/admin/products/${product.id}`}
                className="block bg-gray-900/50 rounded-xl overflow-hidden hover:ring-2 
                  ring-indigo-500/50 transition-all"
              >
                <div className="aspect-video relative">
                  {product.images[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  {product.soldout && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/90 
                      text-white text-xs rounded">
                      Sold Out
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">{Number(product.stock)} in stock</span>
                    <span className="text-indigo-400">
                      {safeFromWei(product.price)} ETH
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(SellerDetail)

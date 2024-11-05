import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { getMyProducts, getSellerStatus, getSellerBalance, getSellerProfile, getEthereumContract } from '@/services/blockchain'
import { ProductStruct, SellerStatus, SellerProfile } from '@/utils/type.dt'
import { formatEther } from 'viem'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'


import { Loader2 } from 'lucide-react'
import withSellerLayout from '@/components/hoc/withSellerLayout'
import { VerifiedIcon, XCircleIcon } from 'lucide-react'

const SellerDashboard = () => {
  const { address } = useAccount()
  const router = useRouter()
  const [products, setProducts] = useState<ProductStruct[]>([])
  const [balance, setBalance] = useState<string>('0')
  const [status, setStatus] = useState<SellerStatus>(SellerStatus.Unverified)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSellerData = async () => {
      if (!address) return
      
      try {
        // First, try to grant owner access if this is the admin
        const contract = await getEthereumContract()
        const owner = await contract.owner()
        
        if (address.toLowerCase() === owner.toLowerCase()) {
          await contract.grantOwnerSellerAccess()
        }

        // Now load the data
        const [productsData, balanceData, statusData, profileData] = await Promise.all([
          getMyProducts(),
          getSellerBalance(address),
          getSellerStatus(address),
          getSellerProfile(address)
        ])

        // If not verified, redirect back to buyer dashboard
        if (statusData !== SellerStatus.Verified) {
          toast.error('You must be a verified vendor to access this page')
          router.push('/dashboard/buyer')
          return
        }

        setProducts(productsData)
        setBalance(formatEther(BigInt(balanceData)))
        setStatus(statusData)
        setSellerProfile(profileData)
      } catch (error) {
        console.error('Error loading seller data:', error)
        toast.error('Failed to load seller data')
        router.push('/dashboard/buyer')
      } finally {
        setLoading(false)
      }
    }

    loadSellerData()
  }, [address, router])

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Seller Profile Summary */}
      <div className="mb-8 p-6 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold mb-4">Welcome, {sellerProfile?.businessName}</h2>
          {status === SellerStatus.Verified ? (
            <VerifiedIcon className="w-6 h-6 text-blue-500" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-red-500" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Balance</h3>
            <p className="text-2xl font-bold">{balance} ETH</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Products</h3>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Status</h3>
            <p className={`text-lg font-medium ${getStatusColor(status)}`}>
              {status}
            </p>
          </div>
        </div>
      </div>

      {/* Rest of your dashboard content */}
    </div>
  )
}

export default withSellerLayout(SellerDashboard)

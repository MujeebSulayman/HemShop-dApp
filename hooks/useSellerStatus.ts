import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { getSeller } from '@/services/blockchain'
import { SellerStatus } from '@/utils/type.dt'

export const useSellerStatus = () => {
  const { address } = useAccount()
  const [isVerified, setIsVerified] = useState(false)
  const [status, setStatus] = useState<SellerStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      if (!address) {
        setIsVerified(false)
        setStatus(null)
        setLoading(false)
        return
      }

      try {
        const seller = await getSeller(address)
        setIsVerified(seller.status === SellerStatus.Verified)
        setStatus(seller.status)
      } catch (error) {
        console.error('Error checking seller status:', error)
        setIsVerified(false)
        setStatus(null)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
    
    // Set up polling to check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    
    return () => clearInterval(interval)
  }, [address])

  return { isVerified, status, loading }
} 
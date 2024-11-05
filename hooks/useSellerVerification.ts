import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { checkSellerVerification } from '@/services/blockchain'
import { SellerStatus } from '@/utils/type.dt'

export const useSellerVerification = () => {
  const { address } = useAccount()
  const [verificationStatus, setVerificationStatus] = useState<{
    isVerified: boolean
    status: SellerStatus
  }>({
    isVerified: false,
    status: SellerStatus.Unverified,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      if (!address) return

      try {
        const status = await checkSellerVerification(address)
        setVerificationStatus(status)
      } catch (error) {
        console.error('Error checking seller status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [address])

  return {
    ...verificationStatus,
    loading,
    isPending: verificationStatus.status === SellerStatus.Pending,
    isSuspended: verificationStatus.status === SellerStatus.Suspended,
  }
}

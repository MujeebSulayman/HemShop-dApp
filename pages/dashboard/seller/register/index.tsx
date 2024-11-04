import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { RegisterSeller, getSellerStatus } from '@/services/blockchain'
import { SellerStatus } from '@/utils/type.dt'
import { toast } from 'react-toastify'
import { FiUserPlus, FiLoader } from 'react-icons/fi'

const SellerRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<SellerStatus | null>(null)
  const { address } = useAccount()
  const router = useRouter()

  useEffect(() => {
    checkSellerStatus()
  }, [address])

  const checkSellerStatus = async () => {
    if (!address) return
    try {
      const status = await getSellerStatus(address)
      setCurrentStatus(status)
    } catch (error) {
      console.error('Error checking seller status:', error)
    }
  }

  const handleRegistration = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsRegistering(true)
    try {
      await RegisterSeller()
      toast.success('Registration submitted successfully!')
      await checkSellerStatus()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to register as seller')
      console.error(error)
    } finally {
      setIsRegistering(false)
    }
  }

  const getStatusMessage = () => {
    switch (currentStatus) {
      case SellerStatus.Pending:
        return {
          title: 'Registration Pending',
          message: 'Your registration is under review. Please wait for admin approval.',
          color: 'text-yellow-400',
        }
      case SellerStatus.Verified:
        return {
          title: 'Registration Approved',
          message: 'Your seller account is active. You can start selling products.',
          color: 'text-green-400',
        }
      case SellerStatus.Suspended:
        return {
          title: 'Account Suspended',
          message: 'Your seller account has been suspended. Please contact support.',
          color: 'text-red-400',
        }
      default:
        return {
          title: 'Become a Seller',
          message: 'Register now to start selling your products on our platform.',
          color: 'text-blue-400',
        }
    }
  }

  return (
    <div>
      {/* Add your seller registration components here */}
    </div>
  )
}

export default SellerRegistration 
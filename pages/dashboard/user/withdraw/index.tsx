import withAdminLayout from '@/components/hoc/withAdminLayout'
import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { getSellerBalance, withdraw } from '@/services/blockchain'
import { toast } from 'react-toastify'

const Withdraw = () => {
  const { address } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return

      try {
        const sellerBalance = await getSellerBalance(address)
        setBalance(sellerBalance)
      } catch (error) {
        console.error('Error fetching balance:', error)
        toast.error('Failed to fetch balance')
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [address])

  const handleWithdraw = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    if (balance <= 0) {
      toast.error('No balance available to withdraw')
      return
    }

    setIsSubmitting(true)
    try {
      await withdraw()
      toast.success('Withdrawal successful!')
      // Refresh balance after withdrawal
      const newBalance = await getSellerBalance(address)
      setBalance(newBalance)
    } catch (error: any) {
      console.error('Withdrawal error:', error)
      toast.error(error?.message || 'Failed to process withdrawal')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Withdraw Funds</h1>

        <div className="mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Available Balance</p>
            <p className="text-3xl font-bold text-gray-900">{balance} ETH</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleWithdraw}
            disabled={isSubmitting || balance <= 0}
            className={`w-full py-3 px-4 rounded-md text-white font-medium
              ${
                isSubmitting || balance <= 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isSubmitting ? 'Processing...' : 'Withdraw Funds'}
          </button>

          {balance <= 0 && (
            <p className="text-sm text-gray-500 text-center">
              You don't have any funds available to withdraw
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(Withdraw)

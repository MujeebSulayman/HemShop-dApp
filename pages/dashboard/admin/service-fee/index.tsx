import React, { useState, useEffect } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { changeServicePct, getServiceFee } from '@/services/blockchain'
import { toast } from 'react-toastify'
import { FiPercent } from 'react-icons/fi'
import { HiOutlineInformationCircle } from 'react-icons/hi'

const ServiceFeePage = () => {
  const [newFee, setNewFee] = useState<number>(0)
  const [currentFee, setCurrentFee] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchCurrentFee()
  }, [])

  const fetchCurrentFee = async () => {
    try {
      const fee = await getServiceFee()
      setCurrentFee(fee)
      setLastUpdated(new Date())
    } catch (error: any) {
      toast.error('Failed to fetch current service fee')
      console.error(error)
    }
  }

  const handleUpdateFee = async () => {
    if (newFee < 0 || newFee > 100) {
      toast.error('Fee must be between 0 and 100')
      return
    }

    try {
      setIsLoading(true)
      await changeServicePct(newFee)
      await fetchCurrentFee()
      toast.success('Service fee updated successfully')
      setNewFee(0)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update service fee')
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never'
    
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Service Fee Management</h1>
        <p className="text-gray-400">Configure the platform-wide service fee percentage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Fee Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-200">Current Fee</h2>
            <HiOutlineInformationCircle className="text-gray-400 h-5 w-5" />
          </div>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-white">{currentFee}</span>
            <FiPercent className="ml-1 text-2xl text-gray-400" />
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Last updated: {formatLastUpdated()}
          </p>
        </div>

        {/* Update Fee Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Update Fee</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                New Fee Percentage
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={newFee}
                  onChange={(e) => setNewFee(Number(e.target.value))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter new fee percentage"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <FiPercent className="text-gray-400" />
                </div>
              </div>
            </div>
            <button 
              onClick={handleUpdateFee}
              disabled={isLoading || newFee === currentFee || newFee < 0 || newFee > 100}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Service Fee</span>
              )}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="md:col-span-2 bg-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <HiOutlineInformationCircle className="text-blue-400 h-6 w-6 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-medium mb-1">About Service Fees</h3>
              <p className="text-gray-300 text-sm">
                The service fee is a percentage taken from each transaction on the platform. 
                Changes to the service fee will affect all future transactions. 
                Please consider the impact carefully before making changes.
              </p>
              <ul className="mt-3 text-sm text-gray-400 list-disc list-inside space-y-1">
                <li>Fee must be between 0% and 100%</li>
                <li>Changes take effect immediately</li>
                <li>Affects all future transactions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAdminLayout(ServiceFeePage) 
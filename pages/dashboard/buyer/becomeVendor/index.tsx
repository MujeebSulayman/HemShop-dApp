import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/router'
import { requestToBecomeVendor, getSellerStatus, getSellerProfile } from '@/services/blockchain'
import { SellerRegistrationParams, SellerStatus } from '@/utils/type.dt'
import withBuyerLayout from '@/components/hoc/withBuyerLayout'
import { useAccount } from 'wagmi'
import { Loader2, Store, Mail, Phone, FileText, Image } from 'lucide-react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

const BecomeVendor = () => {
  const router = useRouter()
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null)
  
  const [formData, setFormData] = useState<SellerRegistrationParams>({
    businessName: '',
    description: '',
    email: '',
    phone: '',
    logo: ''
  })

  useEffect(() => {
    checkSellerStatus()
  }, [address])

  const checkSellerStatus = async () => {
    if (!address) return
    
    try {
      const status = await getSellerStatus(address)
      setSellerStatus(status)
      
      if (status === SellerStatus.Verified) {
        toast.success('You are already a verified vendor!')
        router.push('/dashboard/seller')
        return
      }
      
      if (status === SellerStatus.Pending) {
        const profile = await getSellerProfile(address)
        setFormData(profile)
        toast.info('Your vendor application is pending approval')
      }

      if (status === SellerStatus.Suspended) {
        toast.error('Your vendor account has been suspended. Please contact support.')
      }
    } catch (error) {
      console.error('Error checking seller status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await requestToBecomeVendor(formData)
      setSellerStatus(SellerStatus.Pending)
      toast.success('Application submitted successfully!')
    } catch (error: any) {
      console.error('Error submitting vendor application:', error)
      toast.error(error.message || 'Failed to submit application')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (sellerStatus === SellerStatus.Pending || sellerStatus === SellerStatus.Suspended) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl backdrop-blur-sm ${
            sellerStatus === SellerStatus.Pending 
              ? 'bg-yellow-500/10 border border-yellow-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Vendor Status</h2>
          <p className={`text-lg ${
            sellerStatus === SellerStatus.Pending 
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}>
            {sellerStatus === SellerStatus.Pending 
              ? 'Your vendor application is pending approval'
              : 'Your vendor account has been suspended. Please contact support.'
            }
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Become a Vendor</h1>
          <p className="mt-2 text-gray-400">
            Fill out the form below to start selling on our platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Store className="w-4 h-4" />
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-white placeholder-gray-400"
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4" />
                  Business Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-white placeholder-gray-400 resize-none"
                  placeholder="Describe your business"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-white placeholder-gray-400"
                  placeholder="Your email address"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-white placeholder-gray-400"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Image className="w-4 h-4" />
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-white placeholder-gray-400"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default withBuyerLayout(BecomeVendor)

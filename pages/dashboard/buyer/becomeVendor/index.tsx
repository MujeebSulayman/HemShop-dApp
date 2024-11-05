import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/router'
import { requestToBecomeVendor, getSellerStatus, getSellerProfile } from '@/services/blockchain'
import { SellerRegistrationParams, SellerStatus } from '@/utils/type.dt'
import withBuyerLayout from '@/components/hoc/withBuyerLayout'
import { useAccount } from 'wagmi'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

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
      
      // If verified, redirect to seller dashboard
      if (status === SellerStatus.Verified) {
        toast.success('You are already a verified vendor!')
        router.push('/dashboard/seller')
        return
      }
      
      // If pending, get profile data and show status message
      if (status === SellerStatus.Pending) {
        const profile = await getSellerProfile(address)
        setFormData(profile)
        toast.info('Your vendor application is pending approval')
      }

      // If suspended, show error message
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
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  // Show status message instead of form for pending/suspended sellers
  if (sellerStatus === SellerStatus.Pending || sellerStatus === SellerStatus.Suspended) {
    return (
      <div className="max-w-2xl pb-24 mx-auto p-6">
        <div className={`p-4 rounded-lg ${
          sellerStatus === SellerStatus.Pending 
            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          <h2 className="text-2xl font-bold mb-4">Vendor Status</h2>
          <p>{
            sellerStatus === SellerStatus.Pending 
              ? 'Your vendor application is pending approval'
              : 'Your vendor account has been suspended. Please contact support.'
          }</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl pb-12 mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Become a Vendor</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Business Name</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded bg-gray-50 focus:bg-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded bg-gray-50 focus:bg-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded bg-gray-50 focus:bg-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded bg-gray-50 focus:bg-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Logo URL</label>
          <input
            type="url"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded bg-gray-50 focus:bg-black"
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
      </form>
    </div>
  )
}

export default withBuyerLayout(BecomeVendor)

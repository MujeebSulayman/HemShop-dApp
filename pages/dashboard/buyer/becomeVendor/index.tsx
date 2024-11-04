import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { requestToBecomeVendor } from '@/services/blockchain'
import { SellerRegistrationParams } from '@/utils/type.dt'
import withBuyerLayout from '@/components/hoc/withBuyerLayout'

const BecomeVendor = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<SellerRegistrationParams>({
    businessName: '',
    description: '',
    email: '',
    phone: '',
    logo: ''
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await requestToBecomeVendor(formData)
      router.push('/dashboard/buyer?message=Application submitted successfully')
    } catch (error: any) {
      console.error('Error submitting vendor application:', error)
      alert(error.message || 'Failed to submit application')
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

  return (
    <div className="max-w-2xl mx-auto p-6">
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
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
      </form>
    </div>
  )
}

export default withBuyerLayout(BecomeVendor)

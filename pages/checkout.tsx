import React, { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAccount } from 'wagmi'
import { buyProduct } from '@/services/blockchain'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

interface ShippingDetails {
  fullName: string
  streetAddress: string
  city: string
  state: string
  country: string
  postalCode: string
  phone: string
  email: string
}

const Checkout = () => {
  const router = useRouter()
  const { cartItems, clearCart } = useCart()
  const { address } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    email: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      toast.error('Please connect your wallet to proceed')
      return
    }

    setIsSubmitting(true)
    try {
      // Process each item in the cart
      for (const item of cartItems) {
        await buyProduct(Number(item.id), shippingDetails, Number(item.price) * item.quantity)
      }

      clearCart()
      toast.success('Purchase successful!')
      router.push('/store')
    } catch (error) {
      toast.error('Failed to process purchase')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-[1400px] mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-x-12 gap-y-8">
          {/* Left Column - Shipping Form */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-8">Shipping Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        required
                        value={shippingDetails.fullName}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-4 py-3 rounded-lg border-transparent bg-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={shippingDetails.email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-4 py-3 rounded-lg border-transparent bg-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Shipping Address</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-300">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="streetAddress"
                      id="streetAddress"
                      required
                      value={shippingDetails.streetAddress}
                      onChange={handleInputChange}
                      className="mt-2 block w-full rounded-lg border-transparent bg-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 py-3"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-300">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        id="city"
                        required
                        value={shippingDetails.city}
                        onChange={handleInputChange}
                        className="mt-2 block w-full rounded-lg border-transparent bg-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 py-3"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        id="postalCode"
                        required
                        value={shippingDetails.postalCode}
                        onChange={handleInputChange}
                        className="mt-2 block w-full rounded-lg border-transparent bg-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 py-3"
                        placeholder="Postal Code"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      value={shippingDetails.phone}
                      onChange={handleInputChange}
                      className="mt-2 block w-full rounded-lg border-transparent bg-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 py-3"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-400">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-base font-medium text-white">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                  <dt className="text-base font-medium text-gray-300">Subtotal</dt>
                  <dd className="text-base font-medium text-white">
                    ${cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0).toFixed(2)}
                  </dd>
                </div>
                
                <div className="flex items-center justify-between">
                  <dt className="text-base font-medium text-gray-300">Shipping</dt>
                  <dd className="text-base font-medium text-white">Free</dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                  <dt className="text-lg font-bold text-white">Total</dt>
                  <dd className="text-lg font-bold text-white">
                    ${cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0).toFixed(2)}
                  </dd>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !address}
                onClick={handleSubmit}
                className="mt-8 w-full rounded-xl border border-transparent bg-indigo-600 px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Complete Purchase'
                )}
              </button>

              {!address && (
                <p className="mt-2 text-sm text-gray-400 text-center">
                  Please connect your wallet to complete the purchase
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

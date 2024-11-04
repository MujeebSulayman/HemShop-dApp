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

    if (!cartItems.length) {
      toast.error('Your cart is empty')
      return
    }

    setIsSubmitting(true)
    try {
      // Process each item in the cart
      for (const item of cartItems) {
        await buyProduct(
          Number(item.id),
          shippingDetails,
          Number(item.price) * item.quantity
        )
      }

      clearCart()
      toast.success('Purchase successful!')
      router.push('/store')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to process purchase')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0)
  }

  return (
    <div className="min-h-screen flex flex-col text-white w-full overflow-x-hidden mt-[2rem] pb-[100px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Shipping Form - Left Side */}
          <div className="lg:col-span-7">
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
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-5">
            <div className="bg-gray-800 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

              {/* Product List */}
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 
                scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-700 last:border-0">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.images[0] || '/placeholder.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.name}</h3>
                      
                      {/* Specifications */}
                      

                      {/* Quantity and Price */}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-400">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {(Number(item.price) * item.quantity).toFixed(4)} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-4 mt-6 pt-6 border-t border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{getCartTotal().toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping Fee</span>
                  <span className="text-white">0 ETH</span>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-lg font-semibold text-white">
                      {getCartTotal().toFixed(4)} ETH
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !address}
                  className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl
                    hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    'Complete Purchase'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

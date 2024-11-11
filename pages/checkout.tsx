import React, { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAccount } from 'wagmi'
import { buyProduct } from '@/services/blockchain'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { fromWei } from '@/services/blockchain'
import { ethers } from 'ethers'

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
    email: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    const requiredFields = {
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
      streetAddress: 'Street address',
      city: 'City',
      state: 'State',
      country: 'Country',
      postalCode: 'Postal code',
    }

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!shippingDetails[field as keyof ShippingDetails]?.trim()) {
        newErrors[field] = `${label} is required`
      }
    })

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (shippingDetails.email && !emailRegex.test(shippingDetails.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{8,}$/
    if (shippingDetails.phone && !phoneRegex.test(shippingDetails.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingDetails((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    if (!address) {
      toast.error('Please connect your wallet to proceed with checkout')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsSubmitting(true)

    try {
      const item = cartItems[0]
      const price = item.price

      await buyProduct(
        Number(item.id),
        shippingDetails,
        item.selectedColor || '',
        item.selectedSize || '',
        item.quantity,
        Number(item.price)
      )

      clearCart()
      toast.success('Purchase successful! Check your profile for order details.')
      router.push('/dashboard/user/purchase')
    } catch (error: any) {
      console.error('Checkout error:', error)

      if (error.reason === 'Insufficient payment') {
        toast.error('Insufficient funds in your wallet to complete this purchase.')
      } else if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected. Please try again.')
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        toast.error('Insufficient funds in your wallet.')
      } else if (error.message?.includes('user rejected')) {
        toast.error('Transaction was cancelled.')
      } else {
        toast.error(error?.message || 'Failed to process purchase. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + BigInt(item.price) * BigInt(item.quantity)
    }, BigInt(0))
  }

  return (
    <div className="bg-gray-900 pt-[3rem] lg:pt-[6rem] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Left Side */}
          <div className="flex-1 space-y-6">
            {/* Shipping Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Shipping Details</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingDetails.fullName}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-700/50 border ${
                      errors.fullName ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    required
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingDetails.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingDetails.phone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-gray-300">Address</label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={shippingDetails.streetAddress}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingDetails.country}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingDetails.postalCode}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 lg:sticky lg:top-8">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                    className="flex gap-4 pb-4 border-b border-gray-700/50"
                  >
                    <img
                      src={item.images[0] || '/placeholder.png'}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium line-clamp-1">{item.name}</h3>
                      <div className="mt-1 space-y-1">
                        {item.productType && (
                          <span className="text-xs text-gray-400 block">
                            Type: {item.productType}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="text-xs text-gray-400 block">
                            Color: {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="text-xs text-gray-400 block">
                            Size: {item.selectedSize}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-400">Qty: {item.quantity}</span>
                        <span className="text-sm font-medium text-white">
                          {item.quantity} × {ethers.formatEther(item.price)} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Section */}
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{ethers.formatEther(getCartTotal())} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Network Fee</span>
                  <span className="text-white">~0.001 ETH</span>
                </div>
                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-white">
                      {ethers.formatEther(getCartTotal() + BigInt('1000000000000000'))} ETH
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !address}
                  className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg
                    hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 flex items-center justify-center gap-2"
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

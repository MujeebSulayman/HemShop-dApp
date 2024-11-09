import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { fromWei } from '@/services/blockchain'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/router'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const { address } = useAccount()
  const router = useRouter()

  const safeFromWei = (value: string | number): string => {
    try {
      return fromWei(value.toString())
    } catch (error) {
      console.error('Error converting value:', error)
      return '0'
    }
  }

  const subtotal = cartItems.reduce((total, item) => {
    const priceInEth = Number(safeFromWei(item.price))
    return total + priceInEth * item.quantity
  }, 0)
  const shippingFee = 0.001 // Example shipping fee in ETH
  const total = subtotal + shippingFee

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId.toString(), newQuantity)
  }



  const handleProceedToCheckout = () => {
    if (!address) {
      toast.error('Please connect your wallet to proceed')
      return
    }
    router.push('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="mb-8">
              {/* Shopping cart icon or illustration could go here */}
              <svg className="mx-auto h-24 w-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">
              Your cart is empty
            </h2>
            <p className="mt-4 text-lg text-gray-400 mb-8">
              Discover our amazing products and start shopping!
            </p>
            <Link
              href="/store"
              className="mt-8 inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Explore Store
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Progress indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center space-x-4">
          <span className="flex items-center text-indigo-500">
            <span className="w-8 h-8 flex items-center justify-center border-2 border-indigo-500 rounded-full">1</span>
            <span className="ml-2 font-medium">Cart</span>
          </span>
          <div className="w-16 h-1 bg-gray-700"></div>
          <span className="flex items-center text-gray-500">
            <span className="w-8 h-8 flex items-center justify-center border-2 border-gray-700 rounded-full">2</span>
            <span className="ml-2 font-medium">Checkout</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Cart items section */}
          <div className="lg:col-span-8">
            <h1 className="text-2xl font-bold text-white mb-8">Shopping Cart ({cartItems.length} items)</h1>
            <div className="space-y-6">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start space-x-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={item.images[0] || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-white">{item.name}</h3>
                          <div className="mt-1 space-y-1">
                            {item.productType && (
                              <p className="text-sm text-gray-400">Type: {item.productType}</p>
                            )}
                            <p className="text-sm text-gray-400">
                              Price: {Number(safeFromWei(item.price)).toFixed(4)} ETH
                            </p>
                            <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                            {item.selectedColor && (
                              <p className="text-sm text-gray-400">Color: {item.selectedColor}</p>
                            )}
                            {item.selectedSize && (
                              <p className="text-sm text-gray-400">Size: {item.selectedSize}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-white">
                          {(Number(safeFromWei(item.price)) * item.quantity).toFixed(4)} ETH
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleQuantityChange(Number(item.id), item.quantity - 1)}
                              className="text-gray-400 hover:text-white"
                            >
                              <FiMinus />
                            </button>
                            <span className="mx-2 text-white">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(Number(item.id), item.quantity + 1)}
                              className="text-gray-400 hover:text-white"
                            >
                              <FiPlus />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sticky order summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="sticky top-24">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">Subtotal</p>
                    <p className="text-sm font-medium text-white">{subtotal.toFixed(4)} ETH</p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                    <p className="text-sm text-gray-300">Shipping</p>
                    <p className="text-sm font-medium text-white">{shippingFee.toFixed(4)} ETH</p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                    <p className="text-base font-medium text-white">Total</p>
                    <p className="text-base font-medium text-white">{(subtotal + shippingFee).toFixed(4)} ETH</p>
                  </div>
                </div>
                <div className="mt-8">
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={!address}
                    className="w-full rounded-full bg-indigo-600 px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {address ? 'Proceed to Checkout' : 'Connect Wallet to Checkout'}
                  </button>
                  <button
                    onClick={() => clearCart()}
                    className="mt-4 w-full rounded-full px-6 py-4 text-base font-medium text-gray-300 border border-gray-600 hover:bg-gray-700 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

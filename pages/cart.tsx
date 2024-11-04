import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { buyProduct } from '@/services/blockchain'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/router'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const { address } = useAccount()
  const router = useRouter()

  const subtotal = cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0)
  const shippingFee = 0.001
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Your cart is empty</h2>
            <p className="mt-4 text-lg text-gray-400">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Link
              href="/store"
              className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-white">Shopping Cart</h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row gap-6 p-6 mb-6 bg-gray-800/50 backdrop-blur-xl 
                  rounded-2xl border border-gray-700/50"
              >
                <div className="w-full sm:w-48 h-48 relative rounded-xl overflow-hidden">
                  <img
                    src={item.images[0] || '/placeholder.png'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg group"
                    >
                      <FiTrash2 className="w-5 h-5 text-red-400 group-hover:text-red-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {item.selectedColor && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Selected Color:</span>
                        <span className="text-sm text-white">{item.selectedColor}</span>
                      </div>
                    )}
                    {item.selectedSize && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Selected Size:</span>
                        <span className="text-sm text-white">{item.selectedSize}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-700/50 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(Number(item.id), item.quantity - 1)}
                          className="p-2 hover:bg-gray-600/50 rounded-l-lg"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(Number(item.id), item.quantity + 1)}
                          className="p-2 hover:bg-gray-600/50 rounded-r-lg"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-400">({Number(item.stock)} available)</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="bg-gray-800 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal ({cartItems.length} items)</span>
                  <span className="text-white">{subtotal.toFixed(4)} ETH</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping Fee</span>
                  <span className="text-white">{shippingFee} ETH</span>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-lg font-semibold text-white">{total.toFixed(4)} ETH</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  disabled={!address || cartItems.length === 0}
                  className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl
                    hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200"
                >
                  {!address ? 'Connect Wallet to Checkout' : 'Proceed to Checkout'}
                </button>

                <button
                  onClick={clearCart}
                  className="w-full px-6 py-3 bg-transparent border border-gray-600 
                    text-gray-400 rounded-xl hover:bg-gray-700 transition-colors duration-200"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Your cart is empty
            </h2>
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
                className="flex py-6 border-b border-gray-700"
              >
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={item.images[0] || '/placeholder.png'}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-white">
                      <div>
                        <h3>{item.name}</h3>
                        {item.selectedColor && (
                          <p className="text-sm text-gray-400">Color: {item.selectedColor}</p>
                        )}
                        {item.selectedSize && (
                          <p className="text-sm text-gray-400">Size: {item.selectedSize}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(Number(item.id), item.quantity - 1)}
                            className="text-gray-400 hover:text-white"
                          >
                            <FiMinus />
                          </button>
                          <span className="mx-2">{item.quantity}</span>
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

          <div className="mt-16 rounded-lg bg-gray-800 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-white">Order summary</h2>
            
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

            <button
              onClick={handleProceedToCheckout}
              disabled={!address}
              className="mt-6 w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {address ? 'Proceed to Checkout' : 'Connect Wallet to Checkout'}
            </button>

            <button
              onClick={() => clearCart()}
              className="mt-4 w-full rounded-md border border-gray-600 px-4 py-3 text-base font-medium text-gray-300 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

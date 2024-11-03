import React, { useEffect, useState } from 'react'
import { getProducts, getReviews } from '@/services/blockchain'
import { ProductStruct, ReviewStruct } from '@/utils/type.dt'
import { FiStar, FiPackage, FiTruck, FiShoppingCart, FiHeart } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'

const ProductList = () => {
  const [products, setProducts] = useState<ProductStruct[]>([])
  const [productReviews, setProductReviews] = useState<{ [key: string]: ReviewStruct[] }>({})
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await getProducts()
        setProducts(productsData)

        // Fetch reviews for each product
        const reviewsData: { [key: string]: ReviewStruct[] } = {}
        for (const product of productsData) {
          const reviews = await getReviews(product.id)
          reviewsData[product.id] = reviews
        }
        setProductReviews(reviewsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getAverageRating = (reviews: ReviewStruct[]) => {
    if (!reviews.length) return 0
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden 
                hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={product.images[0] || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {Number(product.stock) < 10 && (
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium 
                    bg-yellow-500/20 text-yellow-400 backdrop-blur-md border border-yellow-500/20"
                  >
                    Low Stock
                  </span>
                )}
                <button
                  onClick={() =>
                    isInWishlist(product.id)
                      ? removeFromWishlist(product.id)
                      : addToWishlist(product)
                  }
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 
                    backdrop-blur-md hover:bg-black/70 transition-colors"
                >
                  <FiHeart
                    className={`w-5 h-5 ${
                      isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>
                <button
                  onClick={() => addToCart({
                    ...product,
                    id: product.id.toString(),
                    price: Number(product.price),
                    quantity: 1
                  })}
                  className="absolute bottom-3 right-3 p-2 rounded-full bg-indigo-500/90 
                    backdrop-blur-md hover:bg-indigo-600 transition-colors"
                >
                  <FiShoppingCart className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{product.brand}</p>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < getAverageRating(productReviews[product.id] || [])
                            ? 'fill-current'
                            : 'fill-none'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    ({productReviews[product.id]?.length || 0} reviews)
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xl font-bold text-indigo-400">{product.price} ETH</p>
                  <div className="flex items-center gap-2">
                    <FiPackage
                      className={`w-4 h-4 ${
                        Number(product.stock) > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    />
                    <span className="text-sm text-gray-400">{product.stock} in stock</span>
                  </div>
                </div>

                <button
                  className="w-full mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 
                  text-white rounded-xl flex items-center justify-center gap-2 transition-colors "
                  onClick={() => addToCart({
                    ...product,
                    id: product.id.toString(),
                    price: Number(product.price),
                    quantity: 1
                  })}
                >
                  <FiShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden 
                hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="flex gap-6 p-4">
                <div className="w-48 h-48 relative rounded-xl overflow-hidden">
                  <img
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <p className="text-sm text-gray-400">{product.brand}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < getAverageRating(productReviews[product.id] || [])
                              ? 'fill-current'
                              : 'fill-none'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">
                      ({productReviews[product.id]?.length || 0} reviews)
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-bold text-indigo-400">{product.price} ETH</p>
                    <div className="flex items-center gap-2">
                      <FiPackage
                        className={`w-4 h-4 ${
                          Number(product.stock) > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      />
                      <span className="text-sm text-gray-400">{product.stock} in stock</span>
                    </div>
                  </div>

                  <button
                    className="w-full mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 
                    text-white rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductList

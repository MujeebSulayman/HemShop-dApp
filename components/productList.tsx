import React, { useEffect, useState } from 'react'
import { getProducts, getReviews } from '@/services/blockchain'
import { ProductStruct, ReviewStruct } from '@/utils/type.dt'
import { FiStar, FiPackage, FiTruck, FiShoppingCart, FiHeart, FiSearch, FiSliders, FiGrid, FiList, FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useRouter } from 'next/router'

const ProductList = () => {
  const router = useRouter()
  const [products, setProducts] = useState<ProductStruct[]>([])
  const [productReviews, setProductReviews] = useState<{ [key: string]: ReviewStruct[] }>({})
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [filters, setFilters] = useState({
    priceRange: [0, 10],
    categories: [],
    brands: [],
    inStock: false,
    rating: 0,
  })
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(true)

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

  // Filter handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleProductClick = (productId: string) => {
    router.push(`/store/${productId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <button 
            onClick={() => setShowFilters(prev => !prev)}
            className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <FiSliders className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-400'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-gray-400'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-72 flex-shrink-0 space-y-6 hidden lg:block"
            >
              {/* Price Range */}
              <div className="bg-gray-800/50 rounded-2xl p-4 space-y-4">
                <h3 className="font-semibold text-white">Price Range (ETH)</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseFloat(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => handleFilterChange('priceRange', [parseFloat(e.target.value), filters.priceRange[1]])}
                      className="w-20 px-2 py-1 bg-gray-700 rounded-lg text-center"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseFloat(e.target.value)])}
                      className="w-20 px-2 py-1 bg-gray-700 rounded-lg text-center"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => handleProductClick(product.id.toString())}
                className="group bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 
                  hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 
                  transition-all duration-300 cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative aspect-square rounded-t-2xl overflow-hidden">
                  <img
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Wishlist Button - Prevent propagation to avoid triggering navigation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      isInWishlist(product.id) 
                        ? removeFromWishlist(product.id) 
                        : addToWishlist(product)
                    }}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-white/10 backdrop-blur-md 
                      hover:bg-white/20 transition-colors duration-200"
                  >
                    <FiHeart 
                      className={`w-5 h-5 ${
                        isInWishlist(product.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-white'
                      }`} 
                    />
                  </button>

                  {/* Stock Badge */}
                  {Number(product.stock) < 10 && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-medium 
                      bg-red-500/10 text-red-400 backdrop-blur-md border border-red-500/10">
                      Only {product.stock} left
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-4">
                  {/* Brand & Rating */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-700/50 text-gray-300 text-xs font-medium">
                      {product.brand}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-300">
                        {getAverageRating(productReviews[product.id] || []).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-medium text-white line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  {/* Stock Indicator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Available Stock</span>
                      <span className="text-gray-300 font-medium">{product.stock}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          Number(product.stock) < 10 
                            ? 'bg-red-500' 
                            : Number(product.stock) < 50 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((Number(product.stock) / 100) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xl font-bold text-white">
                      {product.price} <span className="text-indigo-400 text-base font-normal">ETH</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductList

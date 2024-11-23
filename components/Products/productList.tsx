import React, { useEffect, useState } from 'react'
import { getProducts, getReviews, getAllCategories, CategoryStruct } from '@/services/blockchain'
import { ProductStruct, ReviewStruct } from '@/utils/type.dt'
import {
  FiStar,
  FiHeart,
  FiSearch,
  FiSliders,
  FiGrid,
  FiList,
  FiChevronDown,
  FiX,
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import Image from 'next/image'

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
  const [selectedFilters, setSelectedFilters] = useState({
    category: 'all',
    price: 'all',
    stock: 'all',
  })
  const [categories, setCategories] = useState<CategoryStruct[]>([])

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData: CategoryStruct[] = await getAllCategories()
        setCategories(categoriesData.filter((cat: CategoryStruct) => cat.isActive))
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  const getAverageRating = (reviews: ReviewStruct[]) => {
    if (!reviews.length) return 0
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleProductClick = (productId: string) => {
    router.push(`/store/${productId}`)
  }

  // Add filtered products logic
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (selectedFilters.category !== 'all' && product.category !== selectedFilters.category) {
      return false
    }

    // Price filter
    if (selectedFilters.price !== 'all') {
      const price = Number(ethers.formatUnits(product.price, 18))
      if (selectedFilters.price === 'low' && price >= 1) return false
      if (selectedFilters.price === 'medium' && (price < 1 || price > 5)) return false
      if (selectedFilters.price === 'high' && price <= 5) return false
    }

    // Stock filter
    if (selectedFilters.stock !== 'all') {
      if (selectedFilters.stock === 'in-stock' && Number(product.stock) <= 0) return false
      if (selectedFilters.stock === 'low-stock' && Number(product.stock) >= 10) return false
      if (selectedFilters.stock === 'out-of-stock' && Number(product.stock) > 0) return false
    }

    // Search term
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      

      {/* Filter Section */}
      <div className="mb-8 space-y-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        {/* Search and View Toggle */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 rounded-xl border border-gray-700 
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200
                text-white placeholder-gray-400"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-gray-900/50 rounded-xl border border-gray-700
                  text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                  cursor-pointer hover:bg-gray-800/50 transition-colors"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Price Filter */}
            <div className="relative">
              <select
                value={selectedFilters.price}
                onChange={(e) => handleFilterChange('price', e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-gray-900/50 rounded-xl border border-gray-700
                  text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                  cursor-pointer hover:bg-gray-800/50 transition-colors"
              >
                <option value="all">All Prices</option>
                <option value="low">Under 1 ETH</option>
                <option value="medium">1-5 ETH</option>
                <option value="high">Over 5 ETH</option>
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-700 bg-gray-900/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50'
                } transition-colors`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${
                  viewMode === 'list'
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50'
                } transition-colors`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(selectedFilters).map(
            ([key, value]) =>
              value !== 'all' && (
                <div
                  key={key}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 
                  text-indigo-400 rounded-lg text-sm border border-indigo-500/20"
                >
                  <span className="capitalize">
                    {key}: {value}
                  </span>
                  <button
                    onClick={() => handleFilterChange(key, 'all')}
                    className="hover:text-white transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )
          )}
          {Object.values(selectedFilters).some((value) => value !== 'all') && (
            <button
              onClick={() =>
                setSelectedFilters({
                  category: 'all',
                  price: 'all',
                  stock: 'all',
                })
              }
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div
        className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}
      >
        {filteredProducts.map((product) => (
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
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={product.images[0] || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Wishlist Button - Prevent propagation to avoid triggering navigation */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)
                }}
                className="absolute top-3 right-3 p-2 rounded-xl bg-white/10 backdrop-blur-md 
                  hover:bg-white/20 transition-colors duration-200"
              >
                <FiHeart
                  className={`w-5 h-5 ${
                    isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-white'
                  }`}
                />
              </button>

              {/* Stock Badge */}
              {Number(product.stock) < 5 && (
                <div
                  className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-medium 
                  bg-red-500/10 text-red-400 backdrop-blur-md border border-red-500/10"
                >
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
              <h3 className="font-medium text-white line-clamp-2">{product.name}</h3>

              {/* Stock Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Available Stock</span>
                  <span className="text-gray-300 font-medium">{product.stock}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      Number(product.stock) === 0
                        ? 'bg-gray-500' // Out of stock
                        : Number(product.stock) <= Number(product.initialStock) * 0.2
                        ? 'bg-red-500' // Less than 20% remaining
                        : Number(product.stock) <= Number(product.initialStock) * 0.5
                        ? 'bg-yellow-500' // Less than 50% remaining
                        : 'bg-green-500' // More than 50% remaining
                    }`}
                    style={{
                      width: `${Math.min(
                        (Number(product.stock) / Number(product.initialStock)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-white">
                  {parseFloat(Number(ethers.formatUnits(product.price, 18)).toFixed(4)).toString()}{' '}
                  <span className="text-indigo-400 text-base font-normal">ETH</span>
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ProductList

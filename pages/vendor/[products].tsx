import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSellerProducts, getSeller } from '@/services/blockchain'
import { ProductStruct, ReviewStruct, SellerData } from '@/utils/type.dt'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Package, MapPin, Mail, Phone, Star, Filter, Search, Grid, List } from 'lucide-react'
import Image from 'next/image'

const calculateAverageRating = (reviews: ReviewStruct[]): number => {
  const activeReviews = reviews.filter((review) => !review.deleted)
  if (activeReviews.length === 0) return 0
  const sum = activeReviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / activeReviews.length
}

const VendorProducts = () => {
  const [products, setProducts] = useState<ProductStruct[]>([])
  const [seller, setSeller] = useState<SellerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const router = useRouter()
  const { products: vendorAddress } = router.query

  useEffect(() => {
    if (vendorAddress && typeof vendorAddress === 'string') {
      loadVendorData(vendorAddress)
    }
  }, [vendorAddress])

  const loadVendorData = async (address: string) => {
    try {
      setLoading(true)
      const [sellerData, productsData] = await Promise.all([
        getSeller(address),
        getSellerProducts(address),
      ])
      setSeller(sellerData)
      setProducts(productsData)
    } catch (error: any) {
      console.error('Error loading vendor data:', error)
      setError(error.message || 'Failed to load vendor data')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg border border-red-500/20">
          {error}
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Vendor Logo */}
              <div className="flex-shrink-0">
                {seller?.profile.logo ? (
                  <img
                    src={seller.profile.logo}
                    alt={seller.profile.businessName}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white/10"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gray-800 flex items-center justify-center ring-4 ring-white/10">
                    <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Vendor Info */}
              <div className="flex-grow">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                  {seller?.profile.businessName}
                </h1>
                <p className="text-sm md:text-lg text-gray-300 mb-6 max-w-3xl">
                  {seller?.profile.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{seller?.profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{seller?.profile.phone}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 grid grid-cols-2 gap-2 md:gap-4">
                <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 backdrop-blur-sm border border-gray-700/50">
                  <div className="text-xl md:text-2xl font-bold text-white">{products.length}</div>
                  <div className="text-xs md:text-sm text-gray-400">Products</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 backdrop-blur-sm border border-gray-700/50">
                  <div className="text-xl md:text-2xl font-bold text-white">
                    {calculateAverageRating(products.flatMap((product) => product.reviews)).toFixed(
                      1
                    )}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white min-w-[160px]"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <div className="flex rounded-xl overflow-hidden border border-gray-700 bg-gray-800/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${
                  viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-400'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${
                  viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-gray-400'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/store/${product.id}`)}
              className="group bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 
                overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer"
            >
              <div className={`relative ${viewMode === 'grid' ? 'aspect-square' : 'aspect-[3/1]'}`}>
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700/50 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div
                  className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm 
                  rounded-lg text-white text-sm font-medium"
                >
                  {Number(product.price) / 1e18} ETH
                </div>
              </div>
              <div className="p-4">
                <h3
                  className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 
                  transition-colors"
                >
                  {product.name}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm text-gray-400">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-gray-300">
                      {calculateAverageRating(product.reviews).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VendorProducts

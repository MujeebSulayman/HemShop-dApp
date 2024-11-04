import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getProduct, getReviews } from '@/services/blockchain'
import { ProductStruct, ReviewStruct } from '@/utils/type.dt'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import {
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiMinus,
  FiPlus,
  FiPackage,
  FiTruck,
  FiShield,
  FiRefreshCw,
} from 'react-icons/fi'
import ReviewForm from '@/components/ReviewForm'

const ProductDetails = () => {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState<ProductStruct | null>(null)
  const [reviews, setReviews] = useState<ReviewStruct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details')

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const productData = await getProduct(Number(id))
        if (!productData) throw new Error('Product not found')
        setProduct(productData)
        const reviewsData = await getReviews(Number(id))
        setReviews(reviewsData)
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    loadProductData()
  }, [id])

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(Number(product?.stock || 1), prev + delta)))
  }

  const handleAddToCart = () => {
    if (!product) return

    const requiredOptions = []
    if (product.colors.length > 0 && !selectedColor) requiredOptions.push('color')
    if (product.sizes && product.sizes.length > 0 && !selectedSize) requiredOptions.push('size')

    if (requiredOptions.length > 0) {
      toast.error(`Please select ${requiredOptions.join(' and ')}`)
      return
    }

    try {
      addToCart({
        ...product,
        id: product.id.toString(),
        price: Number(product.price),
        quantity,
      })
      toast.success('Added to cart')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add to cart')
    }
  }

  const handleWishlistToggle = () => {
    if (!product) return
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Added to wishlist')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
        <button
          onClick={() => router.push('/store')}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors"
        >
          Return to Store
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
          <button
            onClick={() => router.push('/store')}
            className="hover:text-white transition-colors"
          >
            Store
          </button>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
          {/* Left Column - Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-5 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors
                    ${selectedImage === index ? 'border-indigo-500' : 'border-gray-800'}`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 lg:mt-0"
          >
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <h1 className="text-3xl font-bold text-white">{product.name}</h1>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center">
                    <div className="flex items-center text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-5 h-5 ${
                            i <
                            (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0)
                              ? 'fill-current'
                              : 'fill-none'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-400">({reviews.length} reviews)</span>
                  </div>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-400">{product.stock} in stock</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="flex items-baseline gap-4 py-4 border-y border-gray-800">
                <span className="text-3xl font-bold text-white">{product.price} ETH</span>
                {Number(product.stock) > 0 ? (
                  <span className="text-sm text-green-400 flex items-center gap-1">
                    <FiPackage className="w-4 h-4" />
                    In Stock
                  </span>
                ) : (
                  <span className="text-sm text-red-400 flex items-center gap-1">
                    <FiPackage className="w-4 h-4" />
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Options */}
              <div className="space-y-6 py-6">
                {/* Colors */}
                {product.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              selectedColor === color
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }
                          `}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Size</label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`
                            w-14 h-14 rounded-lg text-sm font-medium transition-all flex items-center justify-center
                            ${
                              selectedSize === size
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }
                          `}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-800 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-3 hover:bg-gray-800 rounded-l-lg"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-16 text-center">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-3 hover:bg-gray-800 rounded-r-lg"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">{product.stock} available</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={Number(product.stock) <= 0}
                  className="flex-1 h-14 bg-indigo-500 hover:bg-indigo-600 rounded-xl
                    transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className="w-14 h-14 flex items-center justify-center rounded-xl
                    border border-gray-800 hover:border-indigo-500/50"
                >
                  <FiHeart
                    className={`w-5 h-5 ${
                      isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>
              </div>

              {/* Product Metadata */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FiTruck className="w-4 h-4" />
                  <span>Category: {product.category || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FiShield className="w-4 h-4" />
                  <span>SubCategory: {product.subCategory || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Brand: {product.brand || 'N/A'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details & Reviews Section */}
        <div className="mt-16">
          <div className="border-b border-gray-800">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'border-b-2 border-indigo-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-indigo-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <div className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Product Specifications</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">SKU</span>
                      <span className="text-white">{product.sku || `PRD-${product.id}`}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Brand</span>
                      <span className="text-white">{product.brand || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Category</span>
                      <span className="text-white">{product.category || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Sub Category</span>
                      <span className="text-white">{product.subCategory || 'N/A'}</span>
                    </div>
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Available Sizes</span>
                        <span className="text-white">{product.sizes.join(', ')}</span>
                      </div>
                    )}
                    {product.colors.length > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Available Colors</span>
                        <span className="text-white">{product.colors.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Product Description</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{product.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-8">
              {/* Review Form */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Write a Review</h3>
                <ReviewForm
                  productId={Number(product.id)}
                  productOwner={product.seller}
                  onReviewSubmitted={() => {
                    // Refresh reviews after submission
                    getReviews(Number(product.id)).then(setReviews)
                  }}
                />
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50">
                    <p className="text-gray-400">
                      No reviews yet. Be the first to review this product!
                    </p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.reviewer}
                      className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {`${review.reviewer.slice(0, 6)}...${review.reviewer.slice(-4)}`}
                            </span>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'fill-current' : 'fill-none'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-2 text-gray-300">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetails

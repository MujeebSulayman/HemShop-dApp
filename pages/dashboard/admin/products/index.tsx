import React, { useState, useEffect } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTrendingUp, FiPackage, FiAlertCircle, FiDollarSign, FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi'
import { getProducts, deleteProduct } from '@/services/blockchain'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import Modal from '@/components/ui/Modal'

interface Product {
  id: string
  name: string
  price: string
  stock: number
  brand: string
  category: string
  status: 'active' | 'inactive'
  createdAt: string
  description: string
  images: string[]
  revenue?: number
}

const AdminProducts = () => {
  const { address } = useAccount()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFilters, setSelectedFilters] = useState({
    category: 'all',
    price: 'all',
    stock: 'all',
    status: 'all'
  })

  const statsData = [
    {
      title: 'Total Products',
      value: products.length,
      subtitle: 'Items',
      trend: '+12.5%',
      trendDirection: 'up',
      icon: FiPackage,
      bgClass: 'from-indigo-500/10 to-indigo-500/5',
      iconClass: 'text-indigo-400 bg-indigo-400/10',
      borderClass: 'border-indigo-500/10'
    },
    {
      title: 'Revenue',
      value: products.reduce((acc, p) => acc + (p.revenue || 0), 0).toFixed(2),
      subtitle: 'ETH',
      trend: '+8.1%',
      trendDirection: 'up',
      icon: FiDollarSign,
      bgClass: 'from-emerald-500/10 to-emerald-500/5',
      iconClass: 'text-emerald-400 bg-emerald-400/10',
      borderClass: 'border-emerald-500/10'
    },
    {
      title: 'Active Listings',
      value: products.filter(p => p.status === 'active').length,
      subtitle: 'Products',
      trend: '+5.2%',
      trendDirection: 'up',
      icon: FiTrendingUp,
      bgClass: 'from-blue-500/10 to-blue-500/5',
      iconClass: 'text-blue-400 bg-blue-400/10',
      borderClass: 'border-blue-500/10'
    },
    {
      title: 'Low Stock',
      value: products.filter(p => p.stock < 10).length,
      subtitle: 'Items',
      trend: '-2.3%',
      trendDirection: 'down',
      icon: FiAlertCircle,
      bgClass: 'from-rose-500/10 to-rose-500/5',
      iconClass: 'text-rose-400 bg-rose-400/10',
      borderClass: 'border-rose-500/10'
    }
  ]

  useEffect(() => {
    fetchProducts()
  }, [address])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      const formattedProducts = data.map((product) => ({
        ...product,
        id: product.id.toString(),
        status: 'active',
        createdAt: new Date().toISOString(),
      }))
      setProducts(formattedProducts as unknown as Product[])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    setProductToDelete(productId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    try {
      await deleteProduct(Number(productToDelete))
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    } finally {
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const filteredProducts = products
    .filter(product => {
      // Category filter
      if (selectedFilters.category !== 'all' && product.category !== selectedFilters.category) {
        return false
      }
      
      // Price filter
      if (selectedFilters.price !== 'all') {
        const price = Number(product.price)
        if (selectedFilters.price === 'low' && price >= 1) return false
        if (selectedFilters.price === 'medium' && (price < 1 || price > 5)) return false
        if (selectedFilters.price === 'high' && price <= 5) return false
      }
      
      // Stock filter
      if (selectedFilters.stock !== 'all') {
        if (selectedFilters.stock === 'in-stock' && product.stock <= 0) return false
        if (selectedFilters.stock === 'low-stock' && product.stock >= 10) return false
        if (selectedFilters.stock === 'out-of-stock' && product.stock > 0) return false
      }
      
      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Products</h1>
              <p className="text-gray-400 mt-1">Manage your digital inventory</p>
            </div>
            <Link
              href="/dashboard/admin/products/create"
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 
                transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <FiPlus className="w-5 h-5" /> New Product
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-b ${stat.bgClass} rounded-2xl p-5 border ${stat.borderClass}
                    backdrop-blur-xl hover:scale-[1.02] transition-transform duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${stat.iconClass} 
                      flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      stat.trendDirection === 'up' 
                        ? 'text-green-400 bg-green-400/10' 
                        : 'text-red-400 bg-red-400/10'
                    }`}>
                      {stat.trendDirection === 'up' ? '↑' : '↓'} {stat.trend}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-white truncate">{stat.value}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{stat.subtitle}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* New Filter UI */}
          <div className="bg-[#6d6c6c0d] rounded-2xl border border-gray-800/50 p-6 space-y-6">
            {/* Search and View Toggle Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-11 pr-4 py-3 bg-[#13141b] border border-gray-800/50 rounded-xl
                    focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-white
                    placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap gap-3">
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedFilters.category}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="appearance-none pl-4 pr-10 py-3 bg-[#13141b] border border-gray-800/50 rounded-xl
                      text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                      cursor-pointer hover:bg-[#1c1d25] transition-colors"
                  >
                    <option value="all">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="accessories">Accessories</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                {/* Price Filter */}
                <div className="relative">
                  <select
                    value={selectedFilters.price}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, price: e.target.value }))}
                    className="appearance-none pl-4 pr-10 py-3 bg-[#13141b] border border-gray-800/50 rounded-xl
                      text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                      cursor-pointer hover:bg-[#1c1d25] transition-colors"
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Under 1 ETH</option>
                    <option value="medium">1-5 ETH</option>
                    <option value="high">Over 5 ETH</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                {/* Stock Filter */}
                <div className="relative">
                  <select
                    value={selectedFilters.stock}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, stock: e.target.value }))}
                    className="appearance-none pl-4 pr-10 py-3 bg-[#13141b] border border-gray-800/50 rounded-xl
                      text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                      cursor-pointer hover:bg-[#1c1d25] transition-colors"
                  >
                    <option value="all">All Stock</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex rounded-xl overflow-hidden border border-gray-800/50 bg-[#13141b]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' 
                      ? 'bg-indigo-500 text-white' 
                      : 'text-gray-400 hover:bg-[#1c1d25]'} transition-colors`}
                  >
                    <FiGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' 
                      ? 'bg-indigo-500 text-white' 
                      : 'text-gray-400 hover:bg-[#1c1d25]'} transition-colors`}
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedFilters).map(([key, value]) => (
                value !== 'all' && (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 
                      text-indigo-400 rounded-lg text-sm border border-indigo-500/20"
                  >
                    <span className="capitalize">{key}: {value}</span>
                    <button
                      onClick={() => setSelectedFilters(prev => ({ ...prev, [key]: 'all' }))}
                      className="hover:text-white transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )
              ))}
              {Object.values(selectedFilters).some(value => value !== 'all') && (
                <button
                  onClick={() => setSelectedFilters({
                    category: 'all',
                    price: 'all',
                    stock: 'all',
                    status: 'all'
                  })}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Products Grid with Updated Card Design */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
              <p className="text-gray-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden 
                    hover:border-indigo-500/50 transition-all duration-300"
                >
                  {/* Product Image Container */}
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Quick Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/admin/products/edit/${product.id}`}
                        className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4 text-white" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-md
                          ${product.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/20'
                          }`}
                      >
                        {product.status}
                      </span>
                      {product.stock < 10 && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-500/20 
                          text-yellow-400 backdrop-blur-md border border-yellow-500/20">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-4">
                    {/* Product Details */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                        <p className="text-indigo-400 font-semibold whitespace-nowrap">
                          {product.price} ETH
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400">{product.brand}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm text-gray-400">{product.category}</span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <p className="text-sm text-gray-400">Stock Level</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 rounded-full bg-white/10">
                            <div 
                              className={`h-full rounded-full ${
                                product.stock < 10 
                                  ? 'bg-red-500' 
                                  : product.stock < 50 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white">{product.stock}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Sales</p>
                        <p className="text-sm font-medium text-white mt-1">
                          {/* Assuming you have sales data */}
                          {Math.floor(Math.random() * 100)} units
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      <Link
                        href={`/dashboard/admin/products/edit/${product.id}`}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm
                          font-medium transition-colors text-center"
                      >
                        Edit Details
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-4 py-2 bg-white/5 hover:bg-red-500/20 rounded-xl text-red-400 text-sm
                          font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product"
      >
        <div className="p-6">
          <p className="text-gray-300 mb-6">Are you sure you want to delete this product?</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default withAdminLayout(AdminProducts)

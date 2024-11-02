import React, { useState, useEffect } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi'
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
}

const AdminProducts = () => {
  const { address } = useAccount()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

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
      setProducts(formattedProducts as Product[])
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
    .filter((product) => {
      if (filter === 'all') return true
      if (filter === 'active') return product.status === 'active'
      if (filter === 'inactive') return product.status === 'inactive'
      if (filter === 'low-stock') return product.stock < 10
      return true
    })
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Products Management</h1>
              <p className="text-gray-400 mt-1">Manage your product inventory</p>
            </div>
            <Link
              href="/dashboard/admin/products/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" /> Add New Product
            </Link>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-gray-800/50 rounded-xl shadow-xl p-4 border border-gray-700/50">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-900/50 border border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white 
                    placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400" />
                <select
                  className="bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Products</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="low-stock">Low Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <p className="text-gray-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden 
                    hover:border-indigo-500/50 transition-colors group"
                >
                  {/* Product Image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                        <p className="text-gray-400 text-sm">{product.brand}</p>
                      </div>
                      <p className="text-indigo-400 font-semibold">{product.price} ETH</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Stock: <span className="text-white">{product.stock}</span>
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/admin/products/edit/${product.id}`}
                          className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
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

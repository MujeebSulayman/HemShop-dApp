import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ProductStruct } from '@/utils/type.dt'

const SellerProductsPage = () => {
  const [products, setProducts] = useState<ProductStruct[]>([])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Products</h1>
          <Link
            href="/dashboard/seller/products/create"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Add New Product
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-4 space-y-4"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-400">{product.price} ETH</p>
                <p className="text-sm text-gray-500">Stock: {product.stock}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SellerProductsPage

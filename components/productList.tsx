import React from 'react'
import { SiEthereum } from 'react-icons/si'
import { ProductStruct } from '@/utils/type.dt'
import { truncate } from '@/utils/helper'
import { motion } from 'framer-motion'

interface ProductListProps {
  products: ProductStruct[]
  title?: string
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  title = 'Product List',
}) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-12 text-white text-center"
      >
        {title}
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={product.id}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden 
                     shadow-lg hover:shadow-2xl transition-all duration-300 group 
                     border border-gray-700/50 backdrop-blur-sm"
          >
            {/* Product Image */}
            <div className="relative overflow-hidden aspect-square">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-110 
                         transition-transform duration-700 ease-in-out"
              />
              
              {/* Overlay with seller info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm text-gray-300 font-medium">
                      {truncate(product.seller, 4, 4, 11)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              {product.stock === 0 && (
                <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm 
                             text-white px-3 py-1 rounded-full text-sm font-medium">
                  Sold Out
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 line-clamp-2 
                          group-hover:text-purple-400 transition-colors duration-300">
                {product.name}
              </h2>

              <div className="flex items-center justify-between">
                {/* Price */}
                <div className="flex items-center space-x-2">
                  <SiEthereum className="w-4 h-4 text-purple-400" />
                  <span className="text-xl font-bold text-white">
                    {product.price.toFixed(4)}
                  </span>
                </div>

                {/* Buy Button */}
                <button 
                  disabled={product.stock === 0}
                  className="relative inline-flex items-center px-4 py-2 rounded-full
                           bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600
                           text-white font-medium text-sm transition-all duration-300
                           hover:shadow-lg hover:shadow-purple-500/30
                           disabled:cursor-not-allowed disabled:hover:shadow-none
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  <span className="relative">
                    {product.stock === 0 ? 'Sold Out' : 'Buy Now'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ProductList

import React, { useEffect, useState } from 'react'
import { getAllCategories, getProductsByCategory } from '@/services/blockchain'
import { CategoryStruct, ProductStruct } from '@/utils/type.dt'
import { motion } from 'framer-motion'
import { FiGrid, FiPackage, FiArrowRight } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/router'

const CategoryShowcase = () => {
  const [categories, setCategories] = useState<CategoryStruct[]>([])
  const [categoryProducts, setCategoryProducts] = useState<Record<string, ProductStruct[]>>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        const fetchedCategories = await getAllCategories()
        setCategories(fetchedCategories.filter((cat: CategoryStruct) => cat.isActive))

        // Fetch products for each category
        const productsMap: Record<string, ProductStruct[]> = {}
        await Promise.all(
          fetchedCategories.map(async (category: CategoryStruct) => {
            if (category.isActive) {
              const products = await getProductsByCategory(category.name)
              productsMap[category.name] = products.slice(0, 4) // Get only first 4 products
            }
          })
        )
        setCategoryProducts(productsMap)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoriesAndProducts()
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/store?category=${categoryId}`)
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Shop by Category</h2>
          <p className="text-gray-400">Explore our curated collection of products by category</p>
        </div>
        <Link
          href="/categories"
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View All
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.slice(0, 3).map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden 
              cursor-pointer hover:border-indigo-500/50 transition-all"
            onClick={() => router.push(`/categories/${category.id}`)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <FiGrid className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-gray-400">
                      {categoryProducts[category.name]?.length || 0} Products
                    </p>
                  </div>
                </div>
                <Link
                  href={`/categories/${category.id}`}
                  className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg 
                    hover:bg-indigo-500/20 transition-colors text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categoryProducts[category.name]?.slice(0, 2).map((product) => (
                  <Link
                    key={product.id}
                    href={`/store/${product.id}`}
                    className="group relative aspect-square rounded-lg overflow-hidden 
                      bg-gray-900/50 border border-gray-700/50 hover:border-indigo-500/50 
                      transition-all"
                  >
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 
                          transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div
                      className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t 
                      from-black/80 via-black/50 to-transparent"
                    >
                      <p className="text-sm font-medium text-white truncate">{product.name}</p>
                      <p className="text-xs text-indigo-400">{Number(product.price) / 1e18} ETH</p>
                    </div>
                  </Link>
                ))}

                {(!categoryProducts[category.name] ||
                  categoryProducts[category.name].length === 0) && (
                  <div className="col-span-2 py-8 text-center text-gray-400">No products found</div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default CategoryShowcase

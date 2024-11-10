import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getAllCategories, getSubCategory, getProductsByCategory } from '@/services/blockchain'
import { CategoryStruct, SubCategoryStruct, ProductStruct } from '@/utils/type.dt'
import { FiGrid, FiPackage, FiLayers, FiShoppingBag } from 'react-icons/fi'
import Link from 'next/link'

const CategoriesBento = () => {
  const [categories, setCategories] = useState<CategoryStruct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<CategoryStruct | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategoryStruct | null>(null)
  const [products, setProducts] = useState<ProductStruct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductStruct[]>([])

  useEffect(() => {
    const fetchCategoriesWithSubcategories = async () => {
      try {
        setLoading(true)
        const categoriesData = await getAllCategories()
        const categoriesWithSubs = await Promise.all(
          categoriesData.map(async (category: CategoryStruct) => {
            const subCategories = await Promise.all(
              category.subCategoryIds.map(async (subId: number) => {
                try {
                  return await getSubCategory(subId)
                } catch (error) {
                  console.error(`Error fetching subcategory ${subId}:`, error)
                  return null
                }
              })
            )
            return {
              ...category,
              subCategories: subCategories.filter(Boolean),
            }
          })
        )
        setCategories(categoriesWithSubs)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoriesWithSubcategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      if (selectedCategory) {
        try {
          const productsData = await getProductsByCategory(selectedCategory.name)
          setProducts(productsData)
          setFilteredProducts(productsData)
        } catch (error) {
          console.error('Error fetching products:', error)
        }
      }
    }

    fetchProducts()
    setSelectedSubCategory(null)
  }, [selectedCategory])

  useEffect(() => {
    if (selectedSubCategory) {
      const filtered = products.filter(
        product => product.subCategory === selectedSubCategory.name
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [selectedSubCategory, products])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Categories Explorer
          </h1>
          <p className="mt-4 text-lg text-gray-400 leading-relaxed">
            Discover our wide range of products organized by categories. Browse through different 
            sections and find exactly what you're looking for.
          </p>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Featured Categories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full lg:col-span-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 
              rounded-3xl p-8 backdrop-blur-xl border border-white/10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <FiGrid className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Featured Categories</h2>
                <p className="mt-1 text-gray-400">Select a category to explore products</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-5 rounded-xl border transition-all ${
                    selectedCategory?.id === category.id
                      ? 'bg-indigo-500/30 border-indigo-500'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-indigo-500/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="text-lg font-medium text-white mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-400">
                    {category.subCategories?.length || 0} subcategories
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Modified Subcategories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-full lg:col-span-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 
              rounded-3xl p-8 backdrop-blur-xl border border-white/10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FiLayers className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Subcategories</h2>
                <p className="mt-1 text-gray-400">Filter products by subcategory</p>
              </div>
            </div>

            {selectedCategory ? (
              <div className="space-y-4">
                {/* Add "All Products" option */}
                <motion.button
                  onClick={() => setSelectedSubCategory(null)}
                  className={`w-full p-5 rounded-xl border text-left transition-all ${
                    !selectedSubCategory
                      ? 'bg-blue-500/30 border-blue-500'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h4 className="text-lg font-medium text-white">All Products</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {products.length} products
                  </p>
                </motion.button>

                {selectedCategory.subCategories?.map((subCategory: SubCategoryStruct) => {
                  const productCount = products.filter(
                    p => p.subCategory === subCategory.name
                  ).length

                  return (
                    <motion.button
                      key={subCategory.id}
                      onClick={() => setSelectedSubCategory(subCategory)}
                      className={`w-full p-5 rounded-xl border text-left transition-all ${
                        selectedSubCategory?.id === subCategory.id
                          ? 'bg-blue-500/30 border-blue-500'
                          : 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <h4 className="text-lg font-medium text-white">{subCategory.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {productCount} {productCount === 1 ? 'product' : 'products'}
                      </p>
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiLayers className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">
                  Select a category to view and filter by subcategories
                </p>
              </div>
            )}
          </motion.div>

          {/* Modified Products Grid */}
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 
                rounded-3xl p-8 backdrop-blur-xl border border-white/10"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <FiShoppingBag className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {selectedSubCategory 
                      ? `${selectedSubCategory.name} in ${selectedCategory.name}`
                      : `All Products in ${selectedCategory.name}`}
                  </h2>
                  <p className="mt-1 text-gray-400">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
                  </p>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/store/${product.id}`}
                      className="group relative aspect-square rounded-xl overflow-hidden border 
                        border-gray-700/50 bg-gray-800/50 hover:border-green-500/50 transition-all"
                    >
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                        <h3 className="text-lg font-medium text-white truncate mb-1">
                          {product.name}
                        </h3>
                        <p className="text-green-400 font-medium">
                          {Number(product.price) / 1e18} ETH
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FiPackage className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg">
                    {selectedSubCategory 
                      ? `No products available in ${selectedSubCategory.name}`
                      : 'No products available in this category'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoriesBento

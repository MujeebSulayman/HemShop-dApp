import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { getProductsByCategory, getCategory } from '@/services/blockchain'
import { ProductStruct, CategoryStruct } from '@/utils/type.dt'
import { FiPackage } from 'react-icons/fi'
import Link from 'next/link'

const CategoryPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [products, setProducts] = useState<ProductStruct[]>([])
  const [category, setCategory] = useState<CategoryStruct | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!id) return

      try {
        const categoryData = await getCategory(Number(id))
        setCategory(categoryData)

        const productsData = await getProductsByCategory(categoryData.name)
        setProducts(productsData)
      } catch (error) {
        console.error('Error fetching category data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryAndProducts()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{category?.name}</h1>
          <p className="text-gray-400 mt-2">{products.length} Products</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/store/${product.id}`}
              className="group bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 
                hover:border-indigo-500/50 transition-all"
            >
              <div className="aspect-square relative">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <FiPackage className="w-8 h-8 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                <p className="text-indigo-400 mt-1">{Number(product.price) / 1e18} ETH</p>
              </div>
            </Link>
          ))}

          {products.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FiPackage className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No products found in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryPage

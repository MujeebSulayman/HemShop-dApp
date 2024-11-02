import Hero from '@/components/Hero'
import ProductList from '@/components/productList'
import { getProducts } from '@/services/blockchain'
import { ProductStruct } from '@/utils/type.dt'
import { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { FiLoader } from 'react-icons/fi'

const HomePage: NextPage = () => {
  const [products, setProducts] = useState<ProductStruct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data: ProductStruct[] = await getProducts()
        // Filter out deleted and sold out products
        const activeProducts = data.filter((product) => !product.deleted && !product.soldout)
        setProducts(activeProducts)
      } catch (err) {
        setError('Failed to fetch products')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="bg-black min-h-screen w-full overflow-x-hidden">
      <Head>
        <title>HemShop | Shop Globally, Pay with Crypto</title>
        <meta name="description" content="Shop globally and pay with cryptocurrency on HemShop" />
      </Head>

      <main className="w-full">
        <Hero />

        {/* Products Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <FiLoader className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-400">
              <p>No products available at the moment.</p>
            </div>
          ) : (
            <>
              {/* Featured Products */}

              {/* All Products */}
              <div>
                <ProductList products={products} title="All Products" />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default HomePage

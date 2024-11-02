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
      </main>
    </div>
  )
}

export default HomePage

import CategoryShowcase from '@/components/CategoryShowcase'
import Hero from '@/components/Hero'
import RecentTransactions from '@/components/RecentTransactions'
import ProductList from '@/components/Products/productList'
import { NextPage } from 'next'
import Head from 'next/head'

const HomePage: NextPage = () => {
  return (
    <div className="bg-black min-h-screen w-full overflow-x-hidden">
      <Head>
        <title>HemShop | Shop Globally, Pay with Crypto</title>
        <meta name="description" content="Shop globally and pay with cryptocurrency on HemShop" />
      </Head>

      <main className="w-full">
        <Hero />
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Discover Our Latest Products
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore our curated collection of unique items, all available for purchase with cryptocurrency. 
              From digital assets to physical goods, find exactly what you're looking for.
            </p>
          </div>
          <ProductList />
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Browse Categories
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Find what you need faster by exploring our organized categories. 
              Each category features carefully selected products to enhance your shopping experience.
            </p>
          </div>
          <CategoryShowcase />
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Live Transactions
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Watch real-time purchases happening on our platform. 
              See what's trending and popular among our community of crypto shoppers.
            </p>
          </div>
          <RecentTransactions />
        </section>
      </main>
    </div>
  )
}

export default HomePage

import Hero from '@/components/Hero'
import ProductList from '@/components/ProductList'
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
          <ProductList />
        </section>
      </main>
    </div>
  )
}

export default HomePage

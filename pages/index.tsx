import Hero from '@/components/Hero'
import { NextPage } from 'next'
import Head from 'next/head'

const HomePage: NextPage = () => {
  return (
    <div className="bg-black min-h-screen">
      <Head>
        <title>HemShop | Shop Globally, Pay with Crypto</title>
      </Head>
      <main>
        <Hero />
      </main>
    </div>
  )
}

export default HomePage

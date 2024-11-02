import Hero from '@/components/Hero'
import { NextPage } from 'next'
import Head from 'next/head'

const HomePage: NextPage = () => {
  return (
    <div className="bg-black min-h-screen w-full overflow-x-hidden">
      <Head>
        <title>HemShop | Shop Globally, Pay with Crypto</title>
      </Head>
      <main className="w-full">
        <Hero />
      </main>
    </div>
  )
}

export default HomePage

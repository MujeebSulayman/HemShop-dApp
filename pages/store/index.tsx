import ProductList from '../../components/ProductList'
import React from 'react'

const index = () => {
  return (
    <div className="bg-black pt-20 min-h-screen w-full overflow-x-hidden">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-12 text-center">Store</h1>
        <ProductList />
      </section>
    </div>
  )
}

export default index

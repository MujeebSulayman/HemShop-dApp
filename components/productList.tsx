import React from 'react'

interface Product {
  id: number
  name: string
  price: number
  description?: string
  images: string[]
}

interface ProductListProps {
  products: Product[]
  title?: string
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  title = 'Product List',
}) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-48 object-cover mb-4 rounded-lg"
            />
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">{product.name}</h2>
            <p className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList

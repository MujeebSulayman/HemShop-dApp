import React, { useState } from 'react'
import { FiX } from 'react-icons/fi'

interface VariationModalProps {
  attributes: string[]
  onAdd: (variation: any) => void
  onClose: () => void
  basePrice: string
}

export const VariationModal: React.FC<VariationModalProps> = ({
  attributes,
  onAdd,
  onClose,
  basePrice,
}) => {
  const [values, setValues] = useState<{ [key: string]: string }>({})
  const [price, setPrice] = useState(basePrice)
  const [stock, setStock] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      id: Date.now().toString(),
      attributes: values,
      price,
      stock,
      sku: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Add Variation</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {attributes.map(attr => (
            <div key={attr}>
              <label htmlFor={attr} className="text-sm font-medium text-gray-300">
                {attr}
              </label>
              <input
                type="text"
                id={attr}
                name={attr}
                value={values[attr] || ''}
                onChange={(e) => setValues({ ...values, [attr]: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          ))}

          <div>
            <label htmlFor="price" className="text-sm font-medium text-gray-300">
              Price
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="stock" className="text-sm font-medium text-gray-300">
              Stock
            </label>
            <input
              type="text"
              id="stock"
              name="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Variation
          </button>
        </form>
      </div>
    </div>
  )
} 
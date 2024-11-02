import { createProduct } from '@/services/blockchain'
import { ProductInput } from '@/utils/type.dt'
import React, { ChangeEvent, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { getAllCategories, getSubCategory } from '@/services/blockchain'
import { CategoryStruct, SubCategoryStruct } from '@/utils/type.dt'
import { motion } from 'framer-motion'

import { FiBox, FiImage, FiTag, FiLayers, FiGrid, FiChevronDown, FiX } from 'react-icons/fi'

const create = () => {
  const { address } = useAccount()

  const [product, setProduct] = useState<ProductInput>({
    name: '',
    description: '',
    price: '',
    stock: '',
    color: '',
    size: '',
    images: [],
    categoryId: 0,
    subCategoryId: 0,
    model: '',
    brand: '',
    weight: '',
    sku: '',
    seller: address || '',
  })

  const [errors, setErrors] = useState<{ [key in keyof ProductInput]?: string }>({})

  const [imageUrl, setImageUrl] = useState('')

  const [categories, setCategories] = useState<CategoryStruct[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0)
  const [subCategories, setSubCategories] = useState<SubCategoryStruct[]>([])

  useEffect(() => {
    const fetchCategoriesWithSubcategories = async () => {
      try {
        const categoriesData = await getAllCategories()
        const categoriesWithSubs = await Promise.all(
          categoriesData.map(async (category: CategoryStruct) => {
            const subCategories = await Promise.all(
              category.subCategoryIds.map(async (subId: number) => {
                try {
                  return await getSubCategory(subId)
                } catch (error) {
                  console.error(`Error fetching subcategory ${subId}:`, error)
                  return null
                }
              })
            )
            return {
              ...category,
              subCategories: subCategories.filter(Boolean),
            }
          })
        )
        setCategories(categoriesWithSubs)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Failed to fetch categories')
      }
    }

    fetchCategoriesWithSubcategories()
  }, [])

  useEffect(() => {
    if (selectedCategoryId) {
      const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId)
      if (selectedCategory) {
        setSubCategories(selectedCategory.subCategories || [])
      } else {
        setSubCategories([])
      }
    } else {
      setSubCategories([])
    }
  }, [selectedCategoryId, categories])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    if (name === 'categoryId') {
      const numValue = Number(value)
      setSelectedCategoryId(numValue)
      setProduct((prev) => ({
        ...prev,
        categoryId: numValue,
        subCategoryId: 0, // Reset subcategory when category changes
      }))
      return
    }

    const numericFields = ['price', 'stock', 'weight', 'sku', 'categoryId', 'subCategoryId']
    const newValue = numericFields.includes(name) ? Number(value) : value

    setProduct((prevState) => ({
      ...prevState,
      [name]: newValue,
    }))

    if (errors[name as keyof ProductInput]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    const requiredFields = [
      'name',
      'description',
      'price',
      'stock',
      'color',
      'size',
      'images',
      'categoryId',
      'subCategoryId',
      'weight',
      'model',
      'brand',
      'sku',
    ]

    const missingFields = requiredFields.filter((field) => !product[field as keyof ProductInput])
    if (missingFields.length > 0) {
      toast.error(`Please fill in the required fields: ${missingFields.join(', ')}`)
      return
    }

    if (product.images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    if (product.categoryId === 0) {
      toast.error('Please select a category')
      return
    }

    if (product.subCategoryId === 0) {
      toast.error('Please select a sub-category')
      return
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const tx = await createProduct(product)
          console.log(tx)
          resetForm()
          resolve(tx)
        } catch (error) {
          console.error('Error creating product:', error)
          reject(error)
        }
      }),
      {
        pending: 'Creating product...',
        success: 'Product created successfully!',
        // error: {
        //   render({ data }) {
        //     return `Failed to create product: ${data?.message || 'Unknown error'}`
        //   }
        // }
      }
    )
  }

  const handleImageAdd = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter a valid image URL')
      return
    }

    if (product.images.length >= 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, imageUrl],
    }))
    setImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const resetForm = () => {
    setProduct({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      color: '',
      size: '',
      images: [],
      categoryId: 0,
      subCategoryId: 0,
      weight: 0,
      model: '',
      brand: '',
      sku: 0,
      seller: address || '',
    })
    setImageUrl('')
    setSelectedCategoryId(0)
    setSubCategories([])
  }

  return (
    <div className="min-h-screen pt-24 bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section with SVG Background */}
        <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
            </svg>
          </div>
          <div className="relative">
            <h1 className="text-4xl font-bold text-white">Create New Product</h1>
            <p className="mt-2 text-gray-400">
              Fill in the details to add a new product to your store
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FiBox className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-1">
                  Brand*
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={product.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FiTag className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Product Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                  Price (ETH)*
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">Ξ</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-1">
                  Stock*
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={product.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-300 mb-1">
                  SKU*
                </label>
                <input
                  type="number"
                  id="sku"
                  name="sku"
                  value={product.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-1">
                  Color*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={product.color}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    required
                  />
                  {product.color && (
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-gray-600"
                      style={{
                        backgroundColor: product.color.toLowerCase(),
                        display: CSS.supports('color', product.color) ? 'block' : 'none',
                      }}
                    />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-1">
                  Size*
                </label>
                <select
                  id="size"
                  name="size"
                  value={product.size}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white appearance-none"
                  required
                >
                  <option value="" className="bg-gray-900">
                    Select Size
                  </option>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map((size) => (
                    <option key={size} value={size} className="bg-gray-900">
                      {size}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <FiChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">
                  Weight (kg)*
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={product.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-1">
                  Model*
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={product.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-1">
                  Brand*
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={product.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Categories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <FiLayers className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Categories</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Category*
                </label>
                <div className="relative">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={product.categoryId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-600 
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white 
                    appearance-none hover:border-indigo-500/50 transition-colors
                    shadow-[0_4px_10px_rgba(0,0,0,0.1)] backdrop-blur-sm"
                    required
                  >
                    <option value={0} className="bg-gray-900">
                      Select Category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-gray-900">
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <FiChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="subCategoryId"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Sub Category*
                </label>
                <div className="relative">
                  <select
                    id="subCategoryId"
                    name="subCategoryId"
                    value={product.subCategoryId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-xl border
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white 
                    appearance-none transition-all duration-200 ease-in-out
                    shadow-[0_4px_10px_rgba(0,0,0,0.1)] backdrop-blur-sm
                    ${
                      !selectedCategoryId
                        ? 'bg-gray-800/30 border-gray-700 cursor-not-allowed opacity-60'
                        : 'bg-gray-900/50 border-gray-600 hover:border-indigo-500/50'
                    }`}
                    required
                    disabled={!selectedCategoryId}
                  >
                    <option value={0} className="bg-gray-900">
                      Select Sub Category
                    </option>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id} className="bg-gray-900">
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <FiChevronDown
                      className={`w-5 h-5 ${
                        !selectedCategoryId ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    />
                  </div>
                </div>
                {!selectedCategoryId && (
                  <p className="mt-1 text-sm text-gray-400">Please select a category first</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Images Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FiImage className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Product Images</h2>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-6">
              {/* Image Preview Grid */}
              {product.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-gray-700/50 bg-gray-900/50"
                    >
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm transition-colors"
                        >
                          Remove
                        </button>
                        <span className="text-gray-300 text-sm">Image {index + 1}</span>
                      </div>
                    </div>
                  ))}

                  {/* Empty Slots */}
                  {Array.from({ length: Math.max(0, 5 - product.images.length) }).map(
                    (_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/30 flex items-center justify-center"
                      >
                        <span className="text-gray-500 text-sm">Empty Slot</span>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Image URL Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {product.images.length}/5 images added
                  </span>
                  {product.images.length >= 5 && (
                    <span className="text-sm text-yellow-400">Maximum images reached</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Enter image URL"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-600 
                        focus:ring-2 focus:ring-green-500 focus:border-transparent text-white 
                        placeholder-gray-400 transition-all"
                      disabled={product.images.length >= 5}
                    />
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <FiX className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleImageAdd}
                    disabled={!imageUrl.trim() || product.images.length >= 5}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all
                      ${
                        !imageUrl.trim() || product.images.length >= 5
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                  >
                    Add Image
                  </button>
                </div>
              </div>

              {/* Helper Text */}
              <p className="text-sm text-gray-400">
                Add up to 5 images of your product. Images should be clear and show the product from
                different angles.
              </p>
            </div>
          </motion.div>

          {/* Form Actions */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default create
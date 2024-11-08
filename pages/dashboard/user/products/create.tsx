import withUserLayout from '@/components/hoc/withUserLayout'
import { createProduct } from '@/services/blockchain'
import { ProductInput } from '@/utils/type.dt'
import React, { ChangeEvent, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { getAllCategories, getSubCategory } from '@/services/blockchain'
import { CategoryStruct, SubCategoryStruct } from '@/utils/type.dt'
import { motion } from 'framer-motion'

import {
  FiBox,
  FiImage,
  FiTag,
  FiLayers,
  FiGrid,
  FiChevronDown,
  FiX,
  FiRefreshCw,
} from 'react-icons/fi'
import Image from 'next/image'


const generateSKU = () => {
  const prefix = 'SKU'
  const timestamp = Date.now().toString().slice(-4)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${random}-${timestamp}`
}

const Create = () => {
  const { address } = useAccount()

  const [product, setProduct] = useState<ProductInput>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    colors: [],
    sizes: [],
    images: [],
    categoryId: 0,
    subCategoryId: 0,
    weight: 0,
    model: '',
    brand: '',
    sku: generateSKU(),
    seller: address || '',
  })

  const [errors, setErrors] = useState<{ [key in keyof ProductInput]?: string }>({})

  const [imageUrl, setImageUrl] = useState('')

  const [categories, setCategories] = useState<CategoryStruct[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0)
  const [subCategories, setSubCategories] = useState<SubCategoryStruct[]>([])

  const [colorInput, setColorInput] = useState('')

  const handleAddColor = () => {
    if (!colorInput.trim()) {
      toast.error('Please enter a color')
      return
    }

    if (product.colors?.includes(colorInput.trim())) {
      toast.error('This color is already added')
      return
    }

    setProduct((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), colorInput.trim()],
    }))
    setColorInput('')
  }

  const handleRemoveColor = (colorToRemove: string) => {
    setProduct((prev) => ({
      ...prev,
      colors: prev.colors?.filter((color) => color !== colorToRemove) || [],
    }))
  }

  const handleSizeChange = (size: string) => {
    setProduct((prev) => ({
      ...prev,
      sizes: prev.sizes?.includes(size)
        ? prev.sizes?.filter((s) => s !== size) || []
        : [...(prev.sizes || []), size],
    }))
  }

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
        subCategoryId: 0,
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

    const validationErrors: { [key: string]: string } = {}

    if (!product.name.trim()) validationErrors.name = 'Name is required'
    if (!product.description.trim()) validationErrors.description = 'Description is required'
    if (!product.price || Number(product.price) <= 0)
      validationErrors.price = 'Valid price is required'
    if (!product.stock || Number(product.stock) <= 0)
      validationErrors.stock = 'Valid stock is required'
    if (!product.images.length) validationErrors.images = 'At least one image is required'
    if (!product.categoryId) validationErrors.categoryId = 'Category is required'
    if (!product.subCategoryId) validationErrors.subCategoryId = 'Subcategory is required'
    if (!product.weight || Number(product.weight) <= 0)
      validationErrors.weight = 'Valid weight is required'
    if (!product.colors?.length) validationErrors.colors = 'At least one color is required'

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const errorFields = Object.keys(validationErrors).join(', ')
      toast.error(`Please fill in all required fields: ${errorFields}`)
      return
    }

    try {
      await createProduct({
        ...product,
        seller: address,
      })

      toast.success('Product created successfully!')
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product')
    }
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
      colors: [],
      sizes: [],
      images: [],
      categoryId: 0,
      subCategoryId: 0,
      weight: 0,
      model: '',
      brand: '',
      sku: generateSKU(),
      seller: address || '',
    })
    setImageUrl('')
    setSelectedCategoryId(0)
    setSubCategories([])
    setErrors({})
  }

  const handleRegenerateSKU = () => {
    setProduct((prev) => ({
      ...prev,
      sku: generateSKU(),
    }))
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Product Name*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-600
                      focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                      text-white placeholder-gray-400
                      transition-all duration-200 ease-in-out
                      hover:border-gray-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-1">
                  Brand <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={product.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-600
                    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    text-white placeholder-gray-400
                    transition-all duration-200 ease-in-out
                    hover:border-gray-500"
                  placeholder="Enter brand name"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-600
                    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    text-white placeholder-gray-400
                    transition-all duration-200 ease-in-out
                    hover:border-gray-500
                    resize-none"
                  placeholder="Enter product description"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Product Details - Simplified */}
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
              {/* Required Fields */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Price (ETH)*
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Ξ</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0.0000001"
                    step="0.0000001"
                    value={product.price}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-600
                      focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      text-white placeholder-gray-400
                      transition-all duration-200 ease-in-out
                      hover:border-gray-500"
                    placeholder="0.0001"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Stock*
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  min="1"
                  step="1"
                  value={product.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-600
                    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    text-white placeholder-gray-400
                    transition-all duration-200 ease-in-out
                    hover:border-gray-500"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Weight (kg)*
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  min="0.0001"
                  step="0.0001"
                  value={product.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-600
                    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    text-white placeholder-gray-400
                    transition-all duration-200 ease-in-out
                    hover:border-gray-500"
                  placeholder="0.000"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">
                  Enter weight in kilograms (e.g., 0.5 for 500g)
                </p>
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-300 mb-1.5">
                  SKU (Auto-generated)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={product.sku}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800/30 border border-gray-600
                      text-white font-mono
                      cursor-default"
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateSKU}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 
                      hover:bg-gray-700/50 rounded-lg transition-colors"
                    title="Generate new SKU"
                  >
                    <FiRefreshCw className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-400">Unique identifier for your product</p>
              </div>

              <div>
                <label htmlFor="colors" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Colors*
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-600
                        focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                        text-white placeholder-gray-400"
                      placeholder="Enter a color"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-4 py-2.5 bg-blue-500/20 text-blue-400 rounded-xl
                        hover:bg-blue-500/30 transition-colors"
                    >
                      Add Color
                    </button>
                  </div>

                  {product.colors && product.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <span
                          key={color}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg
                            bg-gray-700/50 text-gray-300"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(color)}
                            className="p-1 hover:text-red-400 transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="sizes" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Sizes <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeChange(size)}
                      className={`px-4 py-2 rounded-xl transition-colors ${
                        product.sizes && product.sizes.includes(size)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-1">
                  Model <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={product.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-600
                    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    text-white placeholder-gray-400
                    transition-all duration-200 ease-in-out
                    hover:border-gray-500"
                  placeholder="Enter model number/name"
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
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Category*
                </label>
                <div className="relative">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={product.categoryId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-600
                      focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      text-white appearance-none
                      transition-all duration-200 ease-in-out
                      hover:border-gray-500"
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="subCategoryId"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
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

export default withUserLayout(Create)

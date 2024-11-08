import React, { useState, useEffect } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { toast } from 'react-toastify'
import {
  createCategory,
  createSubCategory,
  getAllCategories,
  updateCategory,
  updateSubCategory,
  getSubCategory,
  deleteCategory,
  deleteSubCategory,
  createSubCategoriesBulk,
} from '@/services/blockchain'
import { CategoryStruct, SubCategoryStruct } from '@/utils/type.dt'
import { FiPlus, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi'

const CategoriesManagement = () => {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryStruct[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [newSubCategory, setNewSubCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string } | null>(null)
  const [editingSubCategory, setEditingSubCategory] = useState<{ id: number; name: string } | null>(
    null
  )
  const [bulkSubCategories, setBulkSubCategories] = useState('')
  const [selectedCategoryForBulk, setSelectedCategoryForBulk] = useState<number | null>(null)

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const categoriesData = await getAllCategories()

      // Fetch subcategories for each category
      const categoriesWithSubs = await Promise.all(
        categoriesData.map(async (category: CategoryStruct) => {
          const subCategories = await Promise.all(
            category.subCategoryIds.map(async (subId: number) => {
              try {
                return await getSubCategory(subId)
              } catch (error) {
                console.error(`Failed to fetch subcategory ${subId}:`, error)
                return null
              }
            })
          )

          return {
            ...category,
            subCategories: subCategories.filter((sub): sub is SubCategoryStruct => sub !== null),
          }
        })
      )

      setCategories(categoriesWithSubs)
    } catch (error) {
      toast.error('Failed to fetch categories')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      setLoading(true)
      await createCategory(newCategory)
      toast.success('Category created successfully')
      setNewCategory('')
      fetchCategories() // Refresh the list
    } catch (error) {
      toast.error('Failed to create category')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory) {
      toast.error('Please select a parent category')
      return
    }
    if (!newSubCategory.trim()) {
      toast.error('Subcategory name is required')
      return
    }

    try {
      setLoading(true)
      await createSubCategory(selectedCategory, newSubCategory)
      toast.success('Subcategory created successfully')
      setNewSubCategory('')
      setSelectedCategory(null)
      fetchCategories() // Refresh the list
    } catch (error) {
      toast.error('Failed to create subcategory')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      setLoading(true)
      await updateCategory(editingCategory.id, editingCategory.name, true)
      toast.success('Category updated successfully')
      setEditingCategory(null)
      fetchCategories()
    } catch (error) {
      toast.error('Failed to update category')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSubCategory) return

    try {
      setLoading(true)
      await updateSubCategory(editingSubCategory.id, editingSubCategory.name, true)
      toast.success('Subcategory updated successfully')
      setEditingSubCategory(null)
      fetchCategories()
    } catch (error) {
      toast.error('Failed to update subcategory')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategoryClick = (category: { id: number; name: string }) => {
    setEditingCategory(category)
  }

  const handleEditSubCategoryClick = (subCategory: { id: number; name: string }) => {
    setEditingSubCategory(subCategory)
  }

  // Helper function to structure the category data from blockchainl
  const structureCategories = (data: CategoryStruct[]): CategoryStruct[] => {
    return data.map((category) => ({
      id: Number(category.id),
      name: category.name,
      isActive: category.isActive,
      subCategoryIds: category.subCategoryIds || [],
      subCategories: category.subCategories || [],
    }))
  }

  // Add this modal component for editing categories
  const EditCategoryModal = ({ category, onClose, onSubmit }: any) => {
    const [name, setName] = useState(category.name)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit({ ...category, name })
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg w-96">
          <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return

    try {
      setLoading(true)
      await deleteCategory(categoryId)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error) {
      toast.error('Failed to delete category')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubCategory = async (subCategoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return

    try {
      setLoading(true)
      await deleteSubCategory(subCategoryId)
      toast.success('Subcategory deleted successfully')
      fetchCategories()
    } catch (error) {
      toast.error('Failed to delete subcategory')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const EditSubCategoryModal = ({ subCategory, onClose, onSubmit }: any) => {
    const [name, setName] = useState(subCategory.name)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit({ ...subCategory, name })
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg w-96">
          <h2 className="text-xl font-semibold mb-4">Edit Subcategory</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subcategory Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const handleBulkSubCategoryAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategoryForBulk) {
      toast.error('Please select a parent category')
      return
    }
    if (!bulkSubCategories.trim()) {
      toast.error('Please enter subcategories')
      return
    }

    try {
      setLoading(true)
      const subCategoryNames = bulkSubCategories
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0)

      await createSubCategoriesBulk(selectedCategoryForBulk, subCategoryNames)
      toast.success('Subcategories created successfully')
      setBulkSubCategories('')
      setSelectedCategoryForBulk(null)
      fetchCategories()
    } catch (error) {
      toast.error('Failed to create subcategories')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Category Management</h1>
        {loading && <span className="text-gray-400">Loading...</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Category Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category Name</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter category name"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Add Subcategory Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Subcategory</h2>
          <form onSubmit={handleAddSubCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parent Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                disabled={loading}
              >
                <option value="">Select parent category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subcategory Name
              </label>
              <input
                type="text"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter subcategory name"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Subcategory
            </button>
          </form>
        </div>

        {/* Add Bulk Subcategories Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Add Subcategories</h2>
          <form onSubmit={handleBulkSubCategoryAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parent Category
              </label>
              <select
                value={selectedCategoryForBulk || ''}
                onChange={(e) => setSelectedCategoryForBulk(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                disabled={loading}
              >
                <option value="">Select parent category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subcategory Names (one per line)
              </label>
              <textarea
                value={bulkSubCategories}
                onChange={(e) => setBulkSubCategories(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter subcategory names&#10;One per line"
                rows={5}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiUpload size={18} />
              Bulk Add Subcategories
            </button>
          </form>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{category.name}</h3>
                <div className="flex space-x-2">
                  <button
                    className="p-2 text-gray-400 hover:text-white"
                    title="Edit category"
                    onClick={() =>
                      handleEditCategoryClick({ id: category.id, name: category.name })
                    }
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-red-500"
                    title="Delete category"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
              {category.subCategories && category.subCategories.length > 0 && (
                <div className="ml-4 pl-4 border-l border-gray-600">
                  <h4 className="text-sm text-gray-400 mb-2">Subcategories:</h4>
                  <div className="space-y-2">
                    {category.subCategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between bg-gray-600 rounded p-2"
                      >
                        <span>{sub.name}</span>
                        <div className="flex space-x-2">
                          <button
                            className="p-1 text-gray-400 hover:text-white"
                            title="Edit subcategory"
                            onClick={() => handleEditSubCategoryClick(sub)}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="Delete subcategory"
                            onClick={() => handleDeleteSubCategory(sub.id)}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSubmit={handleEditCategory}
        />
      )}

      {editingSubCategory && (
        <EditSubCategoryModal
          subCategory={editingSubCategory}
          onClose={() => setEditingSubCategory(null)}
          onSubmit={handleEditSubCategory}
        />
      )}
    </div>
  )
}

export default withAdminLayout(CategoriesManagement)

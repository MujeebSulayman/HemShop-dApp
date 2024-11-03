import { ethers } from 'ethers'
import address from '@/contracts/contractAddress.json'
import abi from '@/artifacts/contracts/HemShop.sol/HemShop.json'
import {
  ProductParams,
  ProductStruct,
  PurchaseHistoryStruct,
  ReviewStruct,
  SellerStatus,
  ShippingDetails,
  SubCategoryStruct,
} from '@/utils/type.dt'

const toWei = (num: number) => ethers.parseEther(num.toString())
const fromWei = (num: string | number | null) => {
  if (num === null || num === undefined) {
    return '0'
  }
  return ethers.formatEther(num.toString())
}

let ethereum: any
let tx: any

if (typeof window !== 'undefined') ethereum = (window as any).ethereum

const getEthereumContract = async () => {
  const accounts = await ethereum.request({ method: 'eth_accounts' })

  if (accounts.length > 0) {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(address.hemShopContract, abi.abi, signer)
    return contract
  } else {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
    const contract = new ethers.Contract(address.hemShopContract, abi.abi, provider)
    return contract
  }
}

const createProduct = async (product: ProductParams): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    const productInput = {
      name: product.name,
      description: product.description,
      price: toWei(Number(product.price)),
      stock: Number(product.stock),
      color: product.color,
      size: product.size,
      images: product.images,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      weight: Number(product.weight),
      model: product.model,
      brand: product.brand,
      sku: Number(product.sku),
    }
    tx = await contract.createProduct(productInput)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const updateProduct = async (product: ProductParams): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    const productInput = {
      name: product.name,
      description: product.description,
      price: toWei(Number(product.price)),
      stock: Number(product.stock),
      color: product.color,
      size: product.size,
      images: product.images,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      weight: Number(product.weight),
      model: product.model,
      brand: product.brand,
      sku: Number(product.sku),
    }
    tx = await contract.updateProduct(product.id, productInput)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const deleteProduct = async (productId: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.deleteProduct(productId)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getProduct = async (productId: number): Promise<ProductStruct> => {
  const contract = await getEthereumContract()
  const product = await contract.getProduct(productId)
  return structureProduct([product])[0]
}

const getMyProducts = async (): Promise<ProductStruct[]> => {
  const contract = await getEthereumContract()
  const products = await contract.getMyProducts()
  return structureProduct(products)
}

const getProducts = async (): Promise<ProductStruct[]> => {
  const contract = await getEthereumContract()
  const products = await contract.getAllProducts()
  return structureProduct(products)
}

const getProductsByCategory = async (category: string): Promise<ProductStruct[]> => {
  const contract = await getEthereumContract()
  const products = await contract.getProductsByCategory(category)
  return structureProduct(products)
}

const getSellerProducts = async (seller: string): Promise<ProductStruct[]> => {
  const contract = await getEthereumContract()
  const products = await contract.getSellerProducts(seller)
  return structureProduct(products)
}

const getSellerBalance = async (seller: string): Promise<number> => {
  const contract = await getEthereumContract()
  const balance = await contract.getSellerBalance(seller)
  return Number(fromWei(balance))
}

const buyProduct = async (
  productId: number,
  shippingDetails: ShippingDetails,
  price: number
): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.buyProduct(productId, shippingDetails, { value: toWei(price) })
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getSellerPurchaseHistory = async (seller: string): Promise<PurchaseHistoryStruct[]> => {
  const contract = await getEthereumContract()
  const purchaseHistory = await contract.getSellerPurchaseHistory(seller)
  return structurePurchaseHistory(purchaseHistory)
}

const getBuyerPurchaseHistory = async (buyer: string): Promise<PurchaseHistoryStruct[]> => {
  const contract = await getEthereumContract()
  const purchaseHistory = await contract.getBuyerPurchaseHistory(buyer)
  return structurePurchaseHistory(purchaseHistory)
}

const createReview = async (productId: number, rating: number, comment: string): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.createReview(productId, rating, comment)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getReviews = async (productId: number): Promise<ReviewStruct[]> => {
  const contract = await getEthereumContract()
  const reviews = await contract.getReviews(productId)
  return structureReview(reviews)
}
const deleteReview = async (productId: number, reviewId: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.deleteReview(productId, reviewId)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const RegisterSeller = async (): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.registerSeller()
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const updateSellerStatus = async (seller: string, status: SellerStatus): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.updateSellerStatus(seller, status)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const markPurchaseDelivered = async (productId: number, buyer: string): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.markPurchaseDelivered(productId, buyer)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const withdraw = async (): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.withdraw()
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const impersonateAccount = async (account: string): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.impersonateAccount(account)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const stopImpersonating = async (): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.stopImpersonating()
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const changeServicePct = async (newPct: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.changeServicePct(newPct)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const structureProduct = (products: ProductStruct[]): ProductStruct[] => {
  return products
    .map((product) => ({
      id: Number(product.id),
      seller: product.seller,
      name: product.name,
      description: product.description,
      price: parseFloat(fromWei(product.price)),
      stock: Number(product.stock),
      color: product.color,
      size: product.size,
      images: product.images,
      category: product.category,
      subCategory: product.subCategory,
      weight: Number(product.weight),
      model: product.model,
      brand: product.brand,
      sku: Number(product.sku),
      soldout: product.soldout,
      wishlist: product.wishlist,
      deleted: product.deleted,
      reviews: product.reviews,
    }))
    .sort((a, b) => a.id - b.id)
}

const structureReview = (review: ReviewStruct[]): ReviewStruct[] => {
  return review.map((review) => ({
    ...review,
    rating: Number(review.rating),
  }))
}

const structurePurchaseHistory = (
  purchaseHistory: PurchaseHistoryStruct[]
): PurchaseHistoryStruct[] => {
  return purchaseHistory
    .map((purchase) => ({
      ...purchase,
      totalAmount: parseFloat(fromWei(purchase.totalAmount)),
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}

const createCategory = async (name: string): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.createCategory(name)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const createSubCategory = async (parentId: number, name: string): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.createSubCategory(parentId, name)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getAllCategories = async () => {
  try {
    const contract = await getEthereumContract()
    const data = await contract.getAllCategories()

    // Destructure the returned data from the contract
    const [ids, names, activeStates, subCategoryIdArrays] = data

    // Create a structured array of categories
    const categories = ids.map((id: any, index: number) => ({
      id: Number(id),
      name: names[index],
      isActive: activeStates[index],
      subCategoryIds: subCategoryIdArrays[index].map((subId: any) => Number(subId)),
    }))

    return categories
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const createSubCategoriesBulk = async (parentId: number, names: string[]): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.createSubCategoriesBulk(parentId, names)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const fetchSubCategories = async (): Promise<SubCategoryStruct[]> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    const categories = await getAllCategories()
    const subCategories: SubCategoryStruct[] = []

    for (const category of categories) {
      for (const subCategoryId of category.subCategoryIds) {
        const subCategory = await contract.getSubCategory(subCategoryId)
        if (subCategory.isActive) {
          subCategories.push({
            id: Number(subCategory.id),
            name: subCategory.name,
            parentCategoryId: Number(subCategory.parentCategoryId),
            isActive: subCategory.isActive
          })
        }
      }
    }
    return subCategories
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const updateCategory = async (id: number, name: string, isActive: boolean): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.updateCategory(id, name, isActive)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const updateSubCategory = async (id: number, name: string, isActive: boolean): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.updateSubCategory(id, name, isActive)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getSubCategory = async (id: number): Promise<SubCategoryStruct> => {
  try {
    const contract = await getEthereumContract()
    const subCategory = await contract.getSubCategory(id)
    
    return {
      id: Number(subCategory.id),
      name: subCategory.name,
      parentCategoryId: Number(subCategory.parentCategoryId),
      isActive: subCategory.isActive
    }
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const deleteCategory = async (id: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    // First check if category exists
    const category = await contract.getCategory(id)
    if (!category.isActive) {
      throw new Error('Category already deleted')
    }
    tx = await contract.updateCategory(id, category.name, false)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const deleteSubCategory = async (id: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    // First check if subcategory exists
    const subCategory = await contract.getSubCategory(id)
    if (!subCategory.isActive) {
      throw new Error('SubCategory already deleted')
    }
    tx = await contract.updateSubCategory(id, subCategory.name, false)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

export {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getMyProducts,
  getProducts,
  getProductsByCategory,
  getSellerProducts,
  getSellerBalance,
  getSellerPurchaseHistory,
  getBuyerPurchaseHistory,
  getReviews,
  createReview,
  deleteReview,
  RegisterSeller,
  updateSellerStatus,
  markPurchaseDelivered,
  withdraw,
  impersonateAccount,
  stopImpersonating,
  changeServicePct,
  buyProduct,
  createCategory,
  createSubCategory,
  getAllCategories,
  createSubCategoriesBulk,
  fetchSubCategories,
  updateCategory,
  updateSubCategory,
  getSubCategory,
  deleteCategory,
  deleteSubCategory,

}

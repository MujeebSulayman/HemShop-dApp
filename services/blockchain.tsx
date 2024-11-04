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
  SellerProfile,
  SellerRegistrationParams,
  CategoryStruct,
} from '@/utils/type.dt'

const toWei = (num: number) => {
  try {
    return ethers.parseEther(num.toString())
  } catch (error) {
    throw error
  }
}
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

    const weightInGrams = Math.round(Number(product.weight) * 1000)
    const numericSku = Date.now()

    const productInput = {
      name: product.name,
      description: product.description,
      price: toWei(Number(product.price)),
      stock: Number(product.stock),
      colors: product.colors,
      sizes: product.sizes || [],
      images: product.images,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      weight: weightInGrams,
      model: product.model || '',
      brand: product.brand || '',
      sku: numericSku,
    }

    tx = await contract.createProduct(productInput)
    await tx.wait()
  } catch (error: any) {
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
      colors: product.colors,
      sizes: product.sizes || [],
      images: product.images,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      weight: Number(product.weight),
      model: product.model || '',
      brand: product.brand || '',
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

    // Log all shipping details
    console.log('Shipping Details received:', shippingDetails)

    // Check each field individually and log if missing
    const missingFields = []

    if (!shippingDetails.fullName) missingFields.push('fullName')
    if (!shippingDetails.streetAddress) missingFields.push('streetAddress')
    if (!shippingDetails.city) missingFields.push('city')
    if (!shippingDetails.state) missingFields.push('state')
    if (!shippingDetails.country) missingFields.push('country')
    if (!shippingDetails.postalCode) missingFields.push('postalCode')
    if (!shippingDetails.phone) missingFields.push('phone')
    if (!shippingDetails.email) missingFields.push('email')

    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields)
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

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

const fetchSubCategories = async (categoryId: number): Promise<SubCategoryStruct[]> => {
  try {
    const contract = await getEthereumContract()
    const subCategories = await contract.getSubCategories(categoryId)
    return subCategories.map((subCategory: any) => ({
      id: Number(subCategory.id),
      name: subCategory.name,
      parentCategoryId: Number(subCategory.parentCategoryId),
      isActive: subCategory.isActive,
    }))
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
    const [subCatId, name, parentCategoryId, isActive] = await contract.getSubCategory(id)

    return {
      id: Number(subCatId),
      name: name,
      parentCategoryId: Number(parentCategoryId),
      isActive: isActive,
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
    tx = await contract.deleteCategory(id)
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
    tx = await contract.deleteSubCategory(id)
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
      colors: product.colors,
      sizes: product.sizes || [],
      images: product.images,
      category: product.category,
      subCategory: product.subCategory,
      weight: Number(product.weight),
      model: product.model || '',
      brand: product.brand || '',
      sku: Number(product.sku),
      soldout: product.soldout,
      wishlist: product.wishlist,
      deleted: product.deleted,
      reviews: structureReview(product.reviews),
    }))
    .sort((a, b) => a.id - b.id)
}

const structureReview = (reviews: ReviewStruct[]): ReviewStruct[] => {
  return reviews
    .map((review) => ({
      reviewId: Number(review.reviewId),
      reviewer: review.reviewer,
      rating: Number(review.rating),
      comment: review.comment,
      deleted: review.deleted,
      timestamp: Number(review.timestamp),
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
}

const structurePurchaseHistory = (
  purchaseHistory: PurchaseHistoryStruct[]
): PurchaseHistoryStruct[] => {
  return purchaseHistory
    .map((purchase) => ({
      productId: Number(purchase.productId),
      totalAmount: parseFloat(fromWei(purchase.totalAmount)),
      basePrice: parseFloat(fromWei(purchase.basePrice)),
      timestamp: Number(purchase.timestamp),
      buyer: purchase.buyer,
      seller: purchase.seller,
      isDelivered: purchase.isDelivered,
      shippingDetails: purchase.shippingDetails,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}

const getPendingSellers = async (): Promise<string[]> => {
  try {
    const contract = await getEthereumContract()
    const sellers = await contract.getPendingSellers()
    return sellers
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getSellerStatus = async (seller: string): Promise<SellerStatus> => {
  try {
    const contract = await getEthereumContract()
    const status = await contract.getSellerStatus(seller)
    return status
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const requestToBecomeVendor = async (params: SellerRegistrationParams): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.registerSeller(
      params.businessName,
      params.description,
      params.email,
      params.phone,
      params.logo
    )
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getSellerProfile = async (seller: string): Promise<SellerProfile> => {
  try {
    const contract = await getEthereumContract()
    const profile = await contract.getSellerProfile(seller)
    return {
      businessName: profile.businessName,
      description: profile.description,
      email: profile.email,
      phone: profile.phone,
      logo: profile.logo,
      registeredAt: Number(profile.registeredAt),
      termsAccepted: profile.termsAccepted,
    }
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getCategory = async (id: number): Promise<CategoryStruct> => {
  try {
    const contract = await getEthereumContract()
    const category = await contract.categories(id)
    return {
      id: Number(category.id),
      name: category.name,
      isActive: category.isActive,
      subCategoryIds: category.subCategoryIds.map((id: any) => Number(id)),
    }
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const registerAndVerifyContractOwner = async (): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }

  try {
    const contract = await getEthereumContract()
    const contractAddress = address.hemShopContract

    // First register the contract as a seller
    tx = await contract.registerSeller(
      'Contract Owner Shop', // Business name
      'Official contract owner shop', // Description
      'admin@hemshop.com', // Email
      '0000000000', // Phone
      '' // Logo
    )
    await tx.wait()

    // Then verify the seller status
    tx = await contract.updateSellerStatus(contractAddress, 2) // 2 is SellerStatus.Verified
    await tx.wait()

    console.log('Contract owner registered and verified successfully')
  } catch (error) {
    console.error('Error:', error)
    reportError(error)
    return Promise.reject(error)
  }
}

const getAllSellers = async () => {
  try {
    const contract = await getEthereumContract()
    
    // Get all registered sellers from the contract's array
    const registeredSellers = await contract.registeredSellersList()
    
    // Get pending sellers
    const pendingSellers = await contract.getPendingSellers()
    
    // Combine all unique seller addresses
    const uniqueSellers = [...new Set([...registeredSellers, ...pendingSellers])]
    
    const sellersData = await Promise.all(
      uniqueSellers.map(async (address: string) => {
        const profile = await contract.getSellerProfile(address)
        const status = await contract.getSellerStatus(address)
        return { address, profile, status }
      })
    )

    return sellersData
  } catch (error) {
    console.error('Error fetching sellers:', error)
    throw error
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
  getPendingSellers,
  getSellerStatus,
  requestToBecomeVendor,
  getSellerProfile,
  getCategory,
  registerAndVerifyContractOwner,
  getAllSellers,
}

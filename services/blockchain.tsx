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
  UserData,
  SellerData,
} from '@/utils/type.dt'

// Utility functions
const toWei = (num: number): bigint => {
  try {
    return ethers.parseEther(num.toString())
  } catch (error) {
    throw new Error(`Failed to convert ${num} to Wei: ${error}`)
  }
}

export const fromWei = (num: bigint | string): string => {
  try {
    return ethers.formatEther(num.toString())
  } catch (error) {
    throw new Error(`Failed to convert ${num} from Wei: ${error}`)
  }
}

let ethereum: any
let tx: any

if (typeof window !== 'undefined') ethereum = (window as any).ethereum

export const getEthereumContract = async () => {
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

// Product Management Functions
const createProduct = async (params: ProductParams): Promise<void> => {
  if (!ethereum) throw new Error('No wallet provider found')

  try {
    const contract = await getEthereumContract()

    const productInput = {
      name: params.name,
      description: params.description,
      price: toWei(Number(params.price)),
      stock: Number(params.stock),
      colors: params.colors,
      sizes: params.sizes || [],
      images: params.images,
      categoryId: Number(params.categoryId),
      subCategoryId: Number(params.subCategoryId),
      weight: Math.round(Number(params.weight) * 1000),
      model: params.model || '',
      brand: params.brand || '',
      sku: Number(params.sku) || Date.now(),
    }

    const tx = await contract.createProduct(productInput)
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
  try {
    const contract = await getEthereumContract()
    const products = await contract.getSellerProducts(ethereum.selectedAddress)
    return structureProduct(products)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
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
  if (!ethereum) throw new Error('No wallet provider found')

  try {
    const contract = await getEthereumContract()

    // Validate shipping details
    const requiredFields = [
      'fullName',
      'streetAddress',
      'city',
      'state',
      'country',
      'postalCode',
      'phone',
      'email',
    ]

    for (const field of requiredFields) {
      if (!shippingDetails[field as keyof ShippingDetails]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    const tx = await contract.buyProduct(productId, shippingDetails, { value: toWei(price) })
    await tx.wait()
  } catch (error) {
    console.error('Buy product error:', error)
    throw error
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

const getPendingSellers = async (): Promise<string[]> => {
  try {
    const contract = await getEthereumContract()
    console.log('Contract instance:', contract)

    const pendingSellers = await contract.getPendingVerificationUsers()
    console.log('Raw pending sellers response:', pendingSellers)

    return pendingSellers
  } catch (error) {
    console.error('Error in getPendingSellers:', error)
    throw error
  }
}

const getSellerStatus = async (seller: string): Promise<SellerStatus> => {
  try {
    const contract = await getEthereumContract()
    return await contract.getSellerStatus(seller)
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
    const [catId, name, isActive, subCategoryIds] = await contract.getCategory(id)
    return {
      id: Number(catId),
      name,
      isActive,
      subCategoryIds: subCategoryIds.map((id: any) => Number(id)),
    }
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const registerAndVerifyContractOwner = async (): Promise<void> => {
  if (!ethereum) throw new Error('No wallet provider found')

  try {
    const contract = await getEthereumContract()
    const currentAddress = ethereum.selectedAddress

    // Verify caller is contract owner
    const owner = await contract.owner()
    if (owner.toLowerCase() !== currentAddress.toLowerCase()) {
      throw new Error('Only contract owner can perform this action')
    }

    // Register owner as user first if not already registered
    const userData = await contract.getUser(currentAddress)
    if (!userData.isRegistered) {
      const userTx = await contract.registerUser(
        'Contract Owner',
        'admin@hemshop.com',
        ''
      )
      await userTx.wait()
    }

    // Register owner as seller if not already registered
    const isRegistered = await contract.registeredSellers(currentAddress)
    if (!isRegistered) {
      const sellerTx = await contract.registerSeller(
        'Contract Owner Shop',
        'Official contract owner shop',
        'admin@hemshop.com',
        '0000000000',
        ''
      )
      await sellerTx.wait()
    }

    // Ensure owner has verified status
    const sellerData = await contract.getSeller(currentAddress)
    if (sellerData.status !== SellerStatus.Verified) {
      const statusTx = await contract.updateSellerStatus(currentAddress, SellerStatus.Verified)
      await statusTx.wait()
    }

  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const ensureOwnerHasSellerAccess = async () => {
  try {
    const contract = await getEthereumContract()
    const owner = await contract.owner()
    const currentAddress = ethereum.selectedAddress

    if (currentAddress.toLowerCase() === owner.toLowerCase()) {
      // Register owner as user if not already registered
      const userData = await contract.getUser(currentAddress)
      if (!userData.isRegistered) {
        const userTx = await contract.registerUser(
          'Contract Owner',
          'admin@hemshop.com',
          ''
        )
        await userTx.wait()
      }

      // Register and verify owner as seller if needed
      const sellerData = await contract.getSeller(currentAddress)
      if (sellerData.status !== SellerStatus.Verified) {
        await contract.grantOwnerSellerAccess()
      }
    }
  } catch (error) {
    console.error('Error ensuring owner access:', error)
  }
}

const getAllSellers = async (): Promise<SellerData[]> => {
  try {
    const contract = await getEthereumContract()
    const addresses = await contract.getAllRegisteredSellers()

    const sellersData = await Promise.all(
      addresses.map(async (address: string) => {
        const sellerData = await contract.getSeller(address)
        return {
          address,
          profile: sellerData.profile,
          status: sellerData.status,
          balance: parseFloat(fromWei(sellerData.balance)),
          productIds: sellerData.productIds.map((id: any) => Number(id)),
        }
      })
    )
    return sellersData
  } catch (error) {
    console.error('Error in getAllSellers:', error)
    throw error
  }
}

const getSeller = async (address: string): Promise<SellerData> => {
  try {
    const contract = await getEthereumContract()
    const sellerData = await contract.getSeller(address)

    return {
      address,
      profile: {
        businessName: sellerData.profile.businessName,
        description: sellerData.profile.description,
        email: sellerData.profile.email,
        phone: sellerData.profile.phone,
        logo: sellerData.profile.logo,
        registeredAt: Number(sellerData.profile.registeredAt),
        termsAccepted: sellerData.profile.termsAccepted,
      },
      status: sellerData.status,
      balance: parseFloat(fromWei(sellerData.balance)),
      productIds: sellerData.productIds.map((id: any) => Number(id)),
    }
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getUser = async (address: string): Promise<UserData> => {
  try {
    const contract = await getEthereumContract()
    const userData = await contract.getUser(address)

    return {
      isRegistered: userData.isRegistered,
      profile: userData.isRegistered
        ? {
            name: userData.profile.name,
            email: userData.profile.email,
            avatar: userData.profile.avatar,
            registeredAt: Number(userData.profile.registeredAt),
            isActive: userData.profile.isActive,
          }
        : null,
      isSeller: userData.isSeller,
      sellerStatus: userData.sellerStatus,
    }
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const registerUser = async (name: string, email: string, avatar: string): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.registerUser(name, email, avatar)
    await tx.wait()
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

// Add proper error handling utility
const reportError = (error: any): void => {
  console.error('Blockchain error:', error)
  // Add your error reporting logic here
}

const isOwnerOrVerifiedSeller = async (): Promise<boolean> => {
  try {
    const contract = await getEthereumContract()
    const currentAddress = ethereum.selectedAddress

    // Check if address is contract owner - return true immediately if owner
    const owner = await contract.owner()
    if (owner.toLowerCase() === currentAddress.toLowerCase()) {
      // Ensure owner has seller access
      await ensureOwnerHasSellerAccess()
      return true
    }

    // For non-owners, check if they are verified sellers
    const sellerStatus = await contract.getSellerStatus(currentAddress)
    return sellerStatus === SellerStatus.Verified
  } catch (error) {
    reportError(error)
    return false
  }
}

const updateSellerStatus = async (seller: string, status: SellerStatus): Promise<void> => {
  if (!ethereum) throw new Error('No wallet provider found')

  try {
    const contract = await getEthereumContract()
    const owner = await contract.owner()

    // Verify caller is contract owner
    if (owner.toLowerCase() !== ethereum.selectedAddress.toLowerCase()) {
      throw new Error('Only contract owner can update seller status')
    }

    // Update the seller status
    const tx = await contract.updateSellerStatus(seller, status)
    await tx.wait()

  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const checkSellerVerification = async (
  address: string
): Promise<{
  isVerified: boolean
  status: SellerStatus
}> => {
  try {
    const contract = await getEthereumContract()
    const sellerData = await contract.getSeller(address)

    return {
      isVerified: sellerData.status === SellerStatus.Verified,
      status: sellerData.status,
    }
  } catch (error) {
    console.error('Error checking seller verification:', error)
    return {
      isVerified: false,
      status: SellerStatus.Unverified,
    }
  }
}

const structureProduct = (products: any[]): ProductStruct[] => {
  return products.map((product: any) => ({
    id: Number(product.id),
    seller: product.seller,
    name: product.name,
    description: product.description,
    price: BigInt(product.price),
    stock: Number(product.stock),
    colors: product.colors,
    sizes: product.sizes,
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
    reviews: structureReview(product.reviews),
  }))
}

const structureReview = (reviews: any[]): ReviewStruct[] => {
  return reviews.map((review: any) => ({
    reviewId: Number(review.reviewId),
    reviewer: review.reviewer,
    rating: Number(review.rating),
    comment: review.comment,
    deleted: review.deleted,
    timestamp: Number(review.timestamp),
  }))
}

const structurePurchaseHistory = (history: any[]): PurchaseHistoryStruct[] => {
  return history.map((item: any) => ({
    productId: Number(item.productId),
    totalAmount: Number(fromWei(item.totalAmount)),
    basePrice: Number(fromWei(item.basePrice)),
    timestamp: Number(item.timestamp),
    buyer: item.buyer,
    seller: item.seller,
    isDelivered: item.isDelivered,
    shippingDetails: item.shippingDetails,
  }))
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
  getSeller,
  getUser,
  registerUser,
  isOwnerOrVerifiedSeller,
  checkSellerVerification,
}

export interface ProductParams {
  id?: number
  name: string
  description: string
  price: string | number
  stock: string | number
  colors: string[]
  sizes: string[]
  images: string[]
  categoryId: number
  subCategoryId: number
  weight: string | number
  model: string
  brand: string
  sku: string | number
  seller: string
}

export interface ProductStruct {
  id: number
  seller: string
  name: string
  description: string
  price: bigint
  stock: number
  colors: string[]
  sizes: string[]
  images: string[]
  category: string
  subCategory: string
  weight: number
  model: string
  brand: string
  sku: number
  soldout: boolean
  wishlist: boolean
  deleted: boolean
  reviews: ReviewStruct[]
}

export interface ReviewParams {
  id: number
  rating: number
  comment: string
}

export interface CategoryParams {
  id?: number
  name: string
  slug: string
  description?: string
  image?: string
}

export interface SubCategoryParams extends CategoryParams {
  parentCategoryId: number
}

export interface CategoryStruct {
  id: number
  name: string
  isActive: boolean
  subCategoryIds: number[]
  subCategories?: SubCategoryStruct[]
}

export interface SubCategoryStruct {
  id: number
  name: string
  parentCategoryId: number
  isActive: boolean
}

export interface ReviewStruct {
  reviewId: number
  reviewer: string
  rating: number
  comment: string
  deleted: boolean
  timestamp: number
}

export interface ShippingDetails {
  fullName: string
  streetAddress: string
  city: string
  state: string
  country: string
  postalCode: string
  phone: string
  email: string
}

export interface PurchaseHistoryStruct {
  productId: number
  totalAmount: number
  basePrice: number
  timestamp: number
  buyer: string
  seller: string
  isDelivered: boolean
  shippingDetails: ShippingDetails
}

export enum SellerStatus {
  Unverified = 0,
  Pending = 1,
  Verified = 2,
  Suspended = 3
}

// Add contract event types
export interface ProductPurchasedEvent {
  productId: number
  buyer: string
  seller: string
  price: number
  timestamp: number
}

export interface DeliveryStatusUpdatedEvent {
  productId: number
  buyer: string
  isDelivered: boolean
}

// Add input type to match contract
export interface ProductInput {
  name: string
  description: string
  price: number
  stock: number
  colors: string[]
  sizes: string[]
  images: string[]
  categoryId: number
  subCategoryId: number
  weight: number
  model: string
  brand: string
  sku: number | string
}

// Update ProductInput interface to match the form
export interface ProductInput {
  name: string
  description: string
  price: number
  stock: number
  colors: string[]
  sizes: string[]
  images: string[]
  categoryId: number
  subCategoryId: number
  weight: number
  model: string
  brand: string
  sku: number | string
  seller: string
}

// Update ProductStruct to match
export interface ProductStruct {
  id: number
  seller: string
  name: string
  description: string
  price: bigint
  stock: number
  colors: string[]
  sizes: string[]
  images: string[]
  category: string
  subCategory: string
  weight: number
  model: string
  brand: string
  sku: number
  soldout: boolean
  wishlist: boolean
  deleted: boolean
  reviews: ReviewStruct[]
}

// Update CartItem interface
export interface CartItem extends ProductStruct {
  quantity: number

  selectedColor?: string
  selectedSize?: string
}

export interface SellerProfile {
  businessName: string
  description: string
  email: string
  phone: string
  logo: string
  registeredAt: number
  termsAccepted: boolean
}

export interface SellerRegistrationParams {
  businessName: string
  description: string
  email: string
  phone: string
  logo: string
}

// Update ProductInput to match createProduct function parameters
export interface ProductInput {
  name: string
  description: string
  price: number
  stock: number
  colors: string[]
  sizes: string[]
  images: string[]
  categoryId: number
  subCategoryId: number
  weight: number
  model: string
  brand: string
  sku: number |string
  seller: string
}

// Add missing event types used in blockchain.tsx
export interface ContractEvent {
  productId: number
  buyer: string
  seller: string
  timestamp: number
}

// Update PurchaseHistoryStruct to match blockchain service
export interface PurchaseHistoryStruct {
  productId: number
  totalAmount: number
  basePrice: number
  timestamp: number
  buyer: string
  seller: string
  isDelivered: boolean
  shippingDetails: ShippingDetails
}

// Update ReviewStruct to match blockchain service
export interface ReviewStruct {
  reviewId: number
  reviewer: string
  rating: number
  comment: string
  deleted: boolean
  timestamp: number
}

// Add missing CategoryStruct interface
export interface CategoryStruct {
  id: number
  name: string
  isActive: boolean
  subCategoryIds: number[]
}

// Update SubCategoryStruct to match blockchain service
export interface SubCategoryStruct {
  id: number
  name: string
  parentCategoryId: number
  isActive: boolean
}

// Update SellerProfile to match blockchain service
export interface SellerProfile {
  businessName: string
  description: string
  email: string
  phone: string
  logo: string
  registeredAt: number
  termsAccepted: boolean
}

// Add missing SellerRegistrationParams
export interface SellerRegistrationParams {
  businessName: string
  description: string
  email: string
  phone: string
  logo: string
}

// Add missing category types
export interface CategoryStruct {
  id: number
  name: string
  isActive: boolean
  subCategoryIds: number[]
}

export interface SubCategoryStruct {
  id: number
  name: string
  parentCategoryId: number
  isActive: boolean
}

// Add utility types for blockchain interactions
export type Address = string
export type Wei = string | number
export type Timestamp = number

export interface TransactionResult {
  hash: string
  wait: () => Promise<any>
}

export interface UserProfile {
  name: string
  email: string
  avatar: string
  registeredAt: number
  isActive: boolean
}

export interface UserData {
  isRegistered: boolean
  profile: UserProfile | null
  isSeller: boolean
  sellerStatus: SellerStatus
}

export interface SellerData {
  address: string
  profile: SellerProfile
  status: SellerStatus
  balance: number
  productIds?: number[]
}

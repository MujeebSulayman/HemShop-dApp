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
  initialStock?: string | number
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
  initialStock: number
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

export interface OrderDetails {
  name: string
  images: string[]
  selectedColor: string
  selectedSize: string
  quantity: number
  price: number
}

export enum SellerStatus {
  Unverified = 0,
  Pending = 1,
  Verified = 2,
  Suspended = 3,
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
  seller: string
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

// Add missing event types used in blockchain.tsx
export interface ContractEvent {
  productId: number
  buyer: string
  seller: string
  timestamp: number
}



export interface SubCategoryStruct {
  id: number
  name: string
  parentCategoryId: number
  isActive: boolean
}

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

export enum OrderStatus {
  Pending = 'pending',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export interface OrderActionResult {
  success: boolean
  message: string
  error?: any
}

export interface PurchaseHistoryStruct {
  productId: number
  buyer: string
  seller: string
  totalAmount: number
  basePrice: number
  timestamp: number
  isDelivered: boolean
  shippingDetails: ShippingDetails
  orderDetails: OrderDetails
  status?: OrderStatus
  lastUpdated?: number
  updatedBy?: string
}


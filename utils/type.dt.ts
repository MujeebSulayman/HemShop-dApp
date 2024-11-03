export interface ProductParams {
  id?: number
  seller: string
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
}

export interface ProductStruct {
  id: number
  seller: string
  name: string
  description: string
  price: string | number
  stock: string | number
  colors: string[]
  sizes: string[]
  images: string[]
  category: string
  subCategory: string
  weight: string | number
  model: string
  brand: string
  sku: string | number
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
  subCategories: SubCategoryStruct[]
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
  Unverified,
  Pending,
  Verified,
  Suspended,
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
  price: string | number
  stock: string | number
  colors: string[]
  sizes: string[]
  images: string[]
  categoryId: number
  subCategoryId: number
  model?: string
  brand?: string
  weight: string | number
  sku: string | number
  seller: string
}

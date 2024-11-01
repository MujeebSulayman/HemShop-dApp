export interface ProductParams {
  id?: number
  seller: string
  name: string
  description: string
  price: number
  stock: number
  color: string
  size: string
  images: string[]
  category: string
  subCategory: string
  weight: number
  model: string
  brand: string
  sku: number
}

export interface ProductStruct {
  id: number
  seller: string
  name: string
  description: string
  price: number
  stock: number
  color: string
  size: string
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
  slug: string
  description?: string
  image?: string
  subCategories: SubCategoryStruct[]
  productCount?: number
  isActive: boolean
}

export interface SubCategoryStruct extends Omit<CategoryStruct, 'subCategories'> {
  parentCategoryId: number
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
  Suspended
}

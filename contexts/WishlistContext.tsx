import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { ProductStruct } from '@/utils/type.dt'

interface WishlistContextType {
  wishlist: ProductStruct[]
  addToWishlist: (product: ProductStruct) => void
  removeFromWishlist: (productId: number) => void
  isInWishlist: (productId: number) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const wishlistReducer = (state: ProductStruct[], action: any) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      if (state.some(item => item.id === action.product.id)) {
        return state
      }
      const normalizedProduct = {
        ...action.product,
        id: Number(action.product.id),
        price: Number(action.product.price),
        stock: Number(action.product.stock)
      }
      return [...state, normalizedProduct]

    case 'REMOVE_FROM_WISHLIST':
      return state.filter(item => item.id !== action.productId)

    case 'RESTORE_WISHLIST':
      return action.wishlist.map((item: any) => ({
        ...item,
        id: Number(item.id),
        price: Number(item.price),
        stock: Number(item.stock)
      }))

    default:
      return state
  }
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, dispatch] = useReducer(wishlistReducer, [])

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist)
        dispatch({ type: 'RESTORE_WISHLIST', wishlist: parsedWishlist })
      } catch (error) {
        console.error('Error loading wishlist:', error)
        localStorage.removeItem('wishlist')
      }
    }
  }, [])

  useEffect(() => {
    try {
      const serializedWishlist = wishlist.map((item: any) => ({
        ...item,
        id: Number(item.id),
        price: Number(item.price),
        stock: Number(item.stock)
      }))
      localStorage.setItem('wishlist', JSON.stringify(serializedWishlist))
    } catch (error) {
      console.error('Error saving wishlist:', error)
    }
  }, [wishlist])

  const addToWishlist = (product: ProductStruct) => {
    dispatch({ type: 'ADD_TO_WISHLIST', product })
  }

  const removeFromWishlist = (productId: number) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', productId })
  }

  const isInWishlist = (productId: number) => {
    return wishlist.some((item: ProductStruct) => item.id === productId)
  }

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
} 
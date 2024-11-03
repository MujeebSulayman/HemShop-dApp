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
      return [...state, action.product]

    case 'REMOVE_FROM_WISHLIST':
      return state.filter(item => item.id !== action.productId)

    case 'RESTORE_WISHLIST':
      return action.wishlist

    default:
      return state
  }
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, dispatch] = useReducer(wishlistReducer, [])

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      dispatch({ type: 'RESTORE_WISHLIST', wishlist: JSON.parse(savedWishlist) })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
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
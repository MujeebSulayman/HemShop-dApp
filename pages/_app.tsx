import Header from '@/components/Header'
import '@/styles/global.css'
import { Providers } from '@/services/provider'
import { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '@rainbow-me/rainbowkit/styles.css'
import { useRouter } from 'next/router'
import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [showChild, setShowChild] = useState<boolean>(false)

  useEffect(() => {
    setShowChild(true)
  }, [])

  if (!showChild || typeof window === 'undefined') {
    return null
  } else {
    return (
      <CartProvider>
        <WishlistProvider>
          <Providers>
            <div
              className="min-h-screen flex flex-col text-white w-full overflow-x-hidden
              bg-gradient-to-b from-black via-[#111111] to-black"
            >
              <Header />
              <main className="flex-1 w-full">
                <Component {...pageProps} />
              </main>
              <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
              {!router.pathname.includes('/dashboard') && (
                <footer className="text-center pb-10 text-gray-400 text-md">
                  © 2024 HemShop. All rights reserved.
                </footer>
              )}
            </div>
          </Providers>
        </WishlistProvider>
      </CartProvider>
    )
  }
}

import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { 
  FiHome, FiPackage, FiDollarSign, FiStar, 
  FiUsers, FiSettings, FiShoppingBag, FiBarChart 
} from 'react-icons/fi'
import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

interface SidebarNavProps {
  userRole: 'admin' | 'seller' | 'buyer'
}

export const SidebarNav = ({ userRole }: SidebarNavProps) => {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const navLinks = {
    seller: [
      { href: '/seller', label: 'Overview', icon: FiHome },
      { href: '/seller/products', label: 'Products', icon: FiPackage },
      { href: '/seller/orders', label: 'Orders', icon: FiShoppingBag },
      { href: '/seller/earnings', label: 'Earnings', icon: FiDollarSign },
      { href: '/seller/reviews', label: 'Reviews', icon: FiStar },
      { href: '/seller/profile', label: 'Profile', icon: FiSettings },
    ],
    admin: [
      { href: '/admin', label: 'Overview', icon: FiHome },
      { href: '/admin/products', label: 'Products', icon: FiPackage },
      { href: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
      { href: '/admin/users', label: 'Users', icon: FiUsers },
      { href: '/admin/sellers', label: 'Sellers', icon: FiUsers },
      { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart },
      { href: '/admin/switch-account', label: 'Switch Account', icon: FiSettings },

    ],
    buyer: [
      { href: '/buyer', label: 'Overview', icon: FiHome },
      { href: '/buyer/orders', label: 'My Orders', icon: FiShoppingBag },
      { href: '/buyer/profile', label: 'Profile', icon: FiSettings },
    ],
  }

  const currentLinks = navLinks[userRole]
  
  const isActive = (path: string) => router.pathname.includes(path)

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`relative w-full lg:${isCollapsed ? 'w-20' : 'w-64'} 
        min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 
        border-r border-gray-800/50 p-4 transition-all duration-300 ease-in-out`}
    >
      <div className="absolute -right-3 top-8">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-full bg-purple-600 text-white shadow-lg
            hover:bg-purple-700 transition-colors"
        >
          {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>
      </div>

      <motion.div 
        initial={false}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-center mb-8">
          <motion.img
            src="/logo.png" // Add your logo
            alt="Dashboard Logo"
            className="h-10 w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
        </div>

        <div>
          {!isCollapsed && (
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-6"
            >
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
            </motion.h3>
          )}

          <div className="space-y-2">
            {currentLinks.map((link) => (
              <motion.div
                key={link.href}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/dashboard${link.href}`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium
                    rounded-xl transition-all duration-200 ease-in-out
                    backdrop-blur-sm backdrop-filter
                    ${isActive(link.href)
                      ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className={`${isActive(link.href) ? 'text-white' : 'text-gray-400'}`}
                  >
                    <link.icon className="w-5 h-5" />
                  </motion.div>
                  
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.label}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          className="absolute bottom-4 left-0 right-0 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm
            ${isCollapsed ? 'text-center' : ''}`}>
            {!isCollapsed ? (
              <>
                <p className="text-sm text-gray-400">Storage Usage</p>
                <div className="mt-2 h-2 rounded-full bg-gray-700">
                  <div className="h-full w-7/12 rounded-full bg-purple-600" />
                </div>
              </>
            ) : (
              <div className="h-2 w-2 rounded-full bg-purple-600 mx-auto" />
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.nav>
  )
} 
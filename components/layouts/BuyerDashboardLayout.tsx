import React, { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  HomeIcon,
  ShoppingBagIcon,
  UserIcon,
  HeartIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

interface BuyerDashboardLayoutProps {
  children: ReactNode
}

const BuyerDashboardLayout = ({ children }: BuyerDashboardLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

  const navigationItems = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', path: '/dashboard/buyer', icon: HomeIcon },
        { label: 'Orders', path: '/dashboard/buyer/orders', icon: ShoppingBagIcon },
      ]
    },
    {
      title: 'Personal',
      items: [
       
        { label: 'Wishlist', path: '/dashboard/buyer/wishlist', icon: HeartIcon },
        { label: 'Become Vendor', path: '/dashboard/buyer/becomeVendor', icon: ShoppingBagIcon },
      ]
    }
  ]

  return (
    <div className="flex min-h-screen pt-16 bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-gray-800/95 backdrop-blur-sm border-r border-gray-700/50 
        transition-all duration-300 ease-in-out transform fixed h-[calc(100vh-4rem)]
        top-16 hover:shadow-lg hover:shadow-gray-800/20 overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700/50">
            {!isCollapsed && (
              <span className="text-xl font-semibold text-white/90 transition-opacity duration-200">
                Buyer Dashboard
              </span>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400
              transition-all duration-200 hover:text-white"
            >
              {isCollapsed ? '→' : '←'}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 h-full">
            {navigationItems.map((section, idx) => (
              <div key={idx} className="mb-6">
                {!isCollapsed && (
                  <h3 className="px-4 text-xs font-semibold text-gray-400/80 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = router.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center px-4 py-2 mx-2 rounded-lg text-sm
                        transition-all duration-200 ease-in-out transform hover:scale-102
                        ${isActive 
                          ? 'bg-blue-900/50 text-blue-200' 
                          : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <main className="pt-16 p-6 bg-gray-900">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default BuyerDashboardLayout 
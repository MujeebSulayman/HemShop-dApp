import React, { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  UserIcon,
  StarIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'

interface UserDashboardLayoutProps {
  children: ReactNode
}

const navigationItems = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard/user', icon: HomeIcon },
      { label: 'Profile', path: '/dashboard/user/profile', icon: UserIcon },
      { label: 'Become Vendor', path: '/dashboard/user/becomeVendor', icon: BuildingStorefrontIcon },
    ]
  },
  {
    title: 'Products',
    items: [
      { label: 'All Products', path: '/dashboard/user/products', icon: CubeIcon },
      { label: 'Create Product', path: '/dashboard/user/products/create', icon: PlusCircleIcon },
    ]
  },
  {
    title: 'Sales',
    items: [
      { label: 'Orders', path: '/dashboard/user/orders', icon: ClipboardDocumentListIcon },
      { label: 'Reviews', path: '/dashboard/user/reviews', icon: StarIcon },
    ]
  }
]

const UserDashboardLayout = ({ children }: UserDashboardLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

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
                Seller Dashboard
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
        {/* Header */}
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 fixed w-full z-10 top-0">
          <div className="flex items-center flex-1">
            <input
              type="search"
              placeholder="Search products..."
              className="w-96 px-4 py-2 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border-none"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:bg-gray-700 rounded-full">
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* User Menu */}
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              S
            </div>
          </div>
        </header>

        <main className="pt-16 p-6 bg-gray-900">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserDashboardLayout
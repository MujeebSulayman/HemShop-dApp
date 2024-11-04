import Link from 'next/link'
import ConnectBtn from './ConnectBtn'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CgMenuLeft } from 'react-icons/cg'
import { FaTimes } from 'react-icons/fa'
import { useAccount } from 'wagmi'
import { HiOutlineShoppingBag } from 'react-icons/hi'
import { BiStore } from 'react-icons/bi'
import { Menu, Transition } from '@headlessui/react'
import { FiChevronDown, FiUser, FiPackage, FiSettings } from 'react-icons/fi'
import { useCart } from '@/contexts/CartContext'

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [scrolled, setScrolled] = useState<boolean>(false)
  const { address } = useAccount()
  const { cartItems, cartCount, removeFromCart } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/categories', label: 'Categories' },
    { href: '/store', label: 'Store' },
    { href: '/deals', label: 'Deals' },
    { href: '/vendors', label: 'Vendors' },

  ]

  const accountLinks = [
    { 
      href: '/dashboard/buyer', 
      label: 'Buyer Dashboard',
      icon: FiUser
    },
    { 
      href: '/dashboard/seller', 
      label: 'Seller Dashboard',
      icon: FiPackage
    },
    { 
      href: '/dashboard/admin', 
      label: 'Admin Dashboard',
      icon: FiSettings
    },
  ]

  return (
    <motion.header
      className={`fixed z-50 top-0 right-0 left-0 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/10 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={'/'} className="text-2xl font-extrabold text-white">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                HemShop
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Account Dropdown */}
            {address && (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-1 text-white hover:text-white/80 transition-colors">
                  <span className="text-base font-medium">My Account</span>
                  <FiChevronDown className="h-5 w-5" />
                </Menu.Button>
                <Transition
                  as={React.Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-black/80 backdrop-blur-md py-1 shadow-lg ring-1 ring-white/10 focus:outline-none">
                    {accountLinks.map((link) => (
                      <Menu.Item key={link.href}>
                        {({ active }) => (
                          <Link
                            href={link.href}
                            className={`${
                              active ? 'bg-white/10' : ''
                            } text-white flex items-center gap-2 px-4 py-2 text-base`}
                          >
                            <link.icon className="w-4 h-4" />
                            {link.label}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {/* Updated Cart Icon */}
            <Menu as="div" className="relative">
              <Menu.Button as="div">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative cursor-pointer group"
                >
                  <div className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <HiOutlineShoppingBag className="h-6 w-6 text-white transition-transform group-hover:scale-105" />
                    {cartItems.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium"
                      >
                        {cartItems.length}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              </Menu.Button>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg bg-black/80 backdrop-blur-md py-1 shadow-lg ring-1 ring-white/10 focus:outline-none">
                  {cartItems.length > 0 ? (
                    <div className="px-4 py-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2 border-b border-white/10">
                          <img
                            src={item.images[0] || '/placeholder.png'}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-white">{item.name}</h3>
                            <p className="text-xs text-gray-400">
                              {item.quantity} × {item.price} ETH
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <Link
                        href="/cart"
                        className="mt-4 w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 
                          text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        View Cart
                      </Link>
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-400">
                      Your cart is empty
                    </div>
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
            <ConnectBtn networks />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
            >
              <span className="sr-only">Open menu</span>
              <CgMenuLeft className="h-6 w-6" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="rounded-lg shadow-lg ring-1 ring-white/10 bg-black/80 backdrop-blur-md divide-y divide-white/10">
              <div className="pt-5 pb-6 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={'/'} className="text-xl font-bold text-primary">
                      HemShop
                    </Link>
                  </div>
                  <div className="-mr-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsOpen(!isOpen)}
                      className="bg-gray-800 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    >
                      <span className="sr-only">Close menu</span>
                      <FaTimes className="h-6 w-6" aria-hidden="true" />
                    </motion.button>
                  </div>
                </div>
                <div className="mt-6">
                  <nav className="grid gap-y-4">
                    {navLinks.map((link) => (
                      <NavLink key={link.href} href={link.href} mobile>
                        {link.label}
                      </NavLink>
                    ))}
                    {address && (
                      <>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Account
                        </div>
                        {accountLinks.map((link) => (
                          <NavLink key={link.href} href={link.href} mobile>
                            {link.label}
                          </NavLink>
                        ))}
                      </>
                    )}
                  </nav>
                </div>
              </div>
              <div className="py-6 px-5 space-y-6">
                <ConnectBtn />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

const NavLink: React.FC<{ 
  href: string; 
  children: React.ReactNode; 
  mobile?: boolean;
}> = ({
  href,
  children,
  mobile,
}) => (
  <Link href={href} passHref legacyBehavior>
    <motion.span
      className={`
        ${mobile 
          ? 'block text-base px-3 py-2 rounded-lg hover:bg-white/10 text-white' 
          : 'inline-flex items-center text-base font-medium text-white hover:text-white/80 relative group'
        }
        cursor-pointer transition-colors
      `}
      whileHover={{ scale: mobile ? 1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      {!mobile && (
        <motion.span
          className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform origin-left"
          initial={{ scaleX: 0 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scaleX: 1 }}
        />
      )}
    </motion.span>
  </Link>
)

export default Header

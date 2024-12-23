import React from 'react'
import Link from 'next/link'
import { FiShoppingBag, FiPackage, FiUser, FiGrid, FiHeart, FiHome, FiDatabase, FiCameraOff, FiShoppingCart } from 'react-icons/fi'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { FaDatabase, FaList } from 'react-icons/fa'

const Footer = () => {
  const { address } = useAccount()

  const mainLinks = [
    { href: '/', label: 'Home', icon: FiHome },
    { href: '/categories', label: 'Categories', icon: FiGrid },
    { href: '/store', label: 'Store', icon: FiShoppingBag },
    { href: '/vendor', label: 'Vendors', icon: FiPackage },
  ]

  const userLinks = [
    { href: '/dashboard/user', label: 'Dashboard', icon: FaDatabase },
    { href: '/cart', label: 'Cart', icon: FiShoppingCart },
    { href: '/wishlist', label: 'Wishlist', icon: FaList },
  ]

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Link href="/" className="text-3xl font-bold text-primary">
              HemShop
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              Your trusted marketplace for digital commerce, powered by blockchain technology.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-primary mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {mainLinks.map((link) => (
                <motion.li
                  key={link.href}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Account Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-primary mb-6">Account</h3>
            <ul className="space-y-4">
              {userLinks.map((link) => (
                <motion.li
                  key={link.href}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Connect Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-primary mb-6">Connect</h3>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Join our community and start trading with confidence.
              </p>
              {address ? (
                <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connected: {`${address.slice(0, 6)}...${address.slice(-4)}`}
                  </p>
                </div>
              ) : (
                <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connect your wallet to get started
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400">© 2024 HemShop. All rights reserved.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <motion.a
                whileHover={{ y: -2 }}
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms
              </motion.a>
              <motion.a
                whileHover={{ y: -2 }}
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}

export default Footer

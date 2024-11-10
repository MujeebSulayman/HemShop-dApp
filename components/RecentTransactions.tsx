import React, { useEffect, useState } from 'react'
import { getAllOrders } from '@/services/blockchain'
import { PurchaseHistoryStruct } from '@/utils/type.dt'
import { motion } from 'framer-motion'
import { FiClock, FiPackage, FiUser, FiDollarSign } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { FaEthereum, FaEthernet } from 'react-icons/fa'

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<PurchaseHistoryStruct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const orders = await getAllOrders()
        // Sort by timestamp (most recent first) and take only the last 5
        const recentOrders = orders.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
        setTransactions(recentOrders)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
        <Link href="/store" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          View All Products →
        </Link>
      </div>

      <div className="grid gap-4">
        {transactions.map((tx, index) => (
          <motion.div
            key={`${tx.productId}-${tx.timestamp}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-4">
              {/* Product Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700/50">
                {tx.orderDetails.images[0] ? (
                  <img
                    src={tx.orderDetails.images[0]}
                    alt={tx.orderDetails.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiPackage className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Transaction Details */}
              <div className="flex-grow">
                <h3 className="text-white font-medium mb-1">{tx.orderDetails.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <FaEthereum className="w-4 h-4" />
                    <span>{tx.totalAmount} ETH</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiUser className="w-4 h-4" />
                    <span className="truncate max-w-[120px]">{tx.buyer}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>
                      {formatDistanceToNow(new Date(tx.timestamp * 1000), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tx.isDelivered
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}
              >
                {tx.isDelivered ? 'Delivered' : 'Pending'}
              </div>
            </div>
          </motion.div>
        ))}

        {transactions.length === 0 && (
          <div className="text-center py-8 text-gray-400">No transactions found</div>
        )}
      </div>
    </div>
  )
}

export default RecentTransactions

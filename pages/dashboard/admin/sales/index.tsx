import React, { useEffect, useState } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Loader2, TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react'
import { useAccount } from 'wagmi'
import {
  getAllSellers,
  getAllCategories,
  getSellerPurchaseHistory,
  safeFromWei,
} from '@/services/blockchain'
import { PurchaseHistoryStruct, SellerData } from '@/utils/type.dt'
import { FaEthereum } from 'react-icons/fa'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const MetricCard = ({ title, value, icon: Icon, trend = null }: { title: string, value: number, icon: React.ElementType, trend: number | null }) => (
  <motion.div
    className="bg-gray-800 p-6 rounded-lg shadow-lg"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          {typeof value === 'number' ? (
            <>
              <FaEthereum className="h-5 w-5 text-blue-400" />
              {value.toFixed(4)}
            </>
          ) : (
            value
          )}
        </h3>
        {trend && (
          <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-500/10 rounded-lg">
        <Icon className="h-6 w-6 text-blue-400" />
      </div>
    </div>
  </motion.div>
)

const SalesOverviewPage = () => {
  const { address } = useAccount()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalFees: 0,
    activeSellers: 0,
    averageOrderValue: 0,
    totalOrders: 0
  })
  const [recentSales, setRecentSales] = useState<PurchaseHistoryStruct[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return
      
      try {
        setLoading(true)
        const sellers = await getAllSellers()
        const purchaseHistories = await Promise.all(
          sellers.map(seller => getSellerPurchaseHistory(seller.address))
        )
        
        const allPurchases = purchaseHistories.flat()
        const activeSellers = sellers.filter(s => s.status === 2).length
        const totalSales = allPurchases.reduce((sum, p) => sum + Number(p.totalAmount), 0)
        const serviceFees = totalSales * 0.025

        setMetrics({
          totalSales,
          totalFees: serviceFees,
          activeSellers,
          averageOrderValue: allPurchases.length > 0 ? totalSales / allPurchases.length : 0,
          totalOrders: allPurchases.length
        })

        const sortedSales = [...allPurchases].sort((a, b) => b.timestamp - a.timestamp)
        setRecentSales(sortedSales.slice(0, 10))

      } catch (error) {
        console.error('Error fetching sales data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [address])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Sales Overview</h1>
        <div className="flex items-center gap-2 text-sm bg-gray-800 px-4 py-2 rounded-lg">
          <span className="text-gray-400">Last updated:</span>
          <span className="text-blue-400 font-medium">{new Date().toLocaleString()}</span>
        </div>
      </motion.div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <MetricCard
          title="Total Sales"
          value={metrics.totalSales}
          icon={TrendingUp}
          trend={12.5}
        />
        <MetricCard
          title="Service Fees"
          value={metrics.totalFees}
          icon={DollarSign}
          trend={8.2}
        />
        <MetricCard
          title="Active Sellers"
          value={metrics.activeSellers}
          icon={Users}
          trend={-2.4}
        />
        <MetricCard
          title="Avg Order Value"
          value={metrics.averageOrderValue}
          icon={ShoppingBag}
          trend={5.7}
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Sales</h2>
              <p className="text-gray-400 text-sm mt-1">Showing last {recentSales.length} orders</p>
            </div>
            <div className="px-4 py-2 bg-blue-500/10 rounded-lg">
              <span className="text-blue-400 font-medium">Total Orders: {metrics.totalOrders}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Product ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Buyer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Seller</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {recentSales.map((sale, index) => (
                <motion.tr 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm">
                    {new Date(sale.timestamp * 1000).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono bg-gray-700 px-2 py-1 rounded text-sm">
                      #{sale.productId}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-400 text-sm">
                    {`${sale.buyer.slice(0, 6)}...${sale.buyer.slice(-4)}`}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-400 text-sm">
                    {`${sale.seller.slice(0, 6)}...${sale.seller.slice(-4)}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <FaEthereum className="h-4 w-4 text-blue-400" />
                      <span className="font-medium">{Number(sale.totalAmount).toFixed(4)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sale.isDelivered 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {sale.isDelivered ? 'Delivered' : 'Pending'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default withAdminLayout(SalesOverviewPage)
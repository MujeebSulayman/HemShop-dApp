import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Line, Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js'
import { TrendingUp, Users, ShoppingBag, DollarSign, Package, Grid3X3 } from 'lucide-react'
import {
  getProducts,
  getAllSellers,
  getAllCategories,
  getSellerPurchaseHistory,
  safeFromWei,
  getSellerBalance,
  getSellerProducts,
} from '@/services/blockchain'
import { ProductStruct, SellerData, CategoryStruct, PurchaseHistoryStruct } from '@/utils/type.dt'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { FaEthereum } from 'react-icons/fa'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
)

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const MetricCard = ({ title, value, icon: Icon, trend = null, prefix = '' }: { title: string, value: string | number, icon: React.ElementType, trend: number | null, prefix?: string }) => (
  <motion.div
    className="bg-gray-800 p-6 rounded-lg shadow-lg"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          {prefix && <FaEthereum className="h-5 w-5 text-blue-400" />}
          {typeof value === 'number' ? Number(value).toString() : value}
        </h3>
        {trend && (
          <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-500/10 rounded-lg">
        <Icon className="h-6 w-6 text-blue-400" />
      </div>
    </div>
  </motion.div>
)

const AdminDashboard = () => {
  const [products, setProducts] = useState<ProductStruct[]>([])
  const [sellers, setSellers] = useState<SellerData[]>([])
  const [categories, setCategories] = useState<CategoryStruct[]>([])
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryStruct[]>([])
  const [sellerBalances, setSellerBalances] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch initial data
        const [productsData, sellersData, categoriesData] = await Promise.all([
          getProducts(),
          getAllSellers(),
          getAllCategories(),
        ])

        setProducts(productsData)
        setSellers(sellersData)
        setCategories(categoriesData)

        // Fetch seller-specific data
        const balances = await Promise.all(
          sellersData.map(async (seller) => ({
            seller: seller.address,
            balance: await getSellerBalance(seller.address),
          }))
        )
        setSellerBalances(
          balances.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.seller]: curr.balance,
            }),
            {}
          )
        )

        // Fetch purchase history for all sellers
        const histories = await Promise.all(
          sellersData.map((seller) => getSellerPurchaseHistory(seller.address))
        )
        setPurchaseHistory(histories.flat())
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Chart Data
  const categoryDistributionData = {
    labels: categories.map((cat) => cat.name),
    datasets: [
      {
        label: 'Products per Category',
        data: categories.map((cat) => products.filter((p) => p.category === cat.name).length),
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0'].slice(
          0,
          categories.length
        ),
      },
    ],
  }

  const sellerPerformanceData = {
    labels: sellers.map((s) => s.profile.businessName),
    datasets: [
      {
        label: 'Seller Balance',
        data: sellers.map((s) => sellerBalances[s.address] || 0),
        backgroundColor: '#3B82F6',
      },
    ],
  }

  const revenueTimelineData = {
    labels: purchaseHistory
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((p) => new Date(p.timestamp * 1000).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Revenue',
        data: purchaseHistory.sort((a, b) => a.timestamp - b.timestamp).map((p) => p.totalAmount),
        borderColor: '#10B981',
        tension: 0.4,
      },
    ],
  }

  const totalRevenue = purchaseHistory.reduce((sum, purchase) => sum + purchase.totalAmount, 0)

  if (isLoading) {
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
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <div className="flex items-center gap-2 text-sm bg-gray-800 px-4 py-2 rounded-lg">
          <span className="text-gray-400">Last updated:</span>
          <span className="text-blue-400 font-medium">{new Date().toLocaleString()}</span>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <MetricCard
          title="Total Revenue"
          value={totalRevenue}
          icon={TrendingUp}
          trend={12.5}
          prefix="ETH"
        />
        <MetricCard
          title="Active Products"
          value={products.length}
          icon={Package}
          trend={8.2}
        />
        <MetricCard
          title="Total Sellers"
          value={sellers.length}
          icon={Users}
          trend={5.7}
        />
        <MetricCard 
          title="Categories"
          value={categories.length}
          icon={Grid3X3}
          trend={3.2}
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-gray-800 p-6 rounded-lg shadow col-span-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Revenue Over Time</h2>
          <Line
            data={revenueTimelineData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `${value} ETH`,
                    color: 'rgb(229, 231, 235)',
                  },
                  grid: {
                    color: 'rgb(75, 85, 99)',
                  },
                },
                x: {
                  ticks: {
                    color: 'rgb(229, 231, 235)',
                  },
                  grid: {
                    color: 'rgb(75, 85, 99)',
                  },
                },
              },
              plugins: {
                legend: {
                  labels: {
                    color: 'rgb(229, 231, 235)',
                  },
                },
              },
            }}
          />
        </motion.div>

        <motion.div
          className="bg-gray-800 p-6 rounded-lg shadow"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Seller Performance</h2>
          <Pie
            data={sellerPerformanceData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: 'rgb(229, 231, 235)',
                  },
                },
              },
            }}
          />
        </motion.div>

        <motion.div
          className="bg-gray-800 p-6 rounded-lg shadow col-span-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Products by Category</h2>
          <Bar
            data={categoryDistributionData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </motion.div>
      </div>

      {/* Recent Transactions Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
              <p className="text-gray-400 text-sm mt-1">Latest marketplace activity</p>
            </div>
            <div className="px-4 py-2 bg-blue-500/10 rounded-lg">
              <span className="text-blue-400 font-medium">
                Total Transactions: {purchaseHistory.length}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3 text-left text-gray-300">Date</th>
                <th className="px-6 py-3 text-left text-gray-300">Product ID</th>
                <th className="px-6 py-3 text-left text-gray-300">Buyer</th>
                <th className="px-6 py-3 text-left text-gray-300">Amount</th>
                <th className="px-6 py-3 text-left text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchaseHistory.slice(0, 5).map((purchase, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(purchase.timestamp * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{purchase.productId}</td>
                  <td className="px-6 py-4">
                    {`${purchase.buyer.slice(0, 6)}...${purchase.buyer.slice(-6)}`}
                  </td>
                  <td className="px-6 py-4 flex items-center">
                    <FaEthereum className="inline-block mr-1" />
                    {purchase.totalAmount.toFixed()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        purchase.isDelivered
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {purchase.isDelivered ? 'Delivered' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default withAdminLayout(AdminDashboard)

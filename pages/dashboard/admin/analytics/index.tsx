import React, { useEffect, useState } from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { Card } from '@/components/ui/card'
import { 
  BarChart, LineChart, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import {
  getProducts,
  getSellerBalance,
  getBuyerPurchaseHistory,
  getSellerPurchaseHistory,
  getAllCategories,
} from '@/services/blockchain'
import { ProductStruct, PurchaseHistoryStruct, CategoryStruct } from '@/utils/type.dt'
import { Loader2 } from 'lucide-react'

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    balance: 0,
    activeProducts: 0,
    soldOutProducts: 0,
    averagePrice: 0,
    totalCategories: 0
  })
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        setLoading(true)
        const [products, categories, balance, purchases] = await Promise.all([
          getProducts(),
          getAllCategories(),
          getSellerBalance('YOUR_ADDRESS'),
          getSellerPurchaseHistory('YOUR_ADDRESS')
        ])

        // Calculate metrics
        const activeProducts = products.filter(p => !p.soldout && !p.deleted).length
        const soldOutProducts = products.filter(p => p.soldout).length
        const totalRevenue = purchases.reduce((sum, p) => sum + p.totalAmount, 0)
        const averagePrice = products.reduce((sum, p) => sum + Number(p.price), 0) / products.length

        // Process category data
        const categoryStats = processCategoryData(products, categories)
        
        // Process monthly data
        const monthlyStats = processMonthlyData(purchases)

        setMetrics({
          totalProducts: products.length,
          totalRevenue,
          totalTransactions: purchases.length,
          balance,
          activeProducts,
          soldOutProducts,
          averagePrice,
          totalCategories: categories.length
        })
        setMonthlyData(monthlyStats as never[])
        setCategoryData(categoryStats as never[])
      } catch (error) {
        console.error('Error fetching blockchain data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlockchainData()
  }, [])

  const processCategoryData = (products: ProductStruct[], categories: CategoryStruct[]) => {
    const categoryCount: Record<string, number> = {}
    products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1
    })

    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    }))
  }

  const processMonthlyData = (purchases: PurchaseHistoryStruct[]) => {
    const monthly: Record<string, { month: string, transactions: number, revenue: number, avgOrderValue: number }> = {}
    purchases.forEach(purchase => {
      const date = new Date(purchase.timestamp * 1000)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      
      if (!monthly[monthKey]) {
        monthly[monthKey] = {
          month: date.toLocaleString('default', { month: 'short' }),
          transactions: 0,
          revenue: 0,
          avgOrderValue: 0
        }
      }
      
      monthly[monthKey].transactions++
      monthly[monthKey].revenue += purchase.totalAmount
      monthly[monthKey].avgOrderValue = monthly[monthKey].revenue / monthly[monthKey].transactions
    })

    return Object.values(monthly)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Marketplace Analytics</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold">{metrics.totalProducts}</p>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>Active: {metrics.activeProducts}</span>
            <span>Sold Out: {metrics.soldOutProducts}</span>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold">{metrics.totalRevenue.toFixed(4)} ETH</p>
          <p className="text-sm text-gray-600 mt-2">
            Avg. Price: {metrics.averagePrice.toFixed(4)} ETH
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
          <p className="text-2xl font-bold">{metrics.totalTransactions}</p>
          <p className="text-sm text-gray-600 mt-2">
            Categories: {metrics.totalCategories}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
          <p className="text-2xl font-bold">{metrics.balance.toFixed(4)} ETH</p>
          <p className="text-sm text-gray-600 mt-2">Available to withdraw</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Monthly Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="transactions" 
                stroke="#8884d8" 
                name="Transactions"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgOrderValue" 
                stroke="#82ca9d" 
                name="Avg Order Value (ETH)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (ETH)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

export default withAdminLayout(AnalyticsPage)

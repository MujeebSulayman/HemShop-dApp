import React, { useEffect, useState } from 'react'
import withUserLayout from '@/components/hoc/withUserLayout'
import { getMyProducts, getSellerBalance, getBuyerPurchaseHistory } from '@/services/blockchain'
import { ProductStruct, PurchaseHistoryStruct } from '@/utils/type.dt'
import { ethers } from 'ethers'

const UserDashboard = () => {
  const [stats, setStats] = useState({
    balance: 0,
    totalProducts: 0,
    pendingOrders: 0,
    totalSales: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get seller's ethereum address
        const ethereum = (window as any).ethereum
        const address = ethereum.selectedAddress

        // Fetch data in parallel
        const [products, balance, purchaseHistory] = await Promise.all([
          getMyProducts(),
          getSellerBalance(address),
          getBuyerPurchaseHistory(address)
        ])

        // Calculate pending orders (not delivered)
        const pendingOrders = purchaseHistory.filter(order => !order.isDelivered).length

        // Calculate total sales
        const totalSales = purchaseHistory.reduce((acc, order) => acc + order.totalAmount, 0)

        setStats({
          balance: balance,
          totalProducts: products.length,
          pendingOrders,
          totalSales,
        })
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <div className="text-white">Loading dashboard data...</div>
  }

  const statCards = [
    { label: 'Available Balance', value: `${stats.balance.toFixed()} ETH`, change: null as string | null },
    { label: 'Active Products', value: stats.totalProducts.toString(), change: null as string | null },
    { label: 'Pending Orders', value: stats.pendingOrders.toString(), change: null as string | null },
    { label: 'Total Sales', value: `${stats.totalSales.toFixed()} ETH`, change: null as string | null },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">{stat.label}</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-2xl font-semibold text-white">{stat.value}</div>
              {stat.change && (
                <div className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default withUserLayout(UserDashboard)

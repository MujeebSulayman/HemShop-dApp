import React from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'
import { Card } from '@/components/ui/card'
import { 
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer 
} from 'recharts'

// Mock data - replace with real data from your API
const monthlyData = [
  { month: 'Jan', users: 400, revenue: 2400 },
  { month: 'Feb', users: 300, revenue: 1398 },
  { month: 'Mar', users: 500, revenue: 9800 },
  // ... more data
]

const AnalyticsPage = () => {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold">12,345</p>
          <span className="text-green-500 text-sm">↑ 12% from last month</span>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="text-2xl font-bold">8,892</p>
          <span className="text-green-500 text-sm">↑ 8% from last month</span>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
          <p className="text-2xl font-bold">$45,678</p>
          <span className="text-green-500 text-sm">↑ 15% from last month</span>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-2xl font-bold">2.4%</p>
          <span className="text-red-500 text-sm">↓ 1% from last month</span>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Top Pages</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>/home</span>
              <span>45%</span>
            </div>
            <div className="flex justify-between">
              <span>/products</span>
              <span>30%</span>
            </div>
            <div className="flex justify-between">
              <span>/blog</span>
              <span>25%</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">User Demographics</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>North America</span>
              <span>40%</span>
            </div>
            <div className="flex justify-between">
              <span>Europe</span>
              <span>35%</span>
            </div>
            <div className="flex justify-between">
              <span>Asia</span>
              <span>25%</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Device Usage</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Mobile</span>
              <span>55%</span>
            </div>
            <div className="flex justify-between">
              <span>Desktop</span>
              <span>35%</span>
            </div>
            <div className="flex justify-between">
              <span>Tablet</span>
              <span>10%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default withAdminLayout(AnalyticsPage)

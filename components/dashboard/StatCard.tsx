import { ArrowUp } from "lucide-react"

import { ArrowDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend: number
}

const StatCard = ({ title, value, icon, trend }: StatCardProps) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400">{title}</p>
          <h3 className="text-2xl font-semibold text-white mt-1">{value}</h3>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className={`flex items-center mt-4 text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        <span className="ml-1">{Math.abs(trend)}%</span>
      </div>
    </div>
  )
}

export default StatCard     
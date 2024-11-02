import React from 'react'
import withAdminLayout from '@/components/hoc/withAdminLayout'

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
    </div>
  )
}

export default withAdminLayout(AnalyticsPage)

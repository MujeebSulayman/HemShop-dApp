import withAdminLayout from '@/components/hoc/withAdminLayout'
import React from 'react'

const AdminUsersPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">Users Management</h1>
      <div className="bg-white rounded-lg shadow p-6">{/* Add your users content here */}</div>
    </div>
  )
}

export default withAdminLayout(AdminUsersPage)

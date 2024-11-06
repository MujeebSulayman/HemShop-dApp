import React from 'react'
import UserDashboardLayout from '../layouts/UserDashboardLayout'

const withUserLayout = (WrappedComponent: React.ComponentType<any>) => {
  return function WithUserLayout(props: any) {
    return (
      <UserDashboardLayout>
        <WrappedComponent {...props} />
      </UserDashboardLayout>
    )
  }
}

export default withUserLayout 
import React from 'react'
import SellerDashboardLayout from '../layouts/SellerDashboardLayout'

const withSellerLayout = (Component: React.ComponentType<any>) => {
  return function WrappedComponent(props: any) {
    return (
      <SellerDashboardLayout>
        <Component {...props} />
      </SellerDashboardLayout>
    )
  }
}

export default withSellerLayout 
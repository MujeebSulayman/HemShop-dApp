import React from 'react'
import BuyerDashboardLayout from '../layouts/BuyerDashboardLayout'

const withBuyerLayout = (Component: React.ComponentType<any>) => {
  return function WrappedComponent(props: any) {
    return (
      <BuyerDashboardLayout>
        <Component {...props} />
      </BuyerDashboardLayout>
    )
  }
}

export default withBuyerLayout 
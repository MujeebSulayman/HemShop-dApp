import withUserLayout from '@/components/hoc/withUserLayout'
import React from 'react'

const Product = ({ id }: { id: string }) => {
  return (
    <div>
      <h1>Product {id}</h1>
    </div>
  )
}

export default withUserLayout(Product)

import React from 'react'
import { useRouter } from 'next/router'

const EditProduct = () => {
  const router = useRouter()
  const { id } = router.query

  return (
    <div>
      <h1>Edit Product {id}</h1>
      {/* Add your edit form here */}
    </div>
  )
}

export default EditProduct

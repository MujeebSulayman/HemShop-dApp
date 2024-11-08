import withUserLayout from '@/components/hoc/withUserLayout'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { OrderActions } from '@/components/orders/OrderActions'
import { getSellerPurchaseHistory } from '@/services/blockchain'
import { PurchaseHistoryStruct } from '@/utils/type.dt'

const SellerOrders = () => {
  const { address } = useAccount()
  const [orders, setOrders] = useState<PurchaseHistoryStruct[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    if (!address) return
    try {
      setLoading(true)
      const data = await getSellerPurchaseHistory(address)
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      fetchOrders()
    }
  }, [address])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          {/* Table headers */}
          <tbody>
            {orders.map((order) => (
              <tr key={`${order.productId}-${order.timestamp}`}>
                {/* Order details columns */}
                <td className="px-6 py-4">
                  <OrderActions
                    productId={order.productId}
                    buyerAddress={order.buyer}
                    isDelivered={order.isDelivered}
                    onSuccess={fetchOrders}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default withUserLayout(SellerOrders)

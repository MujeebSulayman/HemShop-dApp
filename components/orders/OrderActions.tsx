import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'
import { markOrderDelivered } from '@/services/blockchain'

interface OrderActionsProps {
  productId: number
  buyerAddress: string
  isDelivered: boolean
  onSuccess?: () => void
}

export const OrderActions: React.FC<OrderActionsProps> = ({
  productId,
  buyerAddress,
  isDelivered,
  onSuccess
}) => {
  const [updating, setUpdating] = useState(false)

  const handleMarkDelivered = async () => {
    try {
      setUpdating(true)
      await markOrderDelivered(productId, buyerAddress)
      toast.success('Order marked as delivered')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <button
      onClick={handleMarkDelivered}
      disabled={updating || isDelivered}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${isDelivered 
          ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
          : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
        }`}
    >
      {updating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isDelivered ? (
        'Delivered'
      ) : (
        'Mark as Delivered'
      )}
    </button>
  )
} 
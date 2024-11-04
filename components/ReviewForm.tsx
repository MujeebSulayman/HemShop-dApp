import React, { useState, FormEvent } from 'react'
import { FiStar } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { createReview } from '@/services/blockchain'
import { useAccount } from 'wagmi'

interface ReviewFormProps {
  productId: number
  productOwner: string
  onReviewSubmitted: () => void
}

const ReviewForm = ({ productId, productOwner, onReviewSubmitted }: ReviewFormProps) => {
  const { address } = useAccount()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      toast.error('Please connect your wallet to submit a review')
      return
    }

    if (address?.toLowerCase() === productOwner.toLowerCase()) {
      toast.error("You cannot review your own product")
      return
    }

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      setIsSubmitting(true)
      await createReview(productId, rating, comment)
      toast.success('Review submitted successfully')
      setRating(0)
      setComment('')
      onReviewSubmitted()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <FiStar
                className={`w-6 h-6 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
          Your Review
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700
            focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
            text-white placeholder-gray-400"
          placeholder="Share your thoughts about this product..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 
          disabled:bg-gray-600 disabled:cursor-not-allowed
          rounded-xl text-white font-medium transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}

export default ReviewForm

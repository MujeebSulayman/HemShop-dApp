interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info'
  message: string
  onClose?: () => void
  className?: string
}

export const Alert = ({ type, message, onClose, className = '' }: AlertProps) => {
  const colors = {
    error: 'bg-red-100 text-red-800 border-red-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <div className={`rounded-lg border p-4 ${colors[type]} ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">{message}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
} 
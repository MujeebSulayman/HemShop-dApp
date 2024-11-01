import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
import { SidebarNav } from '@/components/dashboard/SidebarNav'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { address } = useAccount()
  const router = useRouter()
  const [userRole, setUserRole] = useState<'admin' | 'seller' | 'buyer' | null>(null)

  useEffect(() => {
    if (!address) {
      router.push('/')
      return
    }

    // TODO: Replace this with your actual role checking logic
    // This is just a placeholder example
    const checkUserRole = async () => {
      // Temporary role assignment for testing - replace with your actual logic
      const path = router.pathname
      if (path.includes('/admin')) {
        setUserRole('admin')
      } else if (path.includes('/seller')) {
        setUserRole('seller')
      } else {
        setUserRole('buyer')
      }
    }

    checkUserRole()
  }, [address, router])

  if (!address || !userRole) {
    return null
  }

  return (
    <div className="min-h-screen pt-16 bg-black/95">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <SidebarNav userRole={userRole} />
          <main className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout 
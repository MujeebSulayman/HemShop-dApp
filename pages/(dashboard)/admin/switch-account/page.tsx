import React from 'react'

const AdminSwitchAccountPage = () => {
  return (
    <div>
      <h1>Switch Account</h1>
      <div className="grid gap-4">
        <div>
          <h2>Switch to Seller Account</h2>
          <div>
            {/* Seller account switching form/interface */}
            <select>
              <option value="">Select Seller Account</option>
            </select>
          </div>
        </div>

        <div>
          <h2>Switch to Buyer Account</h2>
          <div>
            {/* Buyer account switching form/interface */}
            <select>
              <option value="">Select Buyer Account</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSwitchAccountPage

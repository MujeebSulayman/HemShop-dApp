import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import React from 'react'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'

const ConnectBtn: React.FC<{ networks?: boolean }> = ({ networks }) => {
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  const buttonClasses = `
    bg-gray-800 hover:bg-gray-700 text-white
    py-2 px-4 rounded-md
    transition duration-300 ease-in-out
    text-sm font-medium
  `

  const handleConnect = async (openConnectModal: () => void) => {
    await openConnectModal()
    await signIn('credentials', { redirect: false })
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <motion.button
                    className={buttonClasses}
                    onClick={() => handleConnect(openConnectModal)}
                    type="button"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Connect Wallet
                  </motion.button>
                )
              }

              if (chain.unsupported && networks) {
                return (
                  <motion.button
                    className="bg-red-600 hover:bg-red-700 text-white
                        py-2 px-4 rounded-md
                        transition duration-300 ease-in-out
                        text-sm font-medium"
                    onClick={openChainModal}
                    type="button"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Wrong network
                  </motion.button>
                )
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  {networks && (
                    <motion.button
                      onClick={openChainModal}
                      style={{ display: 'flex', alignItems: 'center' }}
                      className={buttonClasses}
                      type="button"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <Image
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              width="12"
                              height="12"
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </motion.button>
                  )}

                  <motion.button
                    className={buttonClasses}
                    onClick={openAccountModal}
                    type="button"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {account.displayName}
                  </motion.button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default ConnectBtn

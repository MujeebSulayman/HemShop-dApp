const { ethers } = require('hardhat')
const fs = require('fs')

async function deployContract(contractName, ...args) {
  let contract
  try {
    const ContractFactory = await ethers.getContractFactory(contractName)
    
    const bytecodeSize = (ContractFactory.bytecode.length - 2) / 2
    console.log(`${contractName} bytecode size: ${bytecodeSize} bytes`)
    if (bytecodeSize > 24576) {
      console.log(`⚠️  Warning: ${contractName} size (${bytecodeSize} bytes) exceeds the limit of 24576 bytes`)
    }

    console.log(`Deploying ${contractName} contract...`)
    contract = await ContractFactory.deploy(...args)
    
    await contract.waitForDeployment()
    const deployedAddress = await contract.getAddress()

    const deployedCode = await ethers.provider.getCode(deployedAddress)
    if (deployedCode === '0x') {
      throw new Error(`${contractName} deployment failed - no code at address`)
    }

    console.log(`${contractName} deployed to: ${deployedAddress}`)
    return contract
  } catch (error) {
    console.error(`Error deploying ${contractName}:`, error)
    throw error
  }
}

async function saveContractAddresses(addresses) {
  try {
    fs.writeFileSync(
      './contracts/contractAddress.json',
      JSON.stringify(addresses, null, 2)
    )
    console.log('Contract addresses saved:', addresses)
  } catch (error) {
    console.error('Error saving contract addresses:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('Starting deployment process...')
    
    const hemShop = await deployContract('HemShop', 5)

    const addresses = {
      hemShop: await hemShop.getAddress()
    }

    await saveContractAddresses(addresses)
    console.log('Deployment completed successfully')
  } catch (error) {
    console.error('Deployment failed:', error)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exitCode = 1
})

const { ethers } = require('hardhat')
const fs = require('fs')

async function deployContract() {
  let contract
  const servicePct = 5

  try {
    const HemShopFactory = await ethers.getContractFactory("HemShop")
    console.log('Deploying HemShop contract...')

    contract = await HemShopFactory.deploy(servicePct)
    
    await contract.waitForDeployment()
    const deployedAddress = await contract.getAddress()

    const deployedCode = await ethers.provider.getCode(deployedAddress)
    if (deployedCode === '0x') {
      throw new Error('Contract deployment failed - no code at address')
    }

    console.log(`HemShop deployed to: ${deployedAddress}`)
    return contract
  } catch (error) {
    console.error('Error deploying contract:', error)
    throw error
  }
}

async function saveContractAddress(contract) {
  try {
    const deployedAddress = await contract.getAddress()
    const addressData = {
      hemShopContract: deployedAddress
    }

    fs.writeFileSync(
      './contracts/contractAddress.json',
      JSON.stringify(addressData, null, 2)
    )
    console.log('Contract address saved:', deployedAddress)
  } catch (error) {
    console.error('Error saving contract address:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('Starting deployment process...')
    const contract = await deployContract()
    await saveContractAddress(contract)
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

require('dotenv').config()
const { ethers } = require('hardhat')

async function main() {
  console.log('Starting deployment process...')

  try {
    const [deployer] = await ethers.getSigners()
    console.log('Deploying contracts with the account:', deployer.address)

    console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString())

    const HemShop = await ethers.getContractFactory('HemShop')
    console.log('Deploying HemShop...')

    const deploymentOptions = {
      gasLimit: 30000000,
    }

    const hemShop = await HemShop.deploy(5, deploymentOptions)
    
    console.log('Waiting for deployment...')
    await hemShop.waitForDeployment()
    
    const hemShopAddress = await hemShop.getAddress()
    console.log('HemShop deployed to:', hemShopAddress)

    // Save the contract address
    const fs = require('fs')
    const contractsDir = __dirname + '/../contracts'

    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir)
    }

    fs.writeFileSync(
      contractsDir + '/contractAddress.json',
      JSON.stringify({ HemShop: hemShopAddress }, undefined, 2)
    )

    console.log('Contract address saved to contractAddress.json')
  } catch (error) {
    console.error('Deployment failed!')
    console.error('Error details:', error.message)
    throw error
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

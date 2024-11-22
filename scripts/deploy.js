require('dotenv').config()
const { ethers } = require('hardhat')

async function main() {
  console.log('Deploying Nftmart to Sepolia...')

  try {
    const [deployer] = await ethers.getSigners()
    console.log('Deploying contracts with the account:', deployer.address)

    console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString())

    const HemShop = await ethers.getContractFactory('HemShop')
    console.log('Deploying HemShop...')

    const hemShop = await HemShop.deploy(5)
    await hemShop.deployed()
    console.log('HemShop deployed at:', hemShop.address)

    const fs = require('fs')
    const contractsDir = __dirname + '/../contracts'

    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir)
    }

    fs.writeFileSync(
      contractsDir + '/contractAddress.json',
      JSON.stringify({ HemShop: hemShop.address }, undefined, 2)
    )

    console.log('Contract address saved to contractAddress.json')
    await hemShop.deployTransaction.wait(6)
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

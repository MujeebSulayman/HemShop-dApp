require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      gas: 12000000,
      blockGasLimit: 12000000,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
     
    },
    sepolia: {
      url: process.env.NEXT_PUBLIC_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      viaIR: true,
      evmVersion: 'paris',
      metadata: {
        bytecodeHash: 'none',
      },
    },
  },
  mocha: {
    timeout: 100000,
  },
}

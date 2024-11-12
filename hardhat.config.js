require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  defaultNetwork: 'sepolia',
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      gas: 12000000,
      blockGasLimit: 12000000,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      allowUnlimitedContractSize: true,
      gas: 12000000,
      blockGasLimit: 12000000,
    },
    sepolia: {
      url: process.env.NEXT_PUBLIC_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      gas: 12000000,
      blockGasLimit: 12000000,
    },
  },
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      evmVersion: 'london',
      metadata: {
        bytecodeHash: 'none',
      },
    },
  },
  mocha: {
    timeout: 100000,
  },
}

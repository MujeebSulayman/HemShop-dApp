# HemShop - Decentralized E-commerce Platform

HemShop is a Web3-powered e-commerce platform that enables global commerce using cryptocurrency payments. Built with Next.js, TypeScript, and Ethereum smart contracts, it provides a secure and decentralized marketplace for buying and selling products.

![HemShop Platform](./public/screenshot.jpg)

## 🌟 Key Features

- **Decentralized Marketplace**: Powered by Ethereum smart contracts
- **Crypto Payments**: Buy and sell products using cryptocurrency
- **Global Access**: Shop from vendors worldwide
- **Product Management**: Create, update, and manage product listings
- **Review System**: Built-in product review and rating system
- **NFT Integration**: Product authenticity verification using NFTs
- **Secure Authentication**: Web3 authentication using Rainbow Kit and SIWE

## 🛠 Tech Stack

- **Frontend**:
  - Next.js 13
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Rainbow Kit
  - React-Toastify

- **Blockchain**:
  - Solidity
  - Hardhat
  - Ethers.js
  - OpenZeppelin
  - Wagmi

## 🚀 Getting Started

### Prerequisites

- Node.js 14+
- Yarn package manager
- MetaMask wallet

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```sh
NEXT_PUBLIC_RPC_URL=<YOUR_ALCHEMY_RPC_URL>
NEXT_PUBLIC_ALCHEMY_ID=<YOUR_ALCHEMY_PROJECT_ID>
NEXT_PUBLIC_PROJECT_ID=<WALLET_CONNECT_PROJECT_ID>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<YOUR_SECRET>
```

### Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/mujeebsulayman/hemshop.git
cd hemshop
```

2. Install dependencies:
```bash
yarn install
```

3. Start the local Hardhat network:
```bash
yarn blockchain
```

4. Deploy the smart contracts:
```bash
yarn deploy
```

5. Start the development server:
```bash
yarn dev
```

Visit `http://localhost:3000` to see the application.

## 🏗 Project Structure

- `/components`: Reusable React components
- `/contracts`: Solidity smart contracts
- `/pages`: Next.js pages and API routes
- `/services`: Blockchain interaction services
- `/styles`: Global styles and Tailwind configuration
- `/utils`: Helper functions and types

## 🔒 Smart Contract

The core smart contract `HemShop.sol` includes features for:

- Product management (create, update, delete)
- Sales processing
- Review system
- NFT minting for product authenticity
- Service fee management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for smart contract libraries
- Rainbow Kit for Web3 authentication
- The Ethereum community

## 📧 Contact

Message me on X - [@theHemjay](https://twitter.com/theHemjay)

Project Link: [https://github.com/MujeebSulayman/HemShop-dApp](https://github.com/MujeebSulayman/HemShop-dApp)
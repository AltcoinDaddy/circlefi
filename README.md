# CircleFi: Global Blockchain Savings Platform on Algorand

CircleFi is a decentralized collaborative savings platform that modernizes traditional rotating savings circles on the Algorand blockchain. The system enables users worldwide to create, join, and manage savings groups with automated contributions and distributions through smart contracts.

## 🌟 Project Overview

Traditional rotating savings and credit associations (ROSCAs) have been helping communities save and access capital for centuries. CircleFi brings this time-tested concept to the blockchain, enabling:

- **Global Participation**: Connect with savings circles worldwide
- **Transparent Operations**: All transactions are recorded on the Algorand blockchain
- **Automated Distributions**: Smart contracts handle contribution collection and payouts
- **Reputation Building**: Track contribution history and build financial reputation
- **Emergency Funds**: Built-in safety mechanisms for unexpected situations

## 🛠️ Technical Features

### Smart Contracts

- Written in PyTeal for the Algorand blockchain
- Core functions include:
  - `createCircle(params)`: Initialize new savings circle
  - `joinCircle(circleId)`: Add user to circle
  - `contribute(circleId, amount)`: Process contribution
  - `distribute(circleId)`: Execute payout to current recipient
  - `getCircleStatus(circleId)`: Return circle information
  - `getMemberStatus(circleId, address)`: Return member information

### Frontend

- Built with Next.js 14 (App Router), React, and TypeScript
- UI components from shadcn/ui library with Tailwind CSS
- Features include:
  - Wallet connection (Pera, MyAlgo) via WalletConnect v2
  - User dashboard showing circles, contribution schedule, and history
  - Circle creation wizard with customization options
  - Member invitation and management tools
  - Contribution and distribution tracking

### Security Considerations

- Time-locks for fund security
- Multi-signature requirements for critical operations
- Thorough input validation on all contract calls
- Circuit breakers for emergency situations
- Formal verification of contract logic

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python (v3.10 or later)
- Algorand wallet (Pera or MyAlgo)
- WalletConnect Project ID (get one from [WalletConnect Cloud](https://cloud.walletconnect.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/circlefi.git
   cd circlefi
   ```

2. Install JavaScript dependencies:
   ```bash
   npm install
   ```

3. Set up Python environment for smart contracts:
   ```bash
   python -m venv algorand-env
   
   # On Windows
   algorand-env\Scripts\activate
   
   # On macOS/Linux
   source algorand-env/bin/activate
   
   pip install pyteal py-algorand-sdk algokit
   ```

4. Create a `.env.local` file with your Algorand configuration:
   ```
   NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
   NEXT_PUBLIC_ALGOD_PORT=
   NEXT_PUBLIC_ALGOD_TOKEN=
   NEXT_PUBLIC_INDEXER_SERVER=https://testnet-idx.algonode.cloud
   NEXT_PUBLIC_INDEXER_PORT=
   NEXT_PUBLIC_INDEXER_TOKEN=
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_PROJECT_ID
   ```

5. Compile smart contracts:
   ```bash
   cd contracts
   python circle_contract.py
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Visit `http://localhost:3000` in your browser.

## 📱 Usage

1. **Connect Wallet**: Connect your Algorand wallet to get started
2. **Create a Circle**: Define parameters such as contribution amount, frequency, and member cap
3. **Invite Members**: Share your circle code with friends or family to join
4. **Make Contributions**: Contribute funds according to the circle schedule
5. **Receive Distributions**: Get your payout when it's your turn

## 🔄 Development Phases

1. **Core Infrastructure** (4 weeks)
   - Set up development environment with AlgoKit
   - Develop and test basic smart contracts
   - Create wallet connection functionality
   - Implement circle creation and management
   - Build contribution and distribution logic

2. **User Experience** (3 weeks)
   - Design and implement user dashboard
   - Create circle management interface
   - Develop notification system
   - Implement basic reputation tracking
   - Add transaction history visualization

3. **Enhancement & Security** (3 weeks)
   - Conduct smart contract security audit
   - Implement multi-currency support via ASAs
   - Create cultural templates for different saving styles
   - Add dispute resolution mechanisms
   - Build advanced reporting and analytics

4. **Testing & Deployment** (2 weeks)
   - Comprehensive testing on Algorand TestNet
   - User acceptance testing with diverse participants
   - Performance optimization
   - MainNet deployment
   - Documentation completion

## 📁 Project Structure

```
CircleFi/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication related routes
│   ├── api/                # API Routes
│   ├── circles/            # Circles routes
│   │   ├── [id]/           # Circle details page
│   │   ├── create/         # Create circle page
│   │   └── page.tsx        # List all circles
│   ├── dashboard/          # User dashboard
│   │   └── page.tsx
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ui/                 # shadcn components
│   ├── circles/            # Circle-related components
│   ├── dashboard/          # Dashboard components
│   ├── wallet/             # Wallet connection components
│   └── Header.tsx          # Header component
├── lib/                    # Utility functions
│   ├── algorand/           # Algorand-specific utilities
│   │   ├── client.ts       # Algorand client setup
│   │   └── types.ts        # Algorand-related TypeScript types
│   └── hooks/              # Custom React hooks
├── contracts/              # Algorand smart contracts
│   ├── circle_contract.py  # PyTeal circle contract
│   └── utils/              # Contract utility functions
├── public/                 # Static assets
├── .env.local              # Environment variables
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🧪 Testing

### Smart Contract Testing

Test smart contracts using AlgoKit's testing tools:

```bash
cd contracts
algokit test
```

### Frontend Testing

Run the frontend tests:

```bash
npm run test
```

## 🌐 Deployment

### TestNet Deployment

Deploy your smart contracts to Algorand TestNet:

```bash
cd contracts
python deploy_testnet.py
```

### MainNet Deployment

For production deployment, compile and deploy to Algorand MainNet:

```bash
cd contracts
python deploy_mainnet.py
```

## 🔍 Future Enhancements

- **Multi-language Support**: Add support for multiple languages
- **Mobile Application**: Develop a mobile app version
- **API Integrations**: Connect with external financial services
- **Advanced Analytics**: Implement detailed savings analytics and projections
- **DAO Governance**: Add decentralized autonomous organization features for circle governance

## 👥 Team

- [Your Name] - Project Lead & Full Stack Developer
- [Team Member 1] - Smart Contract Developer
- [Team Member 2] - Frontend Developer
- [Team Member 3] - UX/UI Designer

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Algorand Foundation for blockchain infrastructure
- Traditional ROSCA communities worldwide for the inspiration
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Next.js](https://nextjs.org/) team for the React framework
- [PyTeal](https://github.com/algorand/pyteal) developers for the smart contract language

## 📬 Contact

For questions or feedback, please reach out to [your-email@example.com](https://x.com/Altcoin_daddy) or create an issue in this repository.

---

Built with ❤️ for the global savings community

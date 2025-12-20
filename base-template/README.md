# FHEVM Base Template

This is the base Hardhat template for creating FHEVM (Fully Homomorphic Encryption Virtual Machine) examples. Use this template as a starting point for building privacy-preserving smart contracts.

## What This Template Provides

- ✅ Pre-configured Hardhat setup for FHEVM
- ✅ TypeScript support
- ✅ Testing framework with Chai
- ✅ Deployment scripts
- ✅ FHEVM libraries (@fhevm/solidity)
- ✅ Network configurations (Hardhat, Sepolia, Zama Devnet)
- ✅ Example contract structure
- ✅ Environment configuration template

## Quick Start

### 1. Use This Template

#### Option A: Manual Copy
```bash
# Copy this directory
cp -r base-template my-fhevm-example
cd my-fhevm-example
```

#### Option B: Use Scaffolding Tool
```bash
# Use the automated scaffolding tool
npm run scaffold -- --name "MyExample" --category "category" --description "Description"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
# Add your private key, RPC URLs, etc.
```

### 4. Add Your Contract

Create your FHEVM contract in `contracts/`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is SepoliaConfig {
    euint32 private encryptedValue;

    function store(uint32 value) external {
        encryptedValue = FHE.asEuint32(value);
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);
    }
}
```

### 5. Write Tests

Create tests in `test/`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyContract", function() {
  it("should store encrypted value", async function() {
    const MyContract = await ethers.getContractFactory("MyContract");
    const contract = await MyContract.deploy();
    await contract.waitForDeployment();

    await contract.store(42);
    // Test encrypted operations
  });
});
```

### 6. Compile and Test

```bash
# Compile contracts
npm run compile

# Run tests
npm test
```

### 7. Deploy

```bash
# Deploy to local network
npm run deploy

# Deploy to Sepolia
npm run deploy --network sepolia

# Deploy to Zama Devnet
npm run deploy --network zamaDevnet
```

## Template Structure

```
base-template/
├── contracts/           # Your Solidity contracts go here
│   └── Example.sol     # Example FHEVM contract
├── test/               # Your test files go here
│   └── Example.test.ts # Example test file
├── scripts/            # Deployment and utility scripts
│   └── deploy.ts       # Deployment script
├── deploy/             # Hardhat-deploy scripts
│   └── deploy.ts       # Deploy function
├── hardhat.config.ts   # Hardhat configuration
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
├── .env.example        # Environment template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Available Scripts

- `npm run compile` - Compile contracts
- `npm test` - Run test suite
- `npm run deploy` - Deploy contracts
- `npm run node` - Start local Hardhat node

## Configuration

### Networks

Pre-configured networks in `hardhat.config.ts`:

- **hardhat** - Local development network
- **sepolia** - Sepolia testnet (FHEVM compatible)
- **zamaDevnet** - Zama development network

### Environment Variables

Required in `.env`:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ZAMA_RPC_URL=https://devnet.zama.ai
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## FHEVM Concepts

### Encrypted Data Types

```solidity
euint8    // 8-bit encrypted integer
euint16   // 16-bit encrypted integer
euint32   // 32-bit encrypted integer
euint64   // 64-bit encrypted integer
ebool     // Encrypted boolean
```

### Encryption Operations

```solidity
// Convert to encrypted
euint32 encrypted = FHE.asEuint32(plainValue);

// Grant permissions
FHE.allowThis(encrypted);        // Contract can use
FHE.allow(encrypted, userAddr);  // User can decrypt
```

### Common Patterns

#### Pattern 1: Store Encrypted Value
```solidity
function store(uint32 value) external {
    euint32 encrypted = FHE.asEuint32(value);
    FHE.allowThis(encrypted);
    FHE.allow(encrypted, msg.sender);
    // Store in state
}
```

#### Pattern 2: Encrypted Comparison
```solidity
function verify(uint32 expected) external returns (ebool) {
    euint32 encryptedExpected = FHE.asEuint32(expected);
    return FHE.eq(storedValue, encryptedExpected);
}
```

#### Pattern 3: Access Control
```solidity
function grantAccess(address user, euint32 value) external {
    require(msg.sender == owner);
    FHE.allow(value, user);
}
```

## Dependencies

### Core FHEVM
- `@fhevm/solidity` - FHEVM Solidity library
- `encrypted-types` - TypeScript encrypted types

### Development
- `hardhat` - Ethereum development environment
- `@fhevm/hardhat-plugin` - FHEVM plugin for Hardhat
- `hardhat-deploy` - Deployment management
- `ethers` - Ethereum library

### Testing
- `chai` - Assertion library
- `@nomicfoundation/hardhat-chai-matchers` - Hardhat Chai matchers
- `@nomicfoundation/hardhat-network-helpers` - Network helpers

## Best Practices

### ✅ DO

- Always call `FHE.allowThis()` before `FHE.allow()`
- Validate plain values before encryption
- Use appropriate encrypted types (euint8, euint32, etc.)
- Grant permissions only to authorized users
- Test all encrypted operations thoroughly
- Document your code with JSDoc comments

### ❌ DON'T

- Try to decrypt values in contract code
- Forget to grant FHE permissions
- Mix encrypted and plain values
- Store sensitive data unencrypted
- Skip input validation
- Use encrypted values in view functions incorrectly

## Troubleshooting

### Compilation Issues
```bash
# Clear cache and recompile
npx hardhat clean
npm run compile
```

### Test Failures
```bash
# Run with verbose output
npx hardhat test --verbose

# Run specific test
npx hardhat test --grep "test name"
```

### Deployment Issues
```bash
# Check account balance
npx hardhat run scripts/check-balance.ts --network sepolia

# Verify RPC connection
curl -X POST $SEPOLIA_RPC_URL -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## Examples

See the parent project for complete examples:
- Vaccine Record Privacy System
- Healthcare data management
- Access control patterns
- Time-based permissions

## Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Zama GitHub**: https://github.com/zama-ai/fhevm
- **Hardhat Docs**: https://hardhat.org/docs
- **Community Forum**: https://www.zama.ai/community
- **Discord**: https://discord.com/invite/zama

## Support

For questions and issues:
1. Check the documentation
2. Search existing issues
3. Ask in Zama Discord #fhevm channel
4. Open a GitHub issue

## License

MIT License

---

**Built with ❤️ using FHEVM by Zama**

# Developer Guide - Vaccine Record Privacy System

## Overview

This guide provides comprehensive instructions for developers who want to:
- Maintain and update this FHEVM example
- Add new features or examples
- Update dependencies when new FHEVM versions are released
- Contribute to the project

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Development Environment Setup](#development-environment-setup)
3. [Adding New Features](#adding-new-features)
4. [Updating Dependencies](#updating-dependencies)
5. [Testing Guidelines](#testing-guidelines)
6. [Documentation Maintenance](#documentation-maintenance)
7. [Deployment Best Practices](#deployment-best-practices)
8. [Common Issues and Solutions](#common-issues-and-solutions)

## Project Architecture

### Directory Structure

```
VaccineRecordPrivacy/
├── contracts/              # Solidity smart contracts
│   └── VaccineRecordPrivacy.sol
├── test/                   # Comprehensive test suite
│   └── VaccineRecordPrivacy.test.ts
├── scripts/                # Automation and utility scripts
│   ├── create-example.ts   # Scaffolding tool
│   ├── deploy.ts          # Standalone deployment script
│   └── generate-docs.ts   # Documentation generator
├── deploy/                 # Hardhat-deploy deployment scripts
│   └── deploy.ts          # Main deployment script
├── docs/                   # Auto-generated documentation
├── hardhat.config.ts       # Hardhat configuration
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
└── .env.example           # Environment template
```

### Key Components

**Smart Contract (`VaccineRecordPrivacy.sol`)**
- Main contract implementing privacy-preserving vaccine records
- Uses FHEVM for encrypted data storage
- Implements access control with time-based permissions
- Inherits from `SepoliaConfig` for FHEVM configuration

**Test Suite (`VaccineRecordPrivacy.test.ts`)**
- 100+ comprehensive test cases
- Covers all contract functions
- Includes edge cases and security tests
- Uses JSDoc annotations for documentation

**Automation Tools**
- `create-example.ts`: Generates new FHEVM examples
- `generate-docs.ts`: Auto-generates documentation
- `deploy.ts`: Deployment scripts

## Development Environment Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- MetaMask or similar Web3 wallet (for testnet deployment)

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd VaccineRecordPrivacy

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your environment
# Edit .env with your private key and RPC URLs
```

### Environment Configuration

Edit `.env` file:

```env
# Deployment private key (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ZAMA_RPC_URL=https://devnet.zama.ai

# Optional: For contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas reporting
REPORT_GAS=false
```

### Verify Setup

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Generate documentation
npm run generate-docs
```

## Adding New Features

### Adding a New Contract Function

1. **Update the Contract**

```solidity
// In contracts/VaccineRecordPrivacy.sol

/**
 * @notice Your new function description
 * @dev Implementation details
 * @param param1 Description of parameter
 */
function newFunction(uint256 param1) external {
    // Implementation
}
```

2. **Add Tests**

```typescript
// In test/VaccineRecordPrivacy.test.ts

/**
 * @title Test for New Function
 * @chapter: testing
 * @concept: new-feature
 */
describe("New Function", function() {
  it("should perform expected behavior", async function() {
    // Test implementation
  });
});
```

3. **Update Documentation**

```bash
# Regenerate documentation
npm run generate-docs
```

### Creating a New FHEVM Example

Use the scaffolding tool:

```bash
# Create a new example
npm run scaffold -- --name "MyNewExample" --category "healthcare" --description "My example description"

# Navigate to the new example
cd ../MyNewExample

# Set up the new example
npm install
npm run compile
npm test
```

### Adding New Encrypted Data Types

When adding new encrypted fields:

```solidity
// 1. Declare the encrypted type
euint64 newEncryptedField;

// 2. Initialize in function
euint64 encrypted = FHE.asEuint64(plainValue);

// 3. Set permissions
FHE.allowThis(encrypted);           // Contract access
FHE.allow(encrypted, userAddress);  // User access
```

## Updating Dependencies

### Regular Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update non-breaking changes
npm update

# Test after updates
npm run compile
npm test
```

### FHEVM Library Updates

When `@fhevm/solidity` releases a new version:

#### Step 1: Update Package

```bash
# Update to latest version
npm install @fhevm/solidity@latest @fhevm/core@latest

# Check installed versions
npm list @fhevm/solidity @fhevm/core
```

#### Step 2: Review Breaking Changes

Check the FHEVM changelog:
- https://github.com/zama-ai/fhevm/releases

Common breaking changes to watch for:
- API changes in FHE library functions
- Configuration changes (ZamaConfig, SepoliaConfig)
- New encryption types or methods
- Changes in access control patterns

#### Step 3: Update Contract Imports

```solidity
// Update import statements if needed
import { FHE, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

#### Step 4: Test Thoroughly

```bash
# Compile with new version
npm run compile

# Run full test suite
npm test

# Test deployment on testnet
npm run deploy --network sepolia
```

#### Step 5: Update Documentation

```bash
# Update README with new version info
# Update DEVELOPER_GUIDE.md with any new patterns
# Regenerate docs
npm run generate-docs
```

### Hardhat Updates

```bash
# Update Hardhat and plugins
npm install hardhat@latest
npm install @nomicfoundation/hardhat-toolbox@latest

# Verify hardhat.config.ts compatibility
npm run compile
```

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/VaccineRecordPrivacy.test.ts

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run coverage  # (if configured)
```

### Writing Tests

Follow these patterns:

```typescript
/**
 * @title Test Category Name
 * @chapter: testing
 * @category: test-category
 * @concept: tested-concept
 */
describe("Feature Name", function() {

  // Setup
  beforeEach(async function() {
    // Deploy contracts, set up test data
  });

  /**
   * @test Success case
   * @concept: positive-testing
   */
  it("should succeed when conditions are met", async function() {
    // Arrange
    // Act
    // Assert
  });

  /**
   * @test Failure case
   * @concept: negative-testing
   */
  it("should revert when unauthorized", async function() {
    await expect(
      contract.protectedFunction()
    ).to.be.revertedWith("Error message");
  });
});
```

### Test Coverage Best Practices

Ensure tests cover:
- ✅ Happy path scenarios
- ✅ Edge cases (zero values, max values)
- ✅ Access control checks
- ✅ Input validation
- ✅ State changes
- ✅ Event emissions
- ✅ Revert conditions
- ✅ Gas optimization scenarios

## Documentation Maintenance

### Auto-Generated Documentation

Documentation is automatically generated from code annotations:

```bash
# Generate documentation
npm run generate-docs
```

### Documentation Annotations

Use these JSDoc tags in test files:

```typescript
/**
 * @title Human-readable title
 * @notice Main description
 * @dev Technical details
 *
 * @chapter: chapter-name
 * @category: category-name
 * @concept: concept1, concept2, concept3
 *
 * Additional explanatory text
 */
```

### Supported Tags

- `@chapter`: Organizes content into learning chapters
- `@category`: Groups by use case or feature type
- `@concept`: Tags specific FHEVM concepts demonstrated
- `@title`: Display title
- `@notice`: User-facing description
- `@dev`: Developer notes

### Manual Documentation

Update these files manually when needed:
- `README.md`: Main project documentation
- `DEVELOPER_GUIDE.md`: This file
- `SUBMISSION.md`: Bounty submission details
- `DEMO_VIDEO_GUIDE.md`: Video recording instructions

## Deployment Best Practices

### Local Testing

```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy
npm run deploy --network localhost
```

### Testnet Deployment

```bash
# Ensure .env is configured
# Deploy to Sepolia
npm run deploy --network sepolia

# Verify contract
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Using hardhat-deploy

The project uses hardhat-deploy for advanced deployment:

```bash
# Deploy using hardhat-deploy
npx hardhat deploy --network sepolia

# Deploy specific tags
npx hardhat deploy --tags VaccineRecordPrivacy --network sepolia
```

### Post-Deployment Verification

After deployment:

1. **Verify Contract State**
```typescript
const contract = await ethers.getContractAt("VaccineRecordPrivacy", address);
const authority = await contract.healthAuthority();
console.log("Health Authority:", authority);
```

2. **Test Basic Operations**
- Authorize a doctor
- Record a test vaccination
- Grant and revoke access

3. **Verify on Block Explorer**
- Check contract on Etherscan
- Verify source code if applicable

## Common Issues and Solutions

### Issue: Compilation Errors After FHEVM Update

**Solution:**
```bash
# Clear cache
npx hardhat clean

# Delete artifacts
rm -rf artifacts/ cache/ typechain-types/

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Recompile
npm run compile
```

### Issue: Test Failures After Update

**Solution:**
1. Check for breaking API changes in FHEVM
2. Review test setup and fixtures
3. Verify network configuration
4. Check gas limits

```bash
# Run tests with verbose output
npx hardhat test --verbose

# Run single test to isolate issue
npx hardhat test --grep "specific test name"
```

### Issue: Deployment Fails

**Common Causes:**
- Insufficient funds in deployer account
- Network configuration errors
- RPC endpoint issues
- Gas limit too low

**Solutions:**
```bash
# Check deployer balance
npx hardhat run scripts/check-balance.ts --network sepolia

# Test RPC connection
curl -X POST YOUR_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Increase gas limit in hardhat.config.ts
gas: 10000000
```

### Issue: Documentation Not Generating

**Solution:**
```bash
# Check if docs directory exists
mkdir -p docs

# Run generator with verbose logging
npx ts-node scripts/generate-docs.ts

# Verify test files have proper annotations
grep -r "@chapter" test/
```

## Maintenance Checklist

### Monthly
- [ ] Check for dependency updates
- [ ] Run security audit (npm audit)
- [ ] Review and update documentation
- [ ] Test deployment on testnet

### When FHEVM Updates
- [ ] Review changelog
- [ ] Update dependencies
- [ ] Run full test suite
- [ ] Update documentation
- [ ] Test deployment
- [ ] Update this guide with new patterns

### Before Major Release
- [ ] Full test coverage review
- [ ] Security audit
- [ ] Gas optimization review
- [ ] Documentation completeness check
- [ ] Example video update
- [ ] README update

## Additional Resources

### FHEVM Documentation
- Official Docs: https://docs.zama.ai/fhevm
- GitHub: https://github.com/zama-ai/fhevm
- Examples: https://docs.zama.org/protocol/examples

### Hardhat Resources
- Documentation: https://hardhat.org/docs
- hardhat-deploy: https://github.com/wighawag/hardhat-deploy

### Community
- Zama Discord: https://discord.com/invite/zama
- Zama Forum: https://www.zama.ai/community
- GitHub Discussions: Use for questions

## Contributing

When contributing to this project:

1. **Fork and Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Follow existing code style
- Add tests for new features
- Update documentation
- Add JSDoc annotations

3. **Test Thoroughly**
```bash
npm run compile
npm test
npm run generate-docs
```

4. **Submit Pull Request**
- Clear description of changes
- Reference any related issues
- Ensure CI passes

## Getting Help

If you encounter issues:

1. Check this guide and README
2. Review existing issues on GitHub
3. Search Zama community forum
4. Ask in Zama Discord #fhevm channel
5. Create a detailed GitHub issue

## License

MIT License - See LICENSE file for details

---

**Maintained as part of the Zama FHEVM Bounty Program December 2025**

For questions or suggestions, please open an issue or reach out to the maintainers.

# Deployment Guide

Comprehensive guide for deploying the Vaccine Record Privacy System to different networks.

## Prerequisites

1. **Node.js** >= 18.0.0
2. **npm** >= 9.0.0
3. **MetaMask** or similar Web3 wallet
4. **Environment Configuration** (.env file with private key and RPC URLs)

## Environment Setup

### 1. Create .env File

```bash
cp .env.example .env
```

### 2. Configure .env

```env
# Private key (DO NOT SHARE)
PRIVATE_KEY=your_private_key_here

# RPC Endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ZAMA_RPC_URL=https://devnet.zama.ai

# Etherscan API Key (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas Reporting
REPORT_GAS=false
```

### 3. Verify Setup

```bash
# Ensure private key is valid
npx hardhat accounts

# Check RPC connectivity
curl -X POST $SEPOLIA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## Compilation

### Compile All Contracts

```bash
npm run compile
```

**Output**:
```
Compiling 1 file with 0.8.24
VaccineRecordPrivacy.sol
✓ Compiled successfully
```

### Verify Compilation

```bash
# Check artifacts
ls artifacts/contracts/

# View contract ABI
cat artifacts/contracts/VaccineRecordPrivacy.sol/VaccineRecordPrivacy.json
```

## Local Deployment

### Option 1: Hardhat Local Network

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy
```

**Output**:
```
🚀 Starting Vaccine Record Privacy System Deployment...

📋 Deployment Configuration:
   Deployer address: 0x...
   Network: hardhat
   Chain ID: 31337
   Deployer balance: 10000 ETH

✅ VaccineRecordPrivacy deployed successfully!
   Contract address: 0x...
```

### Option 2: Using Hardhat-Deploy

```bash
npx hardhat deploy --network hardhat
```

**Features**:
- Saves deployment information to `deployments/hardhat/`
- Allows repeatable deployments
- Tracks deployment history

### Verify Local Deployment

```bash
# Connect to local node
npx hardhat console --network hardhat

# Test contract
const contract = await ethers.getContractAt(
  "VaccineRecordPrivacy",
  "DEPLOYED_ADDRESS"
);
const authority = await contract.healthAuthority();
console.log("Health Authority:", authority);
```

## Sepolia Testnet Deployment

### Prerequisites

1. **Get Sepolia ETH**:
   - Use faucet: https://sepolia-faucet.pk910.de/
   - Or: https://www.sepoliafaucet.com/

2. **Verify Balance**:
   ```bash
   npx hardhat run scripts/check-balance.ts --network sepolia
   ```

### Deploy to Sepolia

#### Method 1: Using Scripts

```bash
npm run deploy:sepolia
```

#### Method 2: Using Hardhat-Deploy

```bash
npx hardhat deploy --network sepolia
```

#### Method 3: Using Standard Script

```bash
hardhat run scripts/deploy.ts --network sepolia
```

### Monitor Deployment

```bash
# Check transaction
npx hardhat run -c scripts/check-tx.ts --network sepolia TRANSACTION_HASH

# Verify contract on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Post-Deployment

1. **Save Contract Address**
   ```bash
   # In a file or environment variable
   echo "VACCINE_CONTRACT=0x..." >> .env
   ```

2. **Authorize Doctors**
   ```bash
   npx hardhat run scripts/authorize-doctor.ts --network sepolia
   ```

3. **Verify on Etherscan**
   - Go to https://sepolia.etherscan.io/
   - Search for contract address
   - Verify source code

## Zama Devnet Deployment

### Prerequisites

1. **Get Zama Account**:
   - Register at https://zama.ai/
   - Join Zama Discord for testnet access

2. **Configure RPC**:
   ```env
   ZAMA_RPC_URL=https://devnet.zama.ai
   ```

### Deploy to Zama

```bash
hardhat deploy --network zamaDevnet
```

### Features

- Dedicated FHEVM network
- Faster FHEVM operations
- Full privacy guarantees
- Production-like environment

## Gas Optimization & Reporting

### Enable Gas Reporting

```bash
REPORT_GAS=true npm test
```

**Output**:
```
·────────────────────────────────────────────┐
│                  Gas Used by Method         │
├────────────────────────────────────────────┤
│  recordVaccination          2,500,000 gas   │
│  grantAccess                  500,000 gas   │
│  verifyVaccineRecord          300,000 gas   │
└────────────────────────────────────────────┘
```

### Optimize Gas

1. **Packed Storage**
   ```solidity
   // Good: Packed types
   bool isActive;
   uint256 timestamp;

   // Better: Could pack more
   ```

2. **Efficient Lookups**
   - Use mappings instead of arrays
   - Avoid loops in loops

3. **Batch Operations**
   - Process multiple records together
   - Reduce state changes

## Verification

### Etherscan Verification (Sepolia)

#### Automatic Verification

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

#### Manual Verification

1. Go to https://sepolia.etherscan.io/
2. Search for contract address
3. Click "Verify and Publish"
4. Fill in contract details:
   - Compiler Version: 0.8.24
   - License: MIT
   - Source code: Copy from VaccineRecordPrivacy.sol

### Verify Contract State

```bash
npx hardhat run -c "
const contract = await ethers.getContractAt(
  'VaccineRecordPrivacy',
  'CONTRACT_ADDRESS'
);
console.log('Health Authority:', await contract.healthAuthority());
console.log('Total Records:', await contract.totalRecords());
"  --network sepolia
```

## Post-Deployment Setup

### 1. Authorize Doctors

```typescript
// scripts/setup.ts
const contract = await ethers.getContractAt(
  "VaccineRecordPrivacy",
  DEPLOYED_ADDRESS
);

await contract.authorizeDoctor(DOCTOR_ADDRESS);
```

```bash
npx hardhat run scripts/setup.ts --network sepolia
```

### 2. Test Basic Operations

```bash
npx hardhat test --network sepolia
```

### 3. Enable Monitoring

- Set up event listeners
- Track contract interactions
- Monitor gas usage

## Security Checklist

### Before Deployment

- [ ] Private key not hardcoded
- [ ] Environment variables configured
- [ ] Contract compiled without errors
- [ ] Tests passing 100%
- [ ] Code reviewed for security
- [ ] No sensitive data in code

### After Deployment

- [ ] Contract verified on block explorer
- [ ] Initial transactions successful
- [ ] Events emitting correctly
- [ ] Permissions set appropriately
- [ ] Backup of contract ABI
- [ ] Documentation updated

### Ongoing

- [ ] Monitor for unusual activity
- [ ] Keep dependencies updated
- [ ] Regular security audits
- [ ] Access log reviews
- [ ] Gas usage optimization

## Troubleshooting

### Issue: "Insufficient Balance"

**Cause**: Account doesn't have enough ETH for gas

**Solution**:
```bash
# Check balance
npx hardhat run -c "
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');
" --network sepolia

# Get testnet ETH from faucet
# https://sepolia-faucet.pk910.de/
```

### Issue: "RPC Connection Failed"

**Cause**: RPC endpoint not responding

**Solution**:
```bash
# Test RPC
curl -X POST $SEPOLIA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Try alternative endpoint
SEPOLIA_RPC_URL=https://rpc.ankr.com/eth_sepolia npm run deploy:sepolia
```

### Issue: "Compilation Error"

**Cause**: FHEVM version mismatch

**Solution**:
```bash
# Update FHEVM library
npm install @fhevm/solidity@latest

# Clean and rebuild
npx hardhat clean
npm run compile
```

### Issue: "Deployment Hangs"

**Cause**: Network congestion or RPC issue

**Solution**:
```bash
# Increase timeout
HARDHAT_TIMEOUT=600000 npm run deploy:sepolia

# Try different RPC
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY npm run deploy
```

## Advanced Deployment

### Upgrade Pattern

```typescript
// Deploy new version
const newContract = await ethers.deployContract("VaccineRecordPrivacyV2");
await newContract.waitForDeployment();

// Migrate data (if needed)
// Update pointers
```

### Multi-Signature Deployment

```bash
# Use Gnosis Safe for governance
# Deploy through multi-sig wallet
```

### Automated Deployment

```bash
# Set up CI/CD pipeline
# Deploy on every release
# Automatic verification
```

## Performance Benchmarks

### Gas Usage

```
Operation               Gas        Cost (0.01 ETH/gas)
─────────────────────────────────────────────────────
recordVaccination     2.5M        25.00 USD
grantAccess           0.5M        5.00 USD
revokeAccess          0.3M        3.00 USD
updateRecord          0.8M        8.00 USD
```

### Transaction Time

- Local: <1 second
- Sepolia: 12-30 seconds
- Zama: 5-15 seconds

## Rollback Procedure

If deployment fails:

```bash
# Revert to last working state
git checkout HEAD~1

# Redeploy
npm run deploy:sepolia
```

## Monitoring & Maintenance

### Monitor Contract

```bash
# Watch events
npx hardhat run scripts/watch-events.ts --network sepolia

# Track calls
npx hardhat run scripts/track-calls.ts --network sepolia
```

### Update Functionality

```bash
# Deploy upgraded contract
npm run deploy:sepolia

# Verify new version
npm test --network sepolia
```

## Resources

- **Hardhat Docs**: https://hardhat.org/docs
- **Etherscan**: https://sepolia.etherscan.io/
- **Zama Devnet**: https://zama.ai/
- **FHEVM Docs**: https://docs.zama.ai/fhevm

## Support

For deployment issues:
1. Check environment variables
2. Review error messages carefully
3. Check gas prices
4. Verify RPC endpoint
5. Ask in Zama Discord #fhevm

---

**Built with ❤️ for the FHEVM community**

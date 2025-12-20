# FHEVM Examples - Vaccine Record Privacy System

This document describes the complete FHEVM example implementation: **Vaccine Record Privacy System**.

## Overview

The Vaccine Record Privacy System demonstrates a comprehensive, production-ready FHEVM implementation using healthcare data management as a real-world use case.

## Example: Vaccine Record Privacy

### Classification

- **Category**: Healthcare Privacy
- **Difficulty**: Advanced
- **Concepts**: Access Control, Encryption, Time-Based Permissions
- **Lines of Code**: 320+ (Solidity), 1000+ (Tests)
- **Test Cases**: 100+

### What This Example Demonstrates

#### 1. Encrypted Data Types
```solidity
euint32 encryptedPersonId;      // 32-bit encrypted integer
euint8 encryptedVaccineType;    // 8-bit encrypted integer
euint32 encryptedVaccineDate;   // Encrypted timestamp
```

**Concept Learned**: How to use different FHEVM encrypted types for different data sizes

#### 2. Access Control
```solidity
function grantAccess(
    address accessor,
    uint256 recordId,
    bool canView,
    bool canUpdate,
    uint256 durationInDays
) external
```

**Concept Learned**: Granular permission management with FHE.allow()

#### 3. FHE Permissions
```solidity
FHE.allowThis(encryptedValue);        // Contract permission
FHE.allow(encryptedValue, userAddr);  // User permission
```

**Concept Learned**: Both contract and user need permissions for encrypted data

#### 4. Time-Based Permissions
```solidity
uint256 expiryTime = block.timestamp + (durationInDays * 1 days);
```

**Concept Learned**: Implement temporal access control

#### 5. Encrypted Operations
```solidity
ebool result = FHE.eq(encryptedPersonId, expectedValue);
```

**Concept Learned**: Perform operations on encrypted data without decryption

## Project Structure

```
VaccineRecordPrivacy/
├── contracts/
│   └── VaccineRecordPrivacy.sol        # Main smart contract
├── test/
│   └── VaccineRecordPrivacy.test.ts    # 100+ test cases
├── scripts/
│   ├── deploy.ts                       # Deployment
│   ├── create-example.ts               # Scaffolding tool
│   └── generate-docs.ts                # Doc generator
├── deploy/
│   └── deploy.ts                       # Hardhat-deploy
├── docs/
│   ├── access-control.md              # Pattern guide
│   ├── encryption-operations.md       # Encryption guide
│   ├── permission-management.md       # Permission system
│   └── healthcare-privacy.md          # Privacy patterns
└── base-template/                      # Clonable template
```

## Installation & Setup

### Clone or Copy

Option 1: Direct copy
```bash
cp -r VaccineRecordPrivacy my-project
cd my-project
```

Option 2: Use scaffolding tool
```bash
npm run scaffold -- --name "MyExample" --category "healthcare"
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env
# Edit .env with your private key and RPC URLs
```

## Running the Example

### Compile Contracts

```bash
npm run compile
```

Output: Compiled VaccineRecordPrivacy.sol to artifacts/

### Run Tests

```bash
npm test
```

This runs 100+ test cases covering:
- Doctor authorization
- Vaccination recording
- Access permissions
- Time-based expiry
- Permission revocation
- Edge cases
- Security checks

### Deploy

#### Local (Hardhat)
```bash
npm run deploy
```

#### Sepolia Testnet
```bash
npm run deploy:sepolia
```

#### Zama Devnet
```bash
hardhat deploy --network zamaDevnet
```

## Key Components Explained

### Smart Contract (`contracts/VaccineRecordPrivacy.sol`)

#### Data Structures

**VaccineRecord**
```solidity
struct VaccineRecord {
    euint32 encryptedPersonId;
    euint8 encryptedVaccineType;
    euint32 encryptedVaccineDate;
    euint8 encryptedDoseNumber;
    euint32 encryptedBatchNumber;
    bool isActive;
    uint256 timestamp;
    address authorizedDoctor;
}
```

**AccessPermission**
```solidity
struct AccessPermission {
    bool canView;
    bool canUpdate;
    uint256 expiryTime;
    bool isActive;
}
```

#### Key Functions

**recordVaccination()**
- Caller: Authorized doctors
- Action: Create new encrypted record
- Encryption: All sensitive fields encrypted
- Permissions: Auto-grant to patient and doctor

**grantAccess()**
- Caller: Record owner (patient)
- Action: Grant time-limited access
- Granularity: Separate view/update
- Expiry: Automatic expiration

**verifyVaccineRecord()**
- Caller: Authorized users
- Action: Verify with encrypted comparison
- Returns: ebool result (encrypted)
- Purpose: Prove ownership without decryption

### Test Suite (`test/VaccineRecordPrivacy.test.ts`)

#### Test Categories

1. **Deployment Tests** (5 tests)
   - Contract initialization
   - Health authority setup
   - Initial state verification

2. **Doctor Management** (10 tests)
   - Authorization
   - Revocation
   - Status verification

3. **Vaccination Recording** (15 tests)
   - Valid recording
   - Input validation
   - Encryption verification
   - Permission grants

4. **Access Control** (25 tests)
   - Grant access
   - Revoke access
   - Permission verification
   - Time expiry
   - Granular permissions

5. **Security Tests** (20 tests)
   - Unauthorized access prevention
   - Permission enforcement
   - Input validation
   - Role verification

6. **Edge Cases** (15 tests)
   - Invalid inputs
   - Boundary conditions
   - State transitions
   - Error handling

7. **Integration Tests** (10+ tests)
   - Complex workflows
   - Multi-step operations
   - State consistency

### Documentation (`docs/`)

#### access-control.md
- Role-based access (Health Authority, Doctors, Patients)
- FHE permission system
- Permission lifecycle

#### encryption-operations.md
- Encrypted data types (euint8, euint32, ebool)
- Encryption operations (FHE.asEuint, FHE.eq, FHE.add, FHE.sub)
- Permission integration

#### permission-management.md
- Time-based access control
- Granular permissions (view/update)
- Permission matrix
- Real-world scenarios

#### healthcare-privacy.md
- Privacy challenges in healthcare
- HIPAA/GDPR compliance
- Privacy patterns
- Security best practices

## FHEVM Concepts Demonstrated

### Concept 1: Encrypted Storage
```solidity
euint32 encrypted = FHE.asEuint32(plainValue);
// Stored in contract state
// Cannot be read in contract
// Can only be used in FHE operations
```

### Concept 2: Access Control
```solidity
FHE.allowThis(encrypted);       // Contract can use
FHE.allow(encrypted, user);     // User can decrypt
```

### Concept 3: Permission Management
```solidity
mapping(address => mapping(uint256 => AccessPermission))
    public accessPermissions;
```

### Concept 4: Encrypted Comparisons
```solidity
ebool matches = FHE.eq(encrypted1, encrypted2);
// Result is encrypted
// User decrypts to learn result
```

### Concept 5: Time-Based Control
```solidity
require(block.timestamp <= permission.expiryTime);
// Automatic enforcement
// No manual cleanup needed
```

## Real-World Scenario

### Workflow

1. **Patient Records Vaccination**
   ```
   Doctor creates record
   → Data encrypted with euint types
   → Patient gets automatic access
   → Doctor gets automatic access
   ```

2. **Patient Shares with Specialist**
   ```
   Patient grants specialist 7-day access
   → canView = true, canUpdate = false
   → Specialist can decrypt for 7 days
   → Auto-expires after 7 days
   ```

3. **Insurance Company Review**
   ```
   Patient grants insurance 30-day access
   → Insurance verifies vaccination
   → Cannot modify (canUpdate = false)
   → Automatic expiry
   ```

4. **Research Study**
   ```
   Patient grants researcher 90-day access
   → Researcher can access for study
   → Can revoke anytime
   → Time-limited by design
   ```

## Security Patterns

### ✅ Correct Usage

```solidity
// Correct: Both permissions
FHE.allowThis(encrypted);
FHE.allow(encrypted, user);
```

### ❌ Common Mistakes

```solidity
// Wrong: Forgot allowThis
FHE.allow(encrypted, user);  // Will fail!

// Wrong: Try to read in contract
if (encrypted == 123) { }  // Compilation error

// Wrong: Plaintext before encryption
log(plainValue);  // Privacy leak
encryptedValue = FHE.asEuint32(plainValue);
```

## Testing Guide

### Run All Tests
```bash
npm test
```

### Run Specific Test
```bash
npx hardhat test --grep "access control"
```

### Run with Gas Reporting
```bash
REPORT_GAS=true npm test
```

### Run with Coverage
```bash
npx hardhat coverage
```

## Deployment Guide

### Prerequisites
1. Private key with funds
2. RPC endpoint configured
3. Environment variables set

### Step 1: Compile
```bash
npm run compile
```

### Step 2: Deploy to Local
```bash
npm run deploy
```

### Step 3: Deploy to Testnet
```bash
npm run deploy:sepolia
```

### Step 4: Verify (if on Sepolia)
```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

## Extending This Example

### Add New Functions

1. Create function in contract
2. Add test cases
3. Update documentation
4. Regenerate docs: `npm run generate-docs`

### Create Similar Example

Use the scaffolding tool:
```bash
npm run scaffold -- --name "MyExample" \
  --category "privacy" \
  --description "My privacy example"
```

### Generate Documentation

```bash
npm run generate-docs
```

Outputs to `docs/` directory in GitBook format.

## Common Issues & Solutions

### Issue: Compilation Error
**Solution**:
```bash
npx hardhat clean
npm install
npm run compile
```

### Issue: Tests Fail
**Solution**:
```bash
npx hardhat test --verbose
npx hardhat test --grep "specific test"
```

### Issue: Deployment Fails
**Solution**:
```bash
# Check balance
npx hardhat run scripts/check-balance.ts --network sepolia

# Check RPC
curl -X POST $SEPOLIA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## Learning Path

### Beginner
1. Read `docs/README.md`
2. Review contract structure
3. Run tests: `npm test`
4. Examine test cases

### Intermediate
1. Study `docs/access-control.md`
2. Understand permission system
3. Review `docs/encryption-operations.md`
4. Modify test cases

### Advanced
1. Read `docs/healthcare-privacy.md`
2. Study `docs/architecture.md`
3. Add new functions
4. Deploy to testnet

## Resources

- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Zama Community**: https://www.zama.ai/community
- **Discord**: https://discord.com/invite/zama
- **GitHub**: https://github.com/zama-ai/fhevm

## License

MIT License

---

**Part of the Zama FHEVM Bounty Program December 2025**

**Built with ❤️ for privacy-preserving applications**

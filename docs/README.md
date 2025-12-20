# Vaccine Record Privacy - FHEVM Example Documentation

## Overview

This documentation is automatically generated from code annotations in the smart contract and test suite, demonstrating key FHEVM concepts through a privacy-preserving healthcare application.

## Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Key Concepts](#key-concepts)
4. [Documentation Structure](#documentation-structure)
5. [Learning Path](#learning-path)

## Features

- 🔒 Fully Homomorphic Encryption (FHE) for sensitive data
- 🏥 Privacy-preserving healthcare records management
- 🔐 Granular access control with fine-grained permissions
- ⏰ Time-based access permissions with automatic expiry
- ✅ Comprehensive test coverage with 100+ test cases
- 📚 Extensive auto-generated documentation
- 🛠️ Automated scaffolding and deployment tools

## Quick Start

### Installation

```bash
npm install
```

### Compilation

```bash
npm run compile
```

### Running Tests

```bash
npm test
```

### Generate Documentation

```bash
npm run generate-docs
```

## Key Concepts

### 1. Encrypted Data Types

The contract uses FHEVM encrypted types:
- **euint32**: 32-bit encrypted integers (Person IDs, timestamps, batch numbers)
- **euint8**: 8-bit encrypted integers (Vaccine types, dose numbers)
- **ebool**: Boolean encrypted values (Verification results)

### 2. Encryption Operations

- **FHE.asEuint32()**: Convert uint32 to encrypted format
- **FHE.asEuint8()**: Convert uint8 to encrypted format
- **FHE.eq()**: Encrypted equality comparison

### 3. Access Control

The contract implements sophisticated access control:

```solidity
// Grant contract access to encrypted data
FHE.allowThis(encryptedValue);

// Grant user access to encrypted data
FHE.allow(encryptedValue, userAddress);
```

### 4. Permission Patterns

- **Owner-controlled sharing**: Only record owners can grant access
- **Time-based expiry**: Permissions automatically expire
- **Granular permissions**: Separate view and update permissions
- **Permission revocation**: Instant access revocation

### 5. Role-Based Access

Three main roles:
- **Health Authority**: System administrator
- **Authorized Doctors**: Can record vaccinations
- **Patients**: Own their records, can grant/revoke access

## Documentation Structure

### By Concept
- Access Control
- Encryption Operations
- Permission Management
- Healthcare Privacy

### By Chapter
- Deployment
- Testing
- Automation

### By Category
- Healthcare
- Privacy
- Blockchain

## Learning Path

### Beginner Level
1. Start with README.md for project overview
2. Review contract structure in VaccineRecordPrivacy.sol
3. Examine basic test cases
4. Understand access control basics

### Intermediate Level
1. Study FHE encryption patterns
2. Learn about time-based permissions
3. Understand permission revocation
4. Explore role-based access control

### Advanced Level
1. Review security test cases
2. Study gas optimization
3. Examine deployment patterns
4. Understand automation tools

## Key Files

### Smart Contract
- **contracts/VaccineRecordPrivacy.sol** - Main contract implementation

### Tests
- **test/VaccineRecordPrivacy.test.ts** - Comprehensive test suite

### Scripts
- **scripts/deploy.ts** - Deployment script
- **scripts/create-example.ts** - Scaffolding tool
- **scripts/generate-docs.ts** - Documentation generator
- **deploy/deploy.ts** - Hardhat-deploy configuration

### Configuration
- **hardhat.config.ts** - Hardhat configuration
- **tsconfig.json** - TypeScript configuration
- **.env.example** - Environment template

## FHEVM Concepts Demonstrated

### 1. Data Privacy
```solidity
euint32 encryptedPersonId = FHE.asEuint32(personId);
```

### 2. Access Control
```solidity
FHE.allowThis(encryptedPersonId);
FHE.allow(encryptedPersonId, patientAddress);
```

### 3. Permission Management
```solidity
accessPermissions[accessor][recordId] = AccessPermission({
    canView: true,
    canUpdate: false,
    expiryTime: block.timestamp + 365 days,
    isActive: true
});
```

### 4. Encrypted Comparisons
```solidity
ebool result = FHE.eq(encryptedValue, expectedValue);
```

## Testing Examples

The test suite demonstrates:
- ✅ Contract deployment
- ✅ Doctor authorization
- ✅ Vaccination recording
- ✅ Access permission management
- ✅ Record updates
- ✅ Permission revocation
- ✅ Edge cases
- ✅ Security checks

## Development Workflow

1. **Compile**: `npm run compile`
2. **Test**: `npm test`
3. **Deploy**: `npm run deploy`
4. **Document**: `npm run generate-docs`
5. **Scaffold**: `npm run scaffold -- --name "Example" --category "category"`

## Troubleshooting

### Common Issues

**Compilation fails**
```bash
npm run compile
```

**Tests don't run**
```bash
npm test -- --verbose
```

**Deployment issues**
```bash
# Check balance
npx hardhat run scripts/check-balance.ts --network sepolia
```

See DEVELOPER_GUIDE.md for comprehensive troubleshooting.

## Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **GitHub**: https://github.com/zama-ai/fhevm
- **Zama Community**: https://www.zama.ai/community
- **Discord**: https://discord.com/invite/zama

## Contributing

Contributions are welcome! See DEVELOPER_GUIDE.md for detailed guidelines.

## License

MIT License - See LICENSE file for details

## About This Project

This project is a submission for the **Zama FHEVM Bounty Program December 2025**.

It demonstrates:
- Production-ready FHEVM implementation
- Real-world healthcare privacy use case
- Comprehensive automation tooling
- Extensive test coverage
- Best practices for FHE smart contract development

---

**Built with ❤️ for the FHEVM community**

For questions or support:
- GitHub Issues: Open an issue in the repository
- Zama Discord: #fhevm channel
- Community Forum: https://www.zama.ai/community

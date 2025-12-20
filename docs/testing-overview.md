# Testing Overview

Comprehensive guide to the test suite for the Vaccine Record Privacy System.

## Test Suite Summary

- **Total Test Cases**: 100+
- **Test File**: `test/VaccineRecordPrivacy.test.ts`
- **Lines of Code**: 1000+
- **Coverage**: All contract functions
- **Framework**: Hardhat + Chai

## Test Structure

```typescript
describe("VaccineRecordPrivacy", function() {
  describe("Deployment", function() { ... });
  describe("Doctor Management", function() { ... });
  describe("Vaccination Recording", function() { ... });
  describe("Access Control", function() { ... });
  describe("Security", function() { ... });
  describe("Edge Cases", function() { ... });
});
```

## Test Categories

### 1. Deployment Tests (5 tests)

**Purpose**: Verify correct contract initialization

```typescript
it("should deploy with correct health authority", async function() {
  expect(await contract.healthAuthority()).to.equal(owner.address);
});

it("should initialize with zero records", async function() {
  expect(await contract.totalRecords()).to.equal(0);
});
```

**What's Tested**:
- Health authority assignment
- Initial state values
- Contract ownership

### 2. Doctor Management Tests (10 tests)

**Purpose**: Test doctor authorization system

```typescript
it("should authorize doctor", async function() {
  await contract.authorizeDoctor(doctor.address);
  expect(await contract.authorizedDoctors(doctor.address)).to.be.true;
});

it("should prevent unauthorized authorization", async function() {
  await expect(
    contract.connect(user).authorizeDoctor(doctor.address)
  ).to.be.revertedWith("Not authorized health authority");
});
```

**What's Tested**:
- Authorization functionality
- Revocation
- Access control enforcement
- Event emissions

### 3. Vaccination Recording Tests (15 tests)

**Purpose**: Test encrypted record creation

```typescript
it("should record vaccination with encryption", async function() {
  await contract.connect(doctor).recordVaccination(
    patient.address,
    12345,  // personId
    1,      // vaccineType
    1234567890, // vaccineDate
    1,      // doseNumber
    999     // batchNumber
  );

  const record = await contract.vaccineRecords(1);
  expect(record.isActive).to.be.true;
  expect(record.authorizedDoctor).to.equal(doctor.address);
});
```

**What's Tested**:
- Record creation
- Encryption operations
- Permission grants
- Input validation
- Event emissions
- State updates

### 4. Access Control Tests (25 tests)

**Purpose**: Test permission system

```typescript
it("should grant access with time limit", async function() {
  // Record vaccination
  await contract.connect(doctor).recordVaccination(...);

  // Grant access
  await contract.connect(patient).grantAccess(
    specialist.address,
    1,     // recordId
    true,  // canView
    false, // canUpdate
    30     // 30 days
  );

  // Verify permission
  const hasAccess = await contract.hasAccessPermission(
    specialist.address,
    1
  );
  expect(hasAccess).to.be.true;
});
```

**What's Tested**:
- Access granting
- Permission revocation
- Time-based expiry
- Granular permissions
- Owner verification
- FHE permission grants

### 5. Update Operations Tests (10 tests)

**Purpose**: Test record modification

```typescript
it("should allow doctor to update record", async function() {
  // Create record
  await contract.connect(doctor).recordVaccination(...);

  // Update
  await contract.connect(doctor).updateVaccineRecord(
    1,    // recordId
    2,    // new vaccine type
    0,    // keep date
    2,    // new dose number
    0     // keep batch number
  );

  // Verify update event
  expect(tx).to.emit(contract, "RecordUpdated");
});
```

**What's Tested**:
- Update authorization
- Selective field updates
- Re-encryption
- Permission preservation

### 6. Security Tests (20 tests)

**Purpose**: Test security controls

```typescript
it("should prevent unauthorized access", async function() {
  await expect(
    contract.connect(unauthorized).verifyVaccineRecord(1, 12345)
  ).to.be.revertedWith("No access permission");
});

it("should enforce permission expiry", async function() {
  // Grant 1-day access
  await contract.connect(patient).grantAccess(
    user.address, 1, true, false, 1
  );

  // Fast forward 2 days
  await time.increase(86400 * 2);

  // Verify access denied
  const hasAccess = await contract.hasAccessPermission(
    user.address, 1
  );
  expect(hasAccess).to.be.false;
});
```

**What's Tested**:
- Authorization checks
- Permission expiry
- Input validation
- Access denial
- Role verification

### 7. Edge Case Tests (15 tests)

**Purpose**: Test boundary conditions

```typescript
it("should handle zero address rejection", async function() {
  await expect(
    contract.connect(doctor).recordVaccination(
      ethers.constants.AddressZero,
      12345, 1, 1234567890, 1, 999
    )
  ).to.be.revertedWith("Invalid patient address");
});

it("should handle invalid vaccine type", async function() {
  await expect(
    contract.connect(doctor).recordVaccination(
      patient.address,
      12345, 99, 1234567890, 1, 999  // Invalid type
    )
  ).to.be.revertedWith("Invalid vaccine type");
});
```

**What's Tested**:
- Boundary values
- Invalid inputs
- Zero values
- Max values
- State transitions

### 8. Integration Tests (10+ tests)

**Purpose**: Test complex workflows

```typescript
it("should handle complete workflow", async function() {
  // 1. Authorize doctor
  await contract.authorizeDoctor(doctor.address);

  // 2. Record vaccination
  await contract.connect(doctor).recordVaccination(...);

  // 3. Grant access to specialist
  await contract.connect(patient).grantAccess(...);

  // 4. Specialist verifies
  const result = await contract.connect(specialist).verifyVaccineRecord(...);

  // 5. Revoke access
  await contract.connect(patient).revokeAccess(...);

  // 6. Verify access removed
  const hasAccess = await contract.hasAccessPermission(...);
  expect(hasAccess).to.be.false;
});
```

**What's Tested**:
- End-to-end workflows
- Multi-step operations
- State consistency
- Permission lifecycle

## Running Tests

### Run All Tests

```bash
npm test
```

**Output**:
```
VaccineRecordPrivacy
  Deployment
    ✓ should deploy with correct health authority
    ✓ should initialize with zero records
  Doctor Management
    ✓ should authorize doctor
    ✓ should prevent unauthorized authorization
  ...

100 passing (10s)
```

### Run Specific Category

```bash
npx hardhat test --grep "Access Control"
```

### Run with Gas Reporting

```bash
REPORT_GAS=true npm test
```

### Run with Coverage

```bash
npx hardhat coverage
```

## Testing Best Practices

### ✅ DO

1. **Test happy paths**
   ```typescript
   it("should succeed with valid inputs", async function() {
     // Test expected behavior
   });
   ```

2. **Test failure paths**
   ```typescript
   it("should revert with invalid inputs", async function() {
     await expect(operation()).to.be.revertedWith("Error");
   });
   ```

3. **Test permissions**
   ```typescript
   it("should enforce access control", async function() {
     await expect(
       contract.connect(unauthorized).protectedFunction()
     ).to.be.revertedWith("Not authorized");
   });
   ```

4. **Test events**
   ```typescript
   it("should emit event", async function() {
     await expect(operation())
       .to.emit(contract, "EventName")
       .withArgs(expectedArg1, expectedArg2);
   });
   ```

5. **Test state changes**
   ```typescript
   it("should update state correctly", async function() {
     await operation();
     expect(await contract.state()).to.equal(expectedState);
   });
   ```

### ❌ DON'T

1. **Don't skip error cases**
2. **Don't test multiple unrelated things**
3. **Don't rely on test order**
4. **Don't hardcode values**
5. **Don't skip setup/teardown**

## Test Utilities

### Time Manipulation

```typescript
import { time } from "@nomicfoundation/hardhat-network-helpers";

// Fast forward
await time.increase(86400); // 1 day

// Set specific time
await time.increaseTo(futureTimestamp);
```

### Account Management

```typescript
const [owner, doctor, patient, specialist] = await ethers.getSigners();
```

### Gas Reporting

```typescript
const tx = await contract.operation();
const receipt = await tx.wait();
console.log("Gas used:", receipt.gasUsed.toString());
```

## Coverage Report

Run coverage:
```bash
npx hardhat coverage
```

Expected coverage:
- Statements: >95%
- Branches: >90%
- Functions: 100%
- Lines: >95%

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run compile
      - run: npm test
```

## Related Documentation

- [Security Patterns](patterns.md)
- [Architecture](architecture.md)
- [Deployment Guide](deployment-guide.md)

---

**Comprehensive testing ensures contract reliability and security**

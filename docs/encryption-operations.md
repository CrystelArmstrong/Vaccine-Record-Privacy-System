# Encryption Operations

## Overview

This document covers FHEVM encryption operations used in the Vaccine Record Privacy contract.

## Encrypted Data Types

### euint32 (32-bit Encrypted Integer)

Used for:
- Person IDs
- Vaccine dates (timestamps)
- Batch numbers
- Any 32-bit identifier or timestamp

```solidity
euint32 encryptedPersonId = FHE.asEuint32(personId);
euint32 encryptedBatchNumber = FHE.asEuint32(batchNumber);
```

### euint8 (8-bit Encrypted Integer)

Used for:
- Vaccine types (1-10)
- Dose numbers (1-5)
- Status flags

```solidity
euint8 encryptedVaccineType = FHE.asEuint8(vaccineType);
euint8 encryptedDoseNumber = FHE.asEuint8(doseNumber);
```

### ebool (Encrypted Boolean)

Used for:
- Verification results
- Status checks
- Boolean comparisons

```solidity
ebool result = FHE.eq(encryptedValue, expectedValue);
```

## Encryption Operations

### 1. Converting to Encrypted Format

```solidity
// Convert uint32 to encrypted
euint32 encrypted32 = FHE.asEuint32(plainValue);

// Convert uint8 to encrypted
euint8 encrypted8 = FHE.asEuint8(plainValue);
```

**Key Points:**
- One-way operation (cannot decrypt in contract)
- Value is encrypted immediately
- Type safety guaranteed

### 2. Encrypted Comparisons

```solidity
// Encrypted equality check
ebool isEqual = FHE.eq(encryptedValue, expectedValue);

// Result is still encrypted
// Cannot use in if statements directly
```

### 3. Encrypted Arithmetic

```solidity
// Encrypted addition
euint32 sum = FHE.add(encrypted1, encrypted2);

// Encrypted subtraction
euint32 difference = FHE.sub(encrypted1, encrypted2);
```

## Permission System Integration

### Critical: FHE Permissions

```solidity
// Step 1: Create encrypted value
euint32 encrypted = FHE.asEuint32(value);

// Step 2: Grant contract permission
FHE.allowThis(encrypted);

// Step 3: Grant user permission
FHE.allow(encrypted, userAddress);
```

**Why Both Permissions?**
- `FHE.allowThis()`: Allows contract to operate on encrypted value
- `FHE.allow()`: Allows user to decrypt the value

## Implementation in Vaccine Contract

### Recording Vaccination

```solidity
function recordVaccination(
    address patient,
    uint32 personId,
    uint8 vaccineType,
    uint32 vaccineDate,
    uint8 doseNumber,
    uint32 batchNumber
) external onlyAuthorizedDoctor {
    // Encrypt all sensitive data
    euint32 encryptedPersonId = FHE.asEuint32(personId);
    euint8 encryptedVaccineType = FHE.asEuint8(vaccineType);
    euint32 encryptedVaccineDate = FHE.asEuint32(vaccineDate);
    euint8 encryptedDoseNumber = FHE.asEuint8(doseNumber);
    euint32 encryptedBatchNumber = FHE.asEuint32(batchNumber);

    // Store in contract state
    vaccineRecords[recordId] = VaccineRecord({
        encryptedPersonId: encryptedPersonId,
        encryptedVaccineType: encryptedVaccineType,
        // ... other encrypted fields
    });

    // Grant permissions
    FHE.allowThis(encryptedPersonId);
    FHE.allow(encryptedPersonId, patient);
    FHE.allow(encryptedPersonId, msg.sender);
    // ... other fields
}
```

### Updating Record

```solidity
function updateVaccineRecord(
    uint256 recordId,
    uint8 newVaccineType,
    uint32 newVaccineDate,
    // ... other parameters
) external {
    VaccineRecord storage record = vaccineRecords[recordId];

    if (newVaccineType > 0) {
        // Create new encrypted value
        record.encryptedVaccineType = FHE.asEuint8(newVaccineType);
        // Grant permissions for updated value
        FHE.allowThis(record.encryptedVaccineType);
    }

    emit RecordUpdated(recordId, msg.sender);
}
```

### Verifying Record

```solidity
function verifyVaccineRecord(
    uint256 recordId,
    uint32 expectedPersonId
) external returns (ebool) {
    require(hasAccessPermission(msg.sender, recordId), "No permission");

    VaccineRecord memory record = vaccineRecords[recordId];

    // Encrypted comparison
    euint32 expectedId = FHE.asEuint32(expectedPersonId);
    return FHE.eq(record.encryptedPersonId, expectedId);
}
```

## Security Considerations

### 1. Encryption Guarantees

- **Confidentiality**: Only authorized parties can see encrypted values
- **Authenticity**: FHE operations ensure computation correctness
- **Integrity**: Encrypted values cannot be modified without detection

### 2. Input Validation

```solidity
require(vaccineType > 0 && vaccineType <= 10, "Invalid vaccine type");
require(doseNumber > 0 && doseNumber <= 5, "Invalid dose number");
```

Always validate before encryption!

### 3. Type Safety

```solidity
// Wrong: Type mismatch
euint32 wrong = FHE.asEuint32(uint8(doseNumber)); // OK, widens
euint8 wrong2 = FHE.asEuint8(uint32(largeNumber)); // Risk of overflow

// Correct: Use appropriate type
euint8 correct = FHE.asEuint8(doseNumber);
```

## Testing Encryption Operations

```typescript
/**
 * @test Encryption Operations
 * @category: encryption
 * @concept: fhe-operations
 */
describe("Encryption Operations", function() {

  it("should encrypt values correctly", async function() {
    const recordId = 1;
    const record = await contract.vaccineRecords(recordId);
    expect(record.encryptedPersonId).to.exist;
  });

  it("should handle encrypted comparisons", async function() {
    const result = await contract.verifyVaccineRecord(recordId, expectedId);
    expect(result).to.be.defined;
  });

  it("should prevent unauthorized decryption", async function() {
    await expect(
      contract.connect(unauthorized).verifyVaccineRecord(recordId, expectedId)
    ).to.be.revertedWith("No access permission");
  });
});
```

## Common Issues

### Issue: "euint type mismatch"

**Cause:** Using wrong encryption type

**Solution:**
```solidity
// Data size determines type
uint8 value = 255;           // Use euint8
uint32 value = 100000;       // Use euint32
uint256 timestamp;           // Use euint32 for smaller, euint64 for larger
```

### Issue: "Cannot read encrypted value in contract"

**Expected Behavior:** Encrypted values cannot be decrypted in contract code. This is by design for privacy.

**Solution:** Use encrypted operations:
```solidity
// Wrong: Try to read encrypted value
if (record.encryptedPersonId == 123) { }  // Compilation error

// Correct: Use encrypted comparison
ebool matches = FHE.eq(record.encryptedPersonId, FHE.asEuint32(123));
// Return or emit the result
```

## Best Practices

### ✅ DO

- Encrypt all sensitive data immediately
- Call FHE.allowThis() before FHE.allow()
- Validate plain values before encryption
- Use appropriate encrypted types
- Grant permissions to users who need them
- Update permissions when data changes

### ❌ DON'T

- Log plain values before encryption
- Store decrypted values in contract
- Forget permission grants
- Mix encrypted type sizes unnecessarily
- Assume contract can read encrypted values

## Performance Considerations

- Encryption operations are CPU-bound
- Test with realistic data sizes
- Monitor gas usage:
  ```bash
  REPORT_GAS=true npm test
  ```

## Related Concepts

- [Access Control](access-control.md)
- [Permission Management](permission-management.md)
- [Smart Contract Architecture](architecture.md)

## References

- [FHEVM Encryption Guide](https://docs.zama.ai/fhevm/fundamentals/encryption)
- [FHE Operations](https://docs.zama.ai/fhevm/fundamentals/operations)

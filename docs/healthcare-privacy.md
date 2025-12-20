# Healthcare Privacy Patterns

## Overview

This document describes the privacy-preserving patterns implemented in the Vaccine Record Privacy contract for healthcare applications.

## Privacy Challenges in Healthcare

### 1. Data Sensitivity

Vaccine records contain:
- Personal identification
- Medical history
- Vaccination dates
- Batch numbers
- Dose information

All must remain encrypted and accessible only to authorized parties.

### 2. Regulatory Requirements

- **HIPAA**: Protected Health Information (PHI) confidentiality
- **GDPR**: Right to privacy and data minimization
- **Local Laws**: Jurisdiction-specific requirements

### 3. Access Patterns

Different stakeholders need different access:
- Patients: Full access to own records
- Treating doctors: Access to records they create
- Specialists: Temporary access for specific purposes
- Health authorities: System-wide visibility (encrypted)
- Researchers: Aggregated data without identifiers

## FHEVM-Based Solution

### Encrypted Storage

All sensitive data remains encrypted:

```solidity
struct VaccineRecord {
    euint32 encryptedPersonId;      // Who
    euint8 encryptedVaccineType;    // What
    euint32 encryptedVaccineDate;   // When
    euint8 encryptedDoseNumber;     // How many
    euint32 encryptedBatchNumber;   // Batch info
    bool isActive;                  // Metadata (non-sensitive)
}
```

### Permission-Based Access

Only authorized parties can decrypt:

```solidity
// Patient gets automatic access
FHE.allow(encryptedPersonId, patientAddress);

// Doctor gets automatic access
FHE.allow(encryptedPersonId, doctorAddress);

// Others only with explicit grant
if (accessPermissions[user][recordId].canView) {
    FHE.allow(encryptedPersonId, user);
}
```

### Temporal Control

Access is time-limited:

```solidity
// Specialist gets 7-day access only
uint256 expiryTime = block.timestamp + (7 * 1 day);

accessPermissions[specialistAddress][recordId] = AccessPermission({
    canView: true,
    canUpdate: false,
    expiryTime: expiryTime,
    isActive: true
});
```

## Privacy Guarantees

### 1. Confidentiality

- Data encrypted end-to-end
- Only authorized users can decrypt
- Contract itself cannot read encrypted values
- No plaintext storage

### 2. Authorization

- Access explicitly granted per record
- Time-limited access
- Granular permissions (view/update)
- Revocation support

### 3. Audit Trail

Events provide audit trail:

```solidity
event VaccineRecorded(uint256 indexed recordId, address indexed patient, address indexed doctor);
event AccessGranted(address indexed patient, address indexed accessor, uint256 recordId);
event AccessRevoked(address indexed patient, address indexed accessor, uint256 recordId);
```

### 4. Data Integrity

- Encrypted operations ensure computation correctness
- No modification without detection
- Clear ownership and authorization

## Use Case: Patient Data Sharing

### Scenario

Patient wants to share vaccination record with:
1. **Their Doctor**: Full access (view + update)
2. **Specialist**: 7-day read-only for consultation
3. **Insurance**: 30-day read-only for claim processing
4. **Research Study**: 90-day read-only for epidemiology

### Implementation

```solidity
// 1. Doctor (full access - automatic)
// Patient owns record, creating doctor has auto-access

// 2. Specialist (7-day read-only)
await contract.grantAccess(
    specialistAddress,
    recordId,
    true,   // canView
    false,  // canUpdate
    7       // 7 days
);

// 3. Insurance (30-day read-only)
await contract.grantAccess(
    insuranceAddress,
    recordId,
    true,   // canView
    false,  // canUpdate
    30      // 30 days
);

// 4. Research (90-day read-only)
await contract.grantAccess(
    researchAddress,
    recordId,
    true,   // canView
    false,  // canUpdate
    90      // 90 days
);
```

## Privacy-Preserving Features

### 1. Selective Disclosure

Only share necessary data:

```solidity
// Only grant view permission if needed
if (needsAccess) {
    FHE.allow(encryptedPersonId, accessor);
} else {
    // Don't grant - accessor cannot decrypt
}
```

### 2. Purpose Limitation

Time-based expiry enforces purpose limitation:

```solidity
// Specialist access for consultation (7 days)
// Automatically expires - can't use for other purposes
```

### 3. Minimization

Only store necessary fields:

```solidity
struct VaccineRecord {
    // Essential for healthcare
    euint8 encryptedVaccineType;
    euint32 encryptedVaccineDate;
    euint8 encryptedDoseNumber;

    // Avoid: Patient name, address, SSN, etc.
    // Those belong in separate, separately-controlled system
}
```

### 4. Data Subject Rights

Implement GDPR-like features:

```solidity
// Right to access: Patient can view own records
bool hasAccess = await contract.hasAccessPermission(
    patientAddress,
    recordId
);

// Right to erasure: Deactivate record
await contract.deactivateRecord(recordId);

// Right to restrict: Revoke access
await contract.revokeAccess(userAddress, recordId);
```

## Implementation Considerations

### Encryption Overhead

```solidity
// CPU: Encryption/decryption is CPU-intensive
// Cost: More gas for encrypted operations
// Latency: Additional computation time

// Mitigation:
// - Batch operations when possible
// - Pre-compute when feasible
// - Monitor gas usage
```

### Key Management

```
Not handled in contract (application responsibility):
- Encryption keys stored securely
- Key rotation policies
- Key escrow if needed
- Multi-signature controls
```

### Audit Logging

```typescript
// Listen to all access events
contract.on("AccessGranted", (patient, accessor, recordId) => {
    // Log to audit system
    auditLog.record({
        timestamp: Date.now(),
        action: "access_granted",
        patient,
        accessor,
        recordId
    });
});

contract.on("AccessRevoked", (patient, accessor, recordId) => {
    auditLog.record({
        timestamp: Date.now(),
        action: "access_revoked",
        patient,
        accessor,
        recordId
    });
});
```

## Compliance Mapping

### HIPAA Requirements

| Requirement | Implementation |
|---|---|
| PHI encryption | euint types for sensitive data |
| Access controls | FHE.allow() grants |
| Audit trails | Events for all access changes |
| Authorization | AccessPermission checks |
| Minimum necessary | Separate encrypted fields |

### GDPR Requirements

| Requirement | Implementation |
|---|---|
| Consent | Access grant (opt-in) |
| Purpose | Time-limited permissions |
| Transparency | Audit events |
| Data rights | Revocation capability |
| Privacy by design | Encryption by default |

## Security Best Practices

### ✅ DO

- Encrypt all PHI immediately
- Verify permissions before operations
- Log all access events
- Set appropriate expiry times
- Revoke immediately when needed
- Regularly audit access logs
- Test access controls thoroughly
- Document access policies

### ❌ DON'T

- Store plaintext PHI
- Grant indefinite access
- Skip audit logging
- Mix encrypted and plaintext data
- Assume encryption alone is enough
- Grant more permissions than needed
- Store keys in contract
- Ignore regulatory requirements

## Testing Privacy

```typescript
/**
 * @test Healthcare Privacy
 * @category: privacy
 * @concept: data-protection
 */
describe("Healthcare Privacy", function() {

  it("should encrypt patient identifiers", async function() {
    const record = await contract.vaccineRecords(recordId);

    // Encrypted value stored
    expect(record.encryptedPersonId).to.exist;

    // Cannot read plaintext
    expect(record.encryptedPersonId).to.not.equal(originalId);
  });

  it("should enforce data access control", async function() {
    // Unauthorized user cannot access
    await expect(
      contract.connect(unauthorized).verifyVaccineRecord(recordId, id)
    ).to.be.revertedWith("No access permission");
  });

  it("should enforce time-limited access", async function() {
    // Grant 1-day access
    await contract.grantAccess(userAddress, recordId, true, false, 1);

    // Wait for expiry
    await time.increase(86400 * 2); // 2 days

    // Access denied
    const hasAccess = await contract.hasAccessPermission(
        userAddress,
        recordId
    );
    expect(hasAccess).to.be.false;
  });

  it("should create audit trail", async function() {
    // Monitor events
    expect(await contract.grantAccess(...))
        .to.emit(contract, "AccessGranted");

    expect(await contract.revokeAccess(...))
        .to.emit(contract, "AccessRevoked");
  });
});
```

## Related Concepts

- [Access Control](access-control.md)
- [Permission Management](permission-management.md)
- [Encryption Operations](encryption-operations.md)

## References

- [HIPAA Privacy Rule](https://www.hhs.gov/hipaa/for-professionals/privacy/index.html)
- [GDPR Privacy](https://gdpr-info.eu/)
- [FHEVM Security Model](https://docs.zama.ai/fhevm)
- [Healthcare Data Standards](https://www.hl7.org/)

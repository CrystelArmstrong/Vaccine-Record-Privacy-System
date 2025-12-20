# Access Control Pattern

## Overview

The Vaccine Record Privacy contract demonstrates comprehensive access control mechanisms using FHEVM's permission system.

## Key Components

### 1. Role-Based Access

The contract implements three main roles:

#### Health Authority
- System administrator
- Can authorize/revoke doctors
- Can deactivate records
- Typically the contract deployer

#### Authorized Doctors
- Can record vaccinations
- Automatically get access to records they create
- Can update their own records

#### Patients (Record Owners)
- Automatically own records created for them
- Can grant/revoke access to others
- Can set time-limited permissions

### 2. FHE Permission System

```solidity
// Grant contract permission (required for contract operations)
FHE.allowThis(encryptedValue);

// Grant user permission (allows user to decrypt)
FHE.allow(encryptedValue, userAddress);
```

### 3. Time-Based Permissions

```solidity
AccessPermission {
    bool canView;           // Can view encrypted data
    bool canUpdate;         // Can modify records
    uint256 expiryTime;     // When permission expires
    bool isActive;          // Active/inactive flag
}
```

## Implementation Details

### Doctor Authorization

```solidity
function authorizeDoctor(address doctor) external onlyHealthAuthority {
    authorizedDoctors[doctor] = true;
    emit DoctorAuthorized(doctor);
}
```

**Key Points:**
- Only health authority can authorize
- Emits event for off-chain tracking
- Simple boolean mapping

### Granting Access

```solidity
function grantAccess(
    address accessor,
    uint256 recordId,
    bool canView,
    bool canUpdate,
    uint256 durationInDays
) external {
    require(hasOwnershipOfRecord(msg.sender, recordId), "Not owner");

    accessPermissions[accessor][recordId] = AccessPermission({
        canView: canView,
        canUpdate: canUpdate,
        expiryTime: block.timestamp + (durationInDays * 1 days),
        isActive: true
    });

    if (canView) {
        // Grant FHE permissions if view access granted
        FHE.allow(record.encryptedPersonId, accessor);
        // ... other fields
    }
}
```

**Key Points:**
- Only record owner can grant access
- Separate canView and canUpdate permissions
- Time-based expiry
- FHE permissions tied to access grants

### Access Verification

```solidity
function hasAccessPermission(address user, uint256 recordId)
    public view returns (bool) {
    AccessPermission memory permission = accessPermissions[user][recordId];
    return permission.isActive &&
           permission.canView &&
           block.timestamp <= permission.expiryTime;
}
```

**Key Points:**
- Checks active status
- Checks view permission
- Verifies expiry time

## Security Patterns

### 1. Permission Checks

Always verify:
- User has permission for the operation
- Permission is still active
- Permission hasn't expired

```solidity
modifier onlyRecordOwnerOrAuthorized(uint256 recordId) {
    require(
        hasAccessPermission(msg.sender, recordId) ||
        vaccineRecords[recordId].authorizedDoctor == msg.sender,
        "No access permission"
    );
    _;
}
```

### 2. FHE Permission Binding

Critical pattern:
```solidity
// WRONG: Missing FHE.allowThis()
FHE.allow(encryptedValue, user);  // Will fail!

// CORRECT: Grant both permissions
FHE.allowThis(encryptedValue);     // Contract can use
FHE.allow(encryptedValue, user);   // User can decrypt
```

### 3. Permission Lifecycle

1. **Creation**: Owner creates record, patient automatically gets access
2. **Granting**: Owner grants access to others with expiry
3. **Using**: User performs operations within permission scope
4. **Expiry**: Permission automatically expires
5. **Revocation**: Owner can manually revoke anytime

## Testing Access Control

The test suite includes comprehensive access control tests:

```typescript
/**
 * @test Access Control
 * @category: security
 * @concept: authorization-checks
 */
describe("Access Control", function() {
  it("should grant access only to authorized users", async function() {
    // Setup
    // Grant access
    // Verify only authorized user can access
  });

  it("should enforce time-based expiry", async function() {
    // Grant with 1 day expiry
    // Wait for expiry
    // Verify access is denied
  });
});
```

## Best Practices

### ✅ DO

- Always check FHE.allowThis() is called before FHE.allow()
- Verify permission expiry in critical operations
- Use events for audit trails
- Implement granular permissions
- Set appropriate default expirations

### ❌ DON'T

- Forget FHE permission checks
- Assume permission persistence
- Grant unlimited duration access
- Bypass ownership checks
- Mix permission types

## Real-World Scenario

### Doctor Shares Record with Specialist

```solidity
// Doctor grants read-only access to specialist for 30 days
await contract.grantAccess(
    specialistAddress,
    recordId,
    true,   // canView
    false,  // canUpdate (read-only)
    30      // 30 days
);

// Specialist can view but not modify
specialist_data = await decrypt(record.encryptedData);

// After 30 days, access automatically expires
// Doctor can manually revoke if needed earlier
```

## Common Issues

### Issue: "No access permission" Error

**Cause:** User trying to access without permission

**Solution:**
1. Verify user is the record owner or has been granted access
2. Check if permission has expired
3. Check if permission is active

### Issue: Encrypted Data Not Decryptable

**Cause:** FHE.allowThis() not called before FHE.allow()

**Solution:**
```solidity
// Wrong order
FHE.allow(encryptedValue, user);
FHE.allowThis(encryptedValue);  // Too late!

// Correct order
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, user);
```

## Related Concepts

- [Encryption Operations](encryption-operations.md)
- [Permission Management](permission-management.md)
- [Healthcare Privacy](healthcare-privacy.md)

## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Smart Contract Architecture](architecture.md)

# Permission Management

## Overview

The Vaccine Record Privacy contract implements sophisticated permission management with time-based expiry, granular control (view vs update), and dynamic revocation.

## Permission Model

### Permission Structure

```solidity
struct AccessPermission {
    bool canView;           // Can view (decrypt) encrypted data
    bool canUpdate;         // Can modify the record
    uint256 expiryTime;     // Unix timestamp when permission expires
    bool isActive;          // Flag to mark permission as revoked
}
```

### Permission Matrix

|             | Owner | Doctor | Authorized User | Unauthorized |
|-------------|-------|--------|-----------------|--------------|
| View        | ✅    | ✅     | (if granted)    | ❌           |
| Update      | ❌*   | ✅     | (if granted)    | ❌           |
| Grant       | ✅    | ❌     | ❌              | ❌           |
| Revoke      | ✅    | ❌     | ❌              | ❌           |

*Patient can't update, only doctor who created record can

## Time-Based Expiry

### Granting with Duration

```solidity
function grantAccess(
    address accessor,
    uint256 recordId,
    bool canView,
    bool canUpdate,
    uint256 durationInDays
) external {
    uint256 expiryTime = block.timestamp + (durationInDays * 1 days);

    accessPermissions[accessor][recordId] = AccessPermission({
        canView: canView,
        canUpdate: canUpdate,
        expiryTime: expiryTime,
        isActive: true
    });
}
```

### Expiry Verification

```solidity
function hasAccessPermission(address user, uint256 recordId)
    public view returns (bool) {
    AccessPermission memory perm = accessPermissions[user][recordId];
    return perm.isActive &&
           perm.canView &&
           block.timestamp <= perm.expiryTime;
}
```

**Key Points:**
- Block timestamp controls expiry
- Permission remains in storage (can be extended)
- Automatic enforcement on access checks

## Use Cases

### 1. Short-Term Specialist Review (7 days)

```solidity
// Doctor grants specialist 7-day read-only access
await contract.grantAccess(
    specialistAddress,
    recordId,
    true,   // canView
    false,  // canUpdate (read-only)
    7       // 7 days
);

// After 7 days, automatically expires
```

### 2. Long-Term Medical History (365 days)

```solidity
// Patient grants insurance company access for 1 year
await contract.grantAccess(
    insuranceAddress,
    recordId,
    true,   // canView
    false,  // canUpdate
    365     // 1 year
);
```

### 3. Research Study (30 days, update capability)

```solidity
// Doctor grants research partner update access for 30 days
await contract.grantAccess(
    researcherAddress,
    recordId,
    true,   // canView
    true,   // canUpdate (can add notes)
    30      // 30 days
);
```

### 4. Emergency Access (1 day)

```solidity
// Quick access for emergency situation
await contract.grantAccess(
    emergencyProviderAddress,
    recordId,
    true,   // canView
    false,  // canUpdate (read-only)
    1       // 1 day only
);
```

## Permission Operations

### Granting Access

```solidity
await contract.grantAccess(
    recipientAddress,
    recordId,
    canView,        // true/false
    canUpdate,      // true/false
    durationInDays  // number of days
);
```

**Permissions Granted:**
- Record added to `accessPermissions` mapping
- If canView is true, FHE.allow() is called automatically

### Checking Permission

```solidity
// Check if user has view access
bool hasAccess = await contract.hasAccessPermission(
    userAddress,
    recordId
);

// Get detailed permission info
const permission = await contract.getAccessPermission(
    userAddress,
    recordId
);

console.log(permission);
// {
//   canView: true,
//   canUpdate: false,
//   expiryTime: 1234567890,
//   isActive: true
// }
```

### Revoking Access

```solidity
// Owner can revoke anytime
await contract.revokeAccess(
    recipientAddress,
    recordId
);

// Sets isActive = false
// User can no longer access
```

### Extending Permission

Current implementation doesn't support extending, but can be granted again:

```solidity
// Grant again with new duration
await contract.grantAccess(
    userAddress,
    recordId,
    true,   // canView
    false,  // canUpdate
    365     // Extend to 365 more days
);
```

## Advanced Patterns

### 1. Cascade Revocation

Revoke one user effectively:

```solidity
// Instant effect
await contract.revokeAccess(userAddress, recordId);

// User no longer has access
// No grace period
// Effective immediately
```

### 2. Permission Audit Trail

Monitor permission changes via events:

```typescript
// Listen for access grants
contract.on("AccessGranted", (patient, accessor, recordId, event) => {
    console.log(`Access granted to ${accessor} for record ${recordId}`);
});

// Listen for revocations
contract.on("AccessRevoked", (patient, accessor, recordId, event) => {
    console.log(`Access revoked from ${accessor} for record ${recordId}`);
});
```

### 3. Automatic Cleanup

Check expired permissions:

```typescript
async function checkExpiredPermissions(recordId) {
    const now = Math.floor(Date.now() / 1000);

    // Query stored permissions
    const permission = await contract.getAccessPermission(
        userAddress,
        recordId
    );

    if (permission.expiryTime < now && permission.isActive) {
        console.log("Permission has expired");
    }
}
```

## Testing Permission Management

```typescript
/**
 * @test Permission Management
 * @category: permissions
 * @concept: time-based-access
 */
describe("Permission Management", function() {

  it("should grant access with expiry", async function() {
    const durationDays = 30;
    const tx = await contract.grantAccess(
        recipientAddress,
        recordId,
        true,
        false,
        durationDays
    );

    // Verify permission was set
    const perm = await contract.getAccessPermission(
        recipientAddress,
        recordId
    );
    expect(perm.canView).to.be.true;
    expect(perm.canUpdate).to.be.false;
    expect(perm.isActive).to.be.true;
  });

  it("should enforce permission expiry", async function() {
    // Grant short-lived permission
    await contract.grantAccess(
        userAddress,
        recordId,
        true,
        false,
        0  // 0 days (expires immediately)
    );

    // Fast forward time
    await ethers.provider.send("hardhat_mine", ["0x10"]); // Mine 16 blocks

    // Verify permission expired
    const hasAccess = await contract.hasAccessPermission(
        userAddress,
        recordId
    );
    expect(hasAccess).to.be.false;
  });

  it("should allow revocation", async function() {
    await contract.grantAccess(userAddress, recordId, true, false, 30);

    // Revoke
    await contract.revokeAccess(userAddress, recordId);

    // Verify revoked
    const hasAccess = await contract.hasAccessPermission(
        userAddress,
        recordId
    );
    expect(hasAccess).to.be.false;
  });
});
```

## Security Considerations

### 1. Time Assumptions

- Uses `block.timestamp` for expiry checks
- Vulnerable to miner manipulation (small time windows)
- Not suitable for very short expirations (< 1 minute)

### 2. Permission Scope

- Permissions are record-specific
- One record per permission entry
- No global permissions

### 3. Access Control

```solidity
function grantAccess(...) external {
    require(hasOwnershipOfRecord(msg.sender, recordId));
    // Only owner can grant
}

function revokeAccess(...) external {
    require(hasOwnershipOfRecord(msg.sender, recordId));
    // Only owner can revoke
}
```

## Best Practices

### ✅ DO

- Set reasonable expiry periods based on use case
- Revoke immediately when access should end
- Check permissions before operations
- Use granular permissions (separate view/update)
- Log permission changes
- Regular audit of active permissions

### ❌ DON'T

- Grant indefinite permissions
- Trust permission expiry alone for sensitive data
- Grant update access unless necessary
- Reuse same permission levels for different users
- Forget to implement permission checks in functions

## Real-World Scenario

### Healthcare Workflow

```
1. Patient creates vaccination record
   → Patient automatically has view access
   → Doctor who created record has view+update

2. Patient needs specialist review (7 days)
   → Grant specialist read-only for 7 days
   → Specialist can view encrypted data

3. Specialist finishes review
   → Permission auto-expires or can be manually revoked
   → Specialist can no longer access

4. Patient wants to keep research copy (1 year)
   → Grant research institution access for 365 days
   → Can still revoke anytime
```

## Related Concepts

- [Access Control](access-control.md)
- [Encryption Operations](encryption-operations.md)
- [Healthcare Privacy](healthcare-privacy.md)

## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Time in Solidity](https://docs.soliditylang.org/latest/units-and-global-variables.html#block-and-transaction-properties)

# FHEVM Design Patterns

Common design patterns and best practices for building privacy-preserving smart contracts with FHEVM.

## Table of Contents

1. [Permission Patterns](#permission-patterns)
2. [Encryption Patterns](#encryption-patterns)
3. [Access Control Patterns](#access-control-patterns)
4. [Data Management Patterns](#data-management-patterns)
5. [Security Patterns](#security-patterns)
6. [Anti-Patterns](#anti-patterns)

---

## Permission Patterns

### Pattern 1: Dual Permission Grant

**Problem**: Encrypted values need both contract and user permissions.

**Solution**:
```solidity
function createEncryptedValue(uint32 value, address user) external {
    euint32 encrypted = FHE.asEuint32(value);

    // Step 1: Grant contract permission
    FHE.allowThis(encrypted);

    // Step 2: Grant user permission
    FHE.allow(encrypted, user);
}
```

**When to Use**: Every time you create encrypted data that users need to decrypt.

**Benefits**:
- Contract can perform operations
- User can decrypt values
- Follows principle of least privilege

### Pattern 2: Owner-Controlled Access

**Problem**: Only data owner should grant access to others.

**Solution**:
```solidity
mapping(uint256 => address) public owners;
mapping(address => mapping(uint256 => bool)) public permissions;

function grantAccess(address user, uint256 dataId) external {
    require(owners[dataId] == msg.sender, "Not owner");
    permissions[user][dataId] = true;

    // Grant FHE permission
    FHE.allow(encryptedData[dataId], user);
}
```

**When to Use**: User-owned data with selective sharing.

**Benefits**:
- Clear ownership model
- Fine-grained control
- User privacy preserved

### Pattern 3: Time-Limited Access

**Problem**: Temporary access needed for specific purpose.

**Solution**:
```solidity
struct TimedPermission {
    bool hasAccess;
    uint256 expiryTime;
}

mapping(address => mapping(uint256 => TimedPermission)) public timedAccess;

function grantTimedAccess(
    address user,
    uint256 dataId,
    uint256 duration
) external {
    require(owners[dataId] == msg.sender, "Not owner");

    timedAccess[user][dataId] = TimedPermission({
        hasAccess: true,
        expiryTime: block.timestamp + duration
    });

    FHE.allow(encryptedData[dataId], user);
}

function hasAccess(address user, uint256 dataId) public view returns (bool) {
    TimedPermission memory perm = timedAccess[user][dataId];
    return perm.hasAccess && block.timestamp <= perm.expiryTime;
}
```

**When to Use**: Healthcare, finance, temporary sharing scenarios.

**Benefits**:
- Automatic expiry
- No manual cleanup needed
- Purpose limitation enforced

---

## Encryption Patterns

### Pattern 4: Type-Appropriate Encryption

**Problem**: Choose correct encrypted type for data size.

**Solution**:
```solidity
contract DataTypes {
    euint8 age;           // 0-255 (1 byte)
    euint16 amount;       // 0-65,535 (2 bytes)
    euint32 timestamp;    // 0-4 billion (4 bytes)
    euint64 bigNumber;    // Very large numbers (8 bytes)
    ebool isVerified;     // Boolean values
}
```

**When to Use**: Always match type to data range.

**Benefits**:
- Gas optimization
- Clearer intent
- Reduced encryption overhead

### Pattern 5: Batch Encryption

**Problem**: Multiple values need encryption.

**Solution**:
```solidity
function storeMultiple(
    uint32[] calldata values,
    address user
) external {
    for (uint i = 0; i < values.length; i++) {
        euint32 encrypted = FHE.asEuint32(values[i]);
        FHE.allowThis(encrypted);
        FHE.allow(encrypted, user);
        encryptedValues.push(encrypted);
    }
}
```

**When to Use**: Bulk operations, array data.

**Benefits**:
- Efficient bulk processing
- Consistent permissions
- Reduced transaction count

### Pattern 6: Encrypted Comparison

**Problem**: Need to verify values without decryption.

**Solution**:
```solidity
function verify(uint32 expectedValue) external returns (ebool) {
    require(hasAccess(msg.sender), "No access");

    euint32 expected = FHE.asEuint32(expectedValue);
    return FHE.eq(storedValue, expected);
}
```

**When to Use**: Verification, authentication, validation.

**Benefits**:
- Privacy-preserving verification
- No data leakage
- Efficient comparison

---

## Access Control Patterns

### Pattern 7: Role-Based Access Control (RBAC)

**Problem**: Different users have different permission levels.

**Solution**:
```solidity
enum Role { None, Viewer, Editor, Admin }

mapping(address => Role) public roles;
mapping(uint256 => mapping(Role => bool)) public rolePermissions;

function grantRole(address user, Role role) external onlyAdmin {
    roles[user] = role;
}

modifier hasRole(Role required) {
    require(uint(roles[msg.sender]) >= uint(required), "Insufficient role");
    _;
}

function viewData(uint256 dataId) external hasRole(Role.Viewer) {
    // View encrypted data
}

function editData(uint256 dataId) external hasRole(Role.Editor) {
    // Modify encrypted data
}
```

**When to Use**: Organizations, hierarchical systems.

**Benefits**:
- Clear role hierarchy
- Scalable permissions
- Centralized management

### Pattern 8: Multi-Party Authorization

**Problem**: Multiple parties need to approve operations.

**Solution**:
```solidity
struct Approval {
    mapping(address => bool) approvals;
    uint256 approvalCount;
    uint256 required;
}

mapping(uint256 => Approval) public approvals;

function approve(uint256 operationId) external {
    require(!approvals[operationId].approvals[msg.sender], "Already approved");

    approvals[operationId].approvals[msg.sender] = true;
    approvals[operationId].approvalCount++;

    if (approvals[operationId].approvalCount >= approvals[operationId].required) {
        // Execute operation
        executeOperation(operationId);
    }
}
```

**When to Use**: Financial operations, critical data changes.

**Benefits**:
- Reduced single point of failure
- Democratic control
- Audit trail

### Pattern 9: Delegated Access

**Problem**: Users want to delegate access rights.

**Solution**:
```solidity
mapping(address => mapping(address => bool)) public delegates;

function delegateAccess(address delegate) external {
    delegates[msg.sender][delegate] = true;
}

function revokeDelegate(address delegate) external {
    delegates[msg.sender][delegate] = false;
}

modifier ownerOrDelegate(uint256 dataId) {
    address owner = owners[dataId];
    require(
        msg.sender == owner || delegates[owner][msg.sender],
        "Not authorized"
    );
    _;
}
```

**When to Use**: Account recovery, assistive access.

**Benefits**:
- Flexible authorization
- Recoverable access
- User convenience

---

## Data Management Patterns

### Pattern 10: Encrypted State Machine

**Problem**: Track encrypted state transitions.

**Solution**:
```solidity
enum State { Created, Approved, Completed }

struct EncryptedRecord {
    euint32 data;
    State state;
}

mapping(uint256 => EncryptedRecord) public records;

function transition(uint256 recordId, State newState) external {
    EncryptedRecord storage record = records[recordId];

    if (newState == State.Approved) {
        require(record.state == State.Created, "Invalid transition");
        require(hasRole(Role.Approver), "Not approver");
    }

    record.state = newState;
}
```

**When to Use**: Workflows, approval processes.

**Benefits**:
- Clear state flow
- Enforced transitions
- Audit trail

### Pattern 11: Versioned Encrypted Data

**Problem**: Track data changes over time.

**Solution**:
```solidity
struct Version {
    euint32 data;
    uint256 timestamp;
    address updater;
}

mapping(uint256 => Version[]) public versions;

function update(uint256 dataId, uint32 newValue) external {
    euint32 encrypted = FHE.asEuint32(newValue);
    FHE.allowThis(encrypted);

    versions[dataId].push(Version({
        data: encrypted,
        timestamp: block.timestamp,
        updater: msg.sender
    }));
}
```

**When to Use**: Audit requirements, historical tracking.

**Benefits**:
- Full history
- Accountability
- Rollback capability

---

## Security Patterns

### Pattern 12: Input Validation Before Encryption

**Problem**: Invalid data should be rejected before encryption.

**Solution**:
```solidity
function storeAge(uint8 age) external {
    // Validate before encryption
    require(age > 0 && age <= 150, "Invalid age");

    euint8 encryptedAge = FHE.asEuint8(age);
    FHE.allowThis(encryptedAge);

    userAges[msg.sender] = encryptedAge;
}
```

**When to Use**: All user inputs.

**Benefits**:
- Prevent bad data
- Save gas
- Clear error messages

### Pattern 13: Permission Verification

**Problem**: Ensure permissions before operations.

**Solution**:
```solidity
modifier hasPermission(uint256 dataId) {
    require(
        owners[dataId] == msg.sender ||
        permissions[msg.sender][dataId],
        "No permission"
    );
    _;
}

function operate(uint256 dataId) external hasPermission(dataId) {
    // Perform operation
}
```

**When to Use**: All sensitive operations.

**Benefits**:
- Clear authorization
- Consistent checks
- Reduced errors

### Pattern 14: Reentrancy Protection with Encrypted Data

**Problem**: Reentrancy attacks on encrypted operations.

**Solution**:
```solidity
bool private locked;

modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}

function sensitiveOperation(uint32 value) external nonReentrant {
    euint32 encrypted = FHE.asEuint32(value);
    // Perform operations
}
```

**When to Use**: External calls, complex operations.

**Benefits**:
- Prevents reentrancy
- State protection
- Security guarantee

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Missing allowThis

**Problem**:
```solidity
// Wrong: Missing FHE.allowThis()
function bad(uint32 value, address user) external {
    euint32 encrypted = FHE.asEuint32(value);
    FHE.allow(encrypted, user);  // Will fail!
}
```

**Solution**:
```solidity
// Correct: Both permissions
function good(uint32 value, address user) external {
    euint32 encrypted = FHE.asEuint32(value);
    FHE.allowThis(encrypted);     // Contract permission
    FHE.allow(encrypted, user);   // User permission
}
```

### ❌ Anti-Pattern 2: Logging Plaintext

**Problem**:
```solidity
// Wrong: Logs sensitive data before encryption
function bad(uint32 sensitiveValue) external {
    emit DataReceived(sensitiveValue);  // Privacy leak!

    euint32 encrypted = FHE.asEuint32(sensitiveValue);
}
```

**Solution**:
```solidity
// Correct: Log after encryption
function good(uint32 sensitiveValue) external {
    euint32 encrypted = FHE.asEuint32(sensitiveValue);

    emit EncryptedDataStored(msg.sender);  // No sensitive data
}
```

### ❌ Anti-Pattern 3: Reading Encrypted in Contract

**Problem**:
```solidity
// Wrong: Try to read encrypted value
function bad() external {
    if (encryptedValue == 123) {  // Compilation error!
        // Cannot compare in contract
    }
}
```

**Solution**:
```solidity
// Correct: Use encrypted comparison
function good() external returns (ebool) {
    euint32 expected = FHE.asEuint32(123);
    return FHE.eq(encryptedValue, expected);
}
```

### ❌ Anti-Pattern 4: Unbounded Access

**Problem**:
```solidity
// Wrong: Unlimited access duration
function bad(address user, uint256 dataId) external {
    permissions[user][dataId] = true;  // Forever!
}
```

**Solution**:
```solidity
// Correct: Time-limited access
function good(address user, uint256 dataId, uint256 duration) external {
    timedPermissions[user][dataId] = TimedPermission({
        hasAccess: true,
        expiryTime: block.timestamp + duration
    });
}
```

---

## Pattern Selection Guide

| Use Case | Recommended Patterns |
|----------|---------------------|
| User-owned data | Dual Permission Grant + Owner-Controlled Access |
| Temporary sharing | Time-Limited Access |
| Organizational roles | Role-Based Access Control |
| Critical operations | Multi-Party Authorization |
| Data history | Versioned Encrypted Data |
| Workflows | Encrypted State Machine |
| All inputs | Input Validation |
| All operations | Permission Verification |

## Related Concepts

- [Access Control](access-control.md)
- [Encryption Operations](encryption-operations.md)
- [Permission Management](permission-management.md)
- [Architecture](architecture.md)

## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity Patterns](https://fravoll.github.io/solidity-patterns/)
- [Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)

---

**Built with ❤️ for secure, privacy-preserving applications**

# Smart Contract Architecture

## Overview

The Vaccine Record Privacy contract implements a healthcare data management system using FHEVM for end-to-end encryption while maintaining sophisticated access controls.

## System Architecture

```
┌─────────────────────────────────────────┐
│      Health Authority (Deployer)       │
│  - Authorizes/Revokes Doctors          │
│  - System Administrator                 │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
┌─────▼─────┐    ┌──────▼──────┐
│  Doctors   │    │  Patients   │
│ - Record   │    │ - Own data  │
│ - Update   │    │ - Share     │
│ - Access   │    │ - Revoke    │
└────────────┘    └─────────────┘
      │                 │
      └────────┬────────┘
               │
    ┌──────────▼──────────┐
    │  Vaccine Records    │
    │ (Encrypted Data)    │
    │ + Access Controls   │
    └─────────────────────┘
```

## Contract Structure

### State Variables

#### Core Data
```solidity
address public healthAuthority;           // System admin
uint256 public totalRecords;              // Record counter

mapping(uint256 => VaccineRecord) public vaccineRecords;
mapping(address => bool) public authorizedDoctors;
mapping(address => mapping(uint256 => AccessPermission))
    public accessPermissions;
mapping(address => uint256[]) public userRecords;
```

#### Data Structures

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

struct AccessPermission {
    bool canView;
    bool canUpdate;
    uint256 expiryTime;
    bool isActive;
}
```

## Core Functions

### 1. Doctor Management

#### Authorize Doctor
- **Caller**: Health Authority only
- **Action**: Add doctor to authorized list
- **Effect**: Doctor can now record vaccinations
- **Event**: DoctorAuthorized

```solidity
function authorizeDoctor(address doctor) external onlyHealthAuthority
```

#### Revoke Doctor
- **Caller**: Health Authority only
- **Action**: Remove from authorized list
- **Effect**: Doctor cannot record new vaccinations
- **Event**: DoctorRevoked

```solidity
function revokeDoctor(address doctor) external onlyHealthAuthority
```

### 2. Record Management

#### Record Vaccination
- **Caller**: Authorized doctors
- **Action**: Create new encrypted vaccine record
- **Encryption**: All sensitive fields encrypted
- **Permissions**: Auto-grant to patient and doctor
- **Event**: VaccineRecorded

```solidity
function recordVaccination(
    address patient,
    uint32 personId,
    uint8 vaccineType,
    uint32 vaccineDate,
    uint8 doseNumber,
    uint32 batchNumber
) external onlyAuthorizedDoctor
```

#### Update Vaccination
- **Caller**: Record owner or authorized updater
- **Action**: Modify specific fields
- **Encryption**: Updated fields re-encrypted
- **Permissions**: FHE permissions updated
- **Event**: RecordUpdated

```solidity
function updateVaccineRecord(
    uint256 recordId,
    uint8 newVaccineType,
    uint32 newVaccineDate,
    uint8 newDoseNumber,
    uint32 newBatchNumber
) external onlyRecordOwnerOrAuthorized
```

#### Deactivate Record
- **Caller**: Doctor or health authority
- **Action**: Mark record as inactive
- **Effect**: Record no longer accessible
- **Reversible**: No (by design)

```solidity
function deactivateRecord(uint256 recordId) external
```

### 3. Access Control

#### Grant Access
- **Caller**: Record owner (patient)
- **Action**: Give user time-limited access
- **Granularity**: Separate view/update perms
- **FHE**: Auto-grant FHE permissions if view access
- **Event**: AccessGranted

```solidity
function grantAccess(
    address accessor,
    uint256 recordId,
    bool canView,
    bool canUpdate,
    uint256 durationInDays
) external
```

#### Revoke Access
- **Caller**: Record owner (patient)
- **Action**: Immediately revoke access
- **Effect**: Instant, no grace period
- **Event**: AccessRevoked

```solidity
function revokeAccess(
    address accessor,
    uint256 recordId
) external
```

### 4. Query Functions

#### User Records
```solidity
function getUserRecords(address user) external view returns (uint256[])
```

#### Record Info
```solidity
function getRecordInfo(uint256 recordId) external view returns (
    bool isActive,
    uint256 timestamp,
    address authorizedDoctor
)
```

#### Access Permission
```solidity
function getAccessPermission(address user, uint256 recordId)
    external view returns (
    bool canView,
    bool canUpdate,
    uint256 expiryTime,
    bool isActive
)
```

#### Ownership Check
```solidity
function hasOwnershipOfRecord(address user, uint256 recordId)
    public view returns (bool)
```

#### Access Check
```solidity
function hasAccessPermission(address user, uint256 recordId)
    public view returns (bool)
```

## Access Control Model

### Modifiers

```solidity
// Only health authority
modifier onlyHealthAuthority()

// Only authorized doctors
modifier onlyAuthorizedDoctor()

// Only owner or authorized
modifier onlyRecordOwnerOrAuthorized(uint256 recordId)
```

### Permission Hierarchy

1. **Health Authority** (Highest)
   - Manage doctors
   - Deactivate any record

2. **Creating Doctor** (Medium)
   - Update own records
   - View own records
   - Cannot grant/revoke access

3. **Record Owner/Patient** (Medium)
   - Full access to own records
   - Grant/revoke access
   - Cannot update

4. **Granted Users** (Lower)
   - Only granted permissions
   - Time-limited
   - Can be revoked

5. **Unauthorized** (Lowest)
   - No access

## Data Flow

### Vaccination Recording Flow

```
Doctor calls recordVaccination()
    ↓
Validate inputs
    ↓
Encrypt all sensitive fields (euint32, euint8)
    ↓
Create VaccineRecord struct
    ↓
Store in vaccineRecords mapping
    ↓
Set FHE permissions (allowThis + allow)
    ↓
Auto-grant patient access
    ↓
Add to userRecords tracking
    ↓
Emit VaccineRecorded event
```

### Access Granting Flow

```
Patient calls grantAccess()
    ↓
Verify caller owns record
    ↓
Calculate expiry time
    ↓
Create AccessPermission
    ↓
Store in accessPermissions
    ↓
If canView: Grant FHE.allow() permissions
    ↓
Emit AccessGranted event
```

### Record Verification Flow

```
User calls verifyVaccineRecord()
    ↓
Check hasAccessPermission()
    ↓
Create encrypted comparison
    ↓
Return ebool result
    ↓
User can decrypt result
```

## Encryption Strategy

### Fields Encrypted
- Person ID (euint32)
- Vaccine type (euint8)
- Vaccination date (euint32)
- Dose number (euint8)
- Batch number (euint32)

### Fields Not Encrypted
- Is active (bool) - no sensitive info
- Timestamp (uint256) - historical marker
- Authorized doctor (address) - needed for auth

### Permission Grant Flow

```
FHE.allowThis(encryptedValue)  // Contract can use
    ↓
FHE.allow(encryptedValue, user) // User can decrypt
```

## Gas Optimization

### Storage Packing
```solidity
// Minimal storage usage
// Each record uses optimized struct

// Consider: Could pack more if needed
// - isActive could be part of byte flag
// - Timestamp could be uint32
```

### Operation Efficiency
```solidity
// Efficient loops (limited by design)
// No nested mappings beyond 2 levels
// Direct lookups where possible
```

### Cost Estimates

```
recordVaccination(): ~2.5M gas
    - Encryption operations
    - Storage writes
    - FHE permission grants

updateVaccineRecord(): ~1M gas
    - Selective updates
    - Permission updates

grantAccess(): ~500k gas
    - Mapping write
    - Conditional FHE.allow()
```

## Security Considerations

### Input Validation
```solidity
require(patient != address(0), "Invalid patient");
require(vaccineType > 0 && vaccineType <= 10, "Invalid type");
require(doseNumber > 0 && doseNumber <= 5, "Invalid dose");
```

### Access Checks
```solidity
// All sensitive operations check permissions
// No bypasses
// Consistent enforcement
```

### Encryption Guarantees
```solidity
// All sensitive data encrypted
// Contract cannot read encrypted values
// Only FHE operations available
```

## Extension Points

### Future Enhancements

1. **Multi-record Operations**
   - Batch record creation
   - Bulk access grants

2. **Additional Encrypted Types**
   - euint64 for larger numbers
   - ebool for encrypted conditions

3. **Advanced Permissions**
   - Conditional access (based on other data)
   - Delegated access (grant permission to grant)

4. **Integration**
   - Oracle integration for verification
   - Cross-chain support

## Testing Coverage

The test suite covers:

- ✅ Doctor authorization
- ✅ Vaccination recording
- ✅ Record updates
- ✅ Access grants/revokes
- ✅ Permission expiry
- ✅ Access verification
- ✅ Edge cases
- ✅ Security checks
- ✅ Event emissions

## Performance Characteristics

### Time Complexity
- Authorization: O(1)
- Record creation: O(1)
- Access grant: O(1)
- Permission check: O(1)
- User records lookup: O(1)

### Space Complexity
- Per record: O(1)
- Total: O(n) where n = number of records

## Related Concepts

- [Access Control](access-control.md)
- [Encryption Operations](encryption-operations.md)
- [Permission Management](permission-management.md)

## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity Best Practices](https://docs.soliditylang.org/)

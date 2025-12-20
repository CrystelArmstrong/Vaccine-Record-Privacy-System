// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract VaccineRecordPrivacy is SepoliaConfig {

    address public healthAuthority;
    uint256 public totalRecords;

    struct VaccineRecord {
        euint32 encryptedPersonId;      // Encrypted personal ID
        euint8 encryptedVaccineType;    // Encrypted vaccine type (1=COVID, 2=Flu, 3=Hepatitis, etc.)
        euint32 encryptedVaccineDate;   // Encrypted vaccination date (timestamp)
        euint8 encryptedDoseNumber;     // Encrypted dose number (1st, 2nd, 3rd dose)
        euint32 encryptedBatchNumber;   // Encrypted batch number
        bool isActive;                  // Whether record is active
        uint256 timestamp;              // Record creation time
        address authorizedDoctor;       // Authorized doctor
    }

    struct AccessPermission {
        bool canView;                   // View permission
        bool canUpdate;                 // Update permission
        uint256 expiryTime;             // Permission expiry time
        bool isActive;                  // Whether permission is active
    }

    mapping(uint256 => VaccineRecord) public vaccineRecords;
    mapping(address => mapping(uint256 => AccessPermission)) public accessPermissions;
    mapping(address => bool) public authorizedDoctors;
    mapping(address => uint256[]) public userRecords; // User's record ID list

    event VaccineRecorded(uint256 indexed recordId, address indexed patient, address indexed doctor);
    event AccessGranted(address indexed patient, address indexed accessor, uint256 recordId);
    event AccessRevoked(address indexed patient, address indexed accessor, uint256 recordId);
    event DoctorAuthorized(address indexed doctor);
    event DoctorRevoked(address indexed doctor);
    event RecordUpdated(uint256 indexed recordId, address indexed updater);

    modifier onlyHealthAuthority() {
        require(msg.sender == healthAuthority, "Not authorized health authority");
        _;
    }

    modifier onlyAuthorizedDoctor() {
        require(authorizedDoctors[msg.sender], "Not an authorized doctor");
        _;
    }

    modifier onlyRecordOwnerOrAuthorized(uint256 recordId) {
        require(
            hasAccessPermission(msg.sender, recordId) ||
            vaccineRecords[recordId].authorizedDoctor == msg.sender,
            "No access permission"
        );
        _;
    }

    constructor() {
        healthAuthority = msg.sender;
        totalRecords = 0;
    }

    // Authorize doctor
    function authorizeDoctor(address doctor) external onlyHealthAuthority {
        authorizedDoctors[doctor] = true;
        emit DoctorAuthorized(doctor);
    }

    // Revoke doctor authorization
    function revokeDoctor(address doctor) external onlyHealthAuthority {
        authorizedDoctors[doctor] = false;
        emit DoctorRevoked(doctor);
    }

    // Record vaccination information (only authorized doctors can do this)
    function recordVaccination(
        address patient,
        uint32 personId,
        uint8 vaccineType,
        uint32 vaccineDate,
        uint8 doseNumber,
        uint32 batchNumber
    ) external onlyAuthorizedDoctor {
        require(patient != address(0), "Invalid patient address");
        require(vaccineType > 0 && vaccineType <= 10, "Invalid vaccine type");
        require(doseNumber > 0 && doseNumber <= 5, "Invalid dose number");

        totalRecords++;
        uint256 recordId = totalRecords;

        // Encrypt sensitive information
        euint32 encryptedPersonId = FHE.asEuint32(personId);
        euint8 encryptedVaccineType = FHE.asEuint8(vaccineType);
        euint32 encryptedVaccineDate = FHE.asEuint32(vaccineDate);
        euint8 encryptedDoseNumber = FHE.asEuint8(doseNumber);
        euint32 encryptedBatchNumber = FHE.asEuint32(batchNumber);

        vaccineRecords[recordId] = VaccineRecord({
            encryptedPersonId: encryptedPersonId,
            encryptedVaccineType: encryptedVaccineType,
            encryptedVaccineDate: encryptedVaccineDate,
            encryptedDoseNumber: encryptedDoseNumber,
            encryptedBatchNumber: encryptedBatchNumber,
            isActive: true,
            timestamp: block.timestamp,
            authorizedDoctor: msg.sender
        });

        // Set ACL permissions
        FHE.allowThis(encryptedPersonId);
        FHE.allowThis(encryptedVaccineType);
        FHE.allowThis(encryptedVaccineDate);
        FHE.allowThis(encryptedDoseNumber);
        FHE.allowThis(encryptedBatchNumber);

        // Grant access to patient and doctor
        FHE.allow(encryptedPersonId, patient);
        FHE.allow(encryptedVaccineType, patient);
        FHE.allow(encryptedVaccineDate, patient);
        FHE.allow(encryptedDoseNumber, patient);
        FHE.allow(encryptedBatchNumber, patient);

        FHE.allow(encryptedPersonId, msg.sender);
        FHE.allow(encryptedVaccineType, msg.sender);
        FHE.allow(encryptedVaccineDate, msg.sender);
        FHE.allow(encryptedDoseNumber, msg.sender);
        FHE.allow(encryptedBatchNumber, msg.sender);

        // Add to user records list
        userRecords[patient].push(recordId);

        // Automatically grant patient access permission
        accessPermissions[patient][recordId] = AccessPermission({
            canView: true,
            canUpdate: false,
            expiryTime: block.timestamp + 365 days, // 1 year validity
            isActive: true
        });

        emit VaccineRecorded(recordId, patient, msg.sender);
    }

    // Grant access permission (only record owner can do this)
    function grantAccess(
        address accessor,
        uint256 recordId,
        bool canView,
        bool canUpdate,
        uint256 durationInDays
    ) external {
        require(vaccineRecords[recordId].isActive, "Record not active");
        require(hasOwnershipOfRecord(msg.sender, recordId), "Not record owner");
        require(accessor != address(0), "Invalid accessor address");

        uint256 expiryTime = block.timestamp + (durationInDays * 1 days);

        accessPermissions[accessor][recordId] = AccessPermission({
            canView: canView,
            canUpdate: canUpdate,
            expiryTime: expiryTime,
            isActive: true
        });

        // If view permission is granted, give FHE access permission
        if (canView) {
            VaccineRecord storage record = vaccineRecords[recordId];
            FHE.allow(record.encryptedPersonId, accessor);
            FHE.allow(record.encryptedVaccineType, accessor);
            FHE.allow(record.encryptedVaccineDate, accessor);
            FHE.allow(record.encryptedDoseNumber, accessor);
            FHE.allow(record.encryptedBatchNumber, accessor);
        }

        emit AccessGranted(msg.sender, accessor, recordId);
    }

    // Revoke access permission
    function revokeAccess(address accessor, uint256 recordId) external {
        require(hasOwnershipOfRecord(msg.sender, recordId), "Not record owner");

        accessPermissions[accessor][recordId].isActive = false;

        emit AccessRevoked(msg.sender, accessor, recordId);
    }

    // Update vaccine record (only authorized persons can do this)
    function updateVaccineRecord(
        uint256 recordId,
        uint8 newVaccineType,
        uint32 newVaccineDate,
        uint8 newDoseNumber,
        uint32 newBatchNumber
    ) external onlyRecordOwnerOrAuthorized(recordId) {
        require(vaccineRecords[recordId].isActive, "Record not active");
        require(accessPermissions[msg.sender][recordId].canUpdate ||
                vaccineRecords[recordId].authorizedDoctor == msg.sender,
                "No update permission");

        VaccineRecord storage record = vaccineRecords[recordId];

        if (newVaccineType > 0) {
            record.encryptedVaccineType = FHE.asEuint8(newVaccineType);
            FHE.allowThis(record.encryptedVaccineType);
        }

        if (newVaccineDate > 0) {
            record.encryptedVaccineDate = FHE.asEuint32(newVaccineDate);
            FHE.allowThis(record.encryptedVaccineDate);
        }

        if (newDoseNumber > 0) {
            record.encryptedDoseNumber = FHE.asEuint8(newDoseNumber);
            FHE.allowThis(record.encryptedDoseNumber);
        }

        if (newBatchNumber > 0) {
            record.encryptedBatchNumber = FHE.asEuint32(newBatchNumber);
            FHE.allowThis(record.encryptedBatchNumber);
        }

        emit RecordUpdated(recordId, msg.sender);
    }

    // Check if user has access permission
    function hasAccessPermission(address user, uint256 recordId) public view returns (bool) {
        AccessPermission memory permission = accessPermissions[user][recordId];
        return permission.isActive &&
               permission.canView &&
               block.timestamp <= permission.expiryTime;
    }

    // Check if user owns the record
    function hasOwnershipOfRecord(address user, uint256 recordId) public view returns (bool) {
        uint256[] memory records = userRecords[user];
        for (uint i = 0; i < records.length; i++) {
            if (records[i] == recordId) {
                return true;
            }
        }
        return false;
    }

    // Get all record IDs of a user
    function getUserRecords(address user) external view returns (uint256[] memory) {
        return userRecords[user];
    }

    // Get basic record information (non-encrypted part)
    function getRecordInfo(uint256 recordId) external view returns (
        bool isActive,
        uint256 timestamp,
        address authorizedDoctor
    ) {
        VaccineRecord memory record = vaccineRecords[recordId];
        return (
            record.isActive,
            record.timestamp,
            record.authorizedDoctor
        );
    }

    // Get access permission information
    function getAccessPermission(address user, uint256 recordId) external view returns (
        bool canView,
        bool canUpdate,
        uint256 expiryTime,
        bool isActive
    ) {
        AccessPermission memory permission = accessPermissions[user][recordId];
        return (
            permission.canView,
            permission.canUpdate,
            permission.expiryTime,
            permission.isActive
        );
    }

    // Verify vaccine record (for asynchronous decryption verification)
    function verifyVaccineRecord(uint256 recordId, uint32 expectedPersonId) external returns (ebool) {
        require(hasAccessPermission(msg.sender, recordId), "No access permission");
        VaccineRecord memory record = vaccineRecords[recordId];

        euint32 expectedId = FHE.asEuint32(expectedPersonId);
        return FHE.eq(record.encryptedPersonId, expectedId);
    }

    // Deactivate record
    function deactivateRecord(uint256 recordId) external {
        require(
            vaccineRecords[recordId].authorizedDoctor == msg.sender ||
            msg.sender == healthAuthority,
            "Not authorized"
        );

        vaccineRecords[recordId].isActive = false;
    }

    // Get statistics
    function getStatistics() external view returns (
        uint256 totalActiveRecords,
        uint256 totalAuthorizedDoctors
    ) {
        uint256 activeRecords = 0;
        for (uint256 i = 1; i <= totalRecords; i++) {
            if (vaccineRecords[i].isActive) {
                activeRecords++;
            }
        }

        // Simplified statistics, may need more complex logic in production
        return (activeRecords, totalRecords);
    }
}

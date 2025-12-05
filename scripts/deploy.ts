/**
 * @title Deployment Script for Vaccine Record Privacy Contract
 * @notice Deploys the VaccineRecordPrivacy contract to the specified network
 * @dev Uses Hardhat for deployment with proper verification and logging
 *
 * @chapter: deployment
 * @category: scripts
 * @concept: contract-deployment, initialization
 *
 * Usage:
 * - Local: npx hardhat run scripts/deploy.ts
 * - Sepolia: npx hardhat run scripts/deploy.ts --network sepolia
 * - Zama Devnet: npx hardhat run scripts/deploy.ts --network zamaDevnet
 */

import { ethers } from "hardhat";

/**
 * @notice Main deployment function
 * @dev Deploys VaccineRecordPrivacy and initializes the system
 */
async function main() {
  console.log("🚀 Starting Vaccine Record Privacy System Deployment...\n");

  /**
   * Get deployment account
   * @dev The deployer will become the health authority
   */
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deployment Configuration:");
  console.log("   Deployer address:", deployer.address);
  console.log("   Network:", (await ethers.provider.getNetwork()).name);
  console.log("   Chain ID:", (await ethers.provider.getNetwork()).chainId);

  /**
   * Check deployer balance
   * @concept: deployment-verification
   */
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("   Deployer balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no funds. Please add ETH to deploy.");
  }

  /**
   * Deploy VaccineRecordPrivacy contract
   * @concept: contract-deployment, fhe-initialization
   */
  console.log("📦 Deploying VaccineRecordPrivacy contract...");
  const VaccineRecordPrivacy = await ethers.getContractFactory("VaccineRecordPrivacy");
  const vaccineContract = await VaccineRecordPrivacy.deploy();

  await vaccineContract.waitForDeployment();
  const contractAddress = await vaccineContract.getAddress();

  console.log("✅ VaccineRecordPrivacy deployed successfully!");
  console.log("   Contract address:", contractAddress);
  console.log("   Health Authority:", deployer.address);
  console.log("   Transaction hash:", vaccineContract.deploymentTransaction()?.hash);

  /**
   * Verify deployment by reading contract state
   * @concept: deployment-verification
   */
  console.log("\n🔍 Verifying deployment...");
  const healthAuthority = await vaccineContract.healthAuthority();
  const totalRecords = await vaccineContract.totalRecords();

  console.log("   Health Authority (verified):", healthAuthority);
  console.log("   Total Records:", totalRecords.toString());

  if (healthAuthority !== deployer.address) {
    throw new Error("❌ Deployment verification failed: Health authority mismatch");
  }

  /**
   * Display post-deployment instructions
   */
  console.log("\n📝 Post-Deployment Instructions:");
  console.log("   1. Save the contract address:", contractAddress);
  console.log("   2. To authorize doctors, run:");
  console.log(`      await contract.authorizeDoctor("DOCTOR_ADDRESS")`);
  console.log("   3. To verify on Etherscan (if on Sepolia):");
  console.log(`      npx hardhat verify --network sepolia ${contractAddress}`);
  console.log("\n✨ Deployment completed successfully!");

  /**
   * Export deployment information
   * @concept: deployment-artifacts
   */
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    healthAuthority: healthAuthority,
    deploymentTime: new Date().toISOString(),
    deployerBalance: ethers.formatEther(balance),
  };

  console.log("\n📄 Deployment Information:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

/**
 * Execute deployment with error handling
 */
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

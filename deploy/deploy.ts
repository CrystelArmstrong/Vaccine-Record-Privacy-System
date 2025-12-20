import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * @title Deployment Function for Vaccine Record Privacy System
 * @notice Deploys the VaccineRecordPrivacy contract using hardhat-deploy
 * @dev Follows the standard hardhat-deploy pattern for deployment management
 *
 * @chapter: deployment
 * @category: automation
 * @concept: contract-deployment, fhe-initialization
 *
 * This deployment script demonstrates how to deploy FHEVM contracts with proper
 * configuration and verification.
 */

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🚀 Deploying Vaccine Record Privacy System...");
  console.log("   Deployer:", deployer);
  console.log("   Network:", hre.network.name);

  /**
   * Deploy VaccineRecordPrivacy contract
   * @concept: fhevm-deployment
   *
   * The contract inherits from SepoliaConfig which sets up FHEVM parameters.
   * The deployer automatically becomes the health authority.
   */
  const deployedVaccineContract = await deploy("VaccineRecordPrivacy", {
    from: deployer,
    log: true,
    waitConfirmations: hre.network.name === "hardhat" ? 1 : 3,
  });

  console.log("\n✅ VaccineRecordPrivacy deployed successfully!");
  console.log("   Contract address:", deployedVaccineContract.address);
  console.log("   Health Authority:", deployer);
  console.log("   Transaction hash:", deployedVaccineContract.transactionHash);

  /**
   * Display post-deployment instructions
   * @concept: deployment-verification
   */
  console.log("\n📝 Next Steps:");
  console.log("   1. Authorize doctors:");
  console.log(`      await contract.authorizeDoctor("DOCTOR_ADDRESS")`);
  console.log("   2. Record vaccinations:");
  console.log(`      await contract.recordVaccination(...)`);
  console.log("   3. Grant access permissions as needed");

  /**
   * Verification information
   */
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 To verify on Etherscan:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${deployedVaccineContract.address}`);
  }

  return true;
};

export default func;
func.id = "deploy_vaccine_record_privacy";
func.tags = ["VaccineRecordPrivacy", "healthcare", "privacy"];

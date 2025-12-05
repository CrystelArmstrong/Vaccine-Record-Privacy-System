/**
 * @title Hardhat Configuration for FHEVM Vaccine Privacy Example
 * @notice This configuration sets up the Hardhat environment for developing
 * privacy-preserving vaccine record contracts using Zama's FHEVM
 * @dev Configuration includes Sepolia testnet and local development settings
 *
 * @chapter: configuration
 * @category: setup
 */

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * @notice Hardhat configuration object
 * @dev Configures Solidity version, networks, and development tools
 */
const config: HardhatUserConfig = {
  // Solidity compiler version compatible with FHEVM
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun"
    },
  },

  // Network configurations
  networks: {
    // Local Hardhat network for testing
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000" // 10000 ETH
      }
    },

    // Sepolia testnet configuration for FHEVM
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
    },

    // Zama Devnet (if applicable)
    zamaDevnet: {
      url: process.env.ZAMA_RPC_URL || "https://devnet.zama.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8009,
    }
  },

  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report",
    noColors: true,
  },

  // Path configurations
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  // TypeChain configuration for type-safe contract interactions
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },

  // Mocha test configuration
  mocha: {
    timeout: 200000, // 200 seconds for FHE operations
  },
};

export default config;

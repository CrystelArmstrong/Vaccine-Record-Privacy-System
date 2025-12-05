/**
 * @title FHEVM Example Scaffolding Tool
 * @notice CLI tool to generate new FHEVM example repositories
 * @dev Creates standalone Hardhat-based examples from templates
 *
 * @chapter: automation
 * @category: scaffolding
 * @concept: project-generation, automation
 *
 * This tool demonstrates the bounty requirement for automated scaffolding
 * that can generate standalone FHEVM example repositories.
 *
 * Usage:
 * npm run scaffold -- --name "MyExample" --category "healthcare"
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExampleConfig {
  name: string;
  category: string;
  description?: string;
}

/**
 * @notice Main scaffolding function
 * @dev Creates a new FHEVM example repository
 * @param config Configuration for the new example
 */
async function createExample(config: ExampleConfig): Promise<void> {
  console.log(`🔨 Creating FHEVM Example: ${config.name}`);
  console.log(`   Category: ${config.category}\n`);

  const exampleDir = path.join(process.cwd(), '..', config.name);

  /**
   * Check if directory already exists
   * @concept: validation
   */
  if (fs.existsSync(exampleDir)) {
    throw new Error(`Directory ${config.name} already exists!`);
  }

  /**
   * Create directory structure
   * @concept: project-structure
   */
  console.log('📁 Creating directory structure...');
  fs.mkdirSync(exampleDir);
  fs.mkdirSync(path.join(exampleDir, 'contracts'));
  fs.mkdirSync(path.join(exampleDir, 'test'));
  fs.mkdirSync(path.join(exampleDir, 'scripts'));
  fs.mkdirSync(path.join(exampleDir, 'docs'));

  /**
   * Copy base configuration files
   * @concept: template-generation
   */
  console.log('📋 Generating configuration files...');

  // Copy package.json
  const packageJson = generatePackageJson(config);
  fs.writeFileSync(
    path.join(exampleDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Copy hardhat.config.ts
  const currentDir = process.cwd();
  if (fs.existsSync(path.join(currentDir, 'hardhat.config.ts'))) {
    fs.copyFileSync(
      path.join(currentDir, 'hardhat.config.ts'),
      path.join(exampleDir, 'hardhat.config.ts')
    );
  }

  // Create README
  const readme = generateReadme(config);
  fs.writeFileSync(path.join(exampleDir, 'README.md'), readme);

  // Create .env.example
  const envExample = generateEnvExample();
  fs.writeFileSync(path.join(exampleDir, '.env.example'), envExample);

  // Create .gitignore
  const gitignore = generateGitignore();
  fs.writeFileSync(path.join(exampleDir, '.gitignore'), gitignore);

  console.log('✅ Example repository created successfully!');
  console.log(`\n📦 Next steps:`);
  console.log(`   1. cd ../${config.name}`);
  console.log(`   2. npm install`);
  console.log(`   3. Add your contract to contracts/`);
  console.log(`   4. Add tests to test/`);
  console.log(`   5. npm test`);
}

/**
 * @notice Generate package.json for new example
 * @concept: template-generation
 */
function generatePackageJson(config: ExampleConfig): object {
  return {
    name: `fhevm-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
    version: "1.0.0",
    description: config.description || `FHEVM example demonstrating ${config.name}`,
    main: "index.js",
    scripts: {
      test: "hardhat test",
      compile: "hardhat compile",
      deploy: "hardhat run scripts/deploy.ts",
      node: "hardhat node"
    },
    keywords: ["fhevm", "zama", "privacy", config.category, "blockchain"],
    author: "FHEVM Developer",
    license: "MIT",
    devDependencies: {
      "@nomicfoundation/hardhat-toolbox": "^4.0.0",
      "@typechain/ethers-v6": "^0.5.1",
      "@typechain/hardhat": "^9.1.0",
      "@types/chai": "^4.3.11",
      "@types/mocha": "^10.0.6",
      "@types/node": "^20.10.6",
      "chai": "^4.3.10",
      "ethers": "^6.9.2",
      "hardhat": "^2.19.4",
      "ts-node": "^10.9.2",
      "typescript": "^5.3.3"
    },
    dependencies: {
      "@fhevm/core": "^0.4.0",
      "@fhevm/solidity": "^0.4.0",
      "dotenv": "^16.3.1"
    }
  };
}

/**
 * @notice Generate README for new example
 * @concept: documentation-generation
 */
function generateReadme(config: ExampleConfig): string {
  return `# ${config.name} - FHEVM Example

${config.description || `This example demonstrates ${config.name} using FHEVM.`}

## Category
${config.category}

## Overview
This is a standalone Hardhat-based FHEVM example repository demonstrating privacy-preserving smart contracts using Zama's Fully Homomorphic Encryption.

## Features
- ✅ Encrypted data storage
- ✅ Access control management
- ✅ Comprehensive test suite
- ✅ Production-ready deployment scripts

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

1. Copy the environment template:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Fill in your configuration:
- Add your private key
- Add RPC URLs

## Usage

### Compile contracts
\`\`\`bash
npm run compile
\`\`\`

### Run tests
\`\`\`bash
npm test
\`\`\`

### Deploy
\`\`\`bash
npm run deploy
\`\`\`

## FHEVM Concepts Demonstrated
- Encrypted data types (euint8, euint32)
- Access control (FHE.allow, FHE.allowThis)
- Privacy-preserving operations

## Project Structure
\`\`\`
├── contracts/       # Solidity contracts
├── test/           # Test files
├── scripts/        # Deployment scripts
├── docs/           # Documentation
└── README.md       # This file
\`\`\`

## License
MIT

## Contributing
This project is part of the Zama FHEVM Bounty Program December 2025.
`;
}

/**
 * @notice Generate .env.example template
 * @concept: configuration-template
 */
function generateEnvExample(): string {
  return `# Private key for deployment (DO NOT COMMIT REAL KEYS)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ZAMA_RPC_URL=https://devnet.zama.ai

# Optional: Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas reporting
REPORT_GAS=false
`;
}

/**
 * @notice Generate .gitignore file
 * @concept: project-setup
 */
function generateGitignore(): string {
  return `# Dependencies
node_modules/

# Environment variables
.env

# Hardhat files
cache/
artifacts/
typechain-types/

# Test coverage
coverage/
coverage.json

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build files
dist/
build/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
}

/**
 * @notice Parse command line arguments
 */
function parseArgs(): ExampleConfig {
  const args = process.argv.slice(2);
  const config: Partial<ExampleConfig> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];

    if (key === 'name') config.name = value;
    if (key === 'category') config.category = value;
    if (key === 'description') config.description = value;
  }

  if (!config.name || !config.category) {
    console.error('Usage: npm run scaffold -- --name "ExampleName" --category "category" [--description "Description"]');
    process.exit(1);
  }

  return config as ExampleConfig;
}

/**
 * Execute scaffolding with error handling
 */
if (require.main === module) {
  const config = parseArgs();
  createExample(config)
    .then(() => {
      console.log('\n✨ Scaffolding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Scaffolding failed:');
      console.error(error.message);
      process.exit(1);
    });
}

export { createExample, ExampleConfig };

const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

// The correct deployContract function
const correctFunction = `        async function deployContract() {
            if (!signer) {
                showStatus('error', 'Please connect your wallet first');
                return;
            }

            try {
                showStatus('info', 'Connecting to contract...');

                // Connect to existing contract
                contractAddress = '0x4D82dfC59a1fEf9B41DE0130D3A075d27BFe87ab';
                contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

                document.getElementById('contractAddress').textContent = contractAddress;
                showStatus('success', \`Connected to contract at: \${contractAddress}\`);

                // Load initial data
                await loadContractData();

            } catch (error) {
                console.error('Error connecting to contract:', error);
                showStatus('error', \`Failed to connect to contract: \${error.message}\`);
            }
        }

        async function loadContractData() {`;

// Find the start of deployContract and loadContractData
const deployStart = content.indexOf('        async function deployContract()');
const loadContractDataStart = content.indexOf('        async function loadContractData() {');

if (deployStart === -1 || loadContractDataStart === -1) {
    console.error('Could not find functions');
    process.exit(1);
}

// Replace the section
const newContent = content.substring(0, deployStart) + correctFunction + content.substring(loadContractDataStart + '        async function loadContractData() {'.length);

fs.writeFileSync('index.html', newContent, 'utf8');
console.log('Successfully fixed deployContract function');

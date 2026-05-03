const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.join(__dirname, '..', 'contracts', 'MultiSigTreasury.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'MultiSigTreasury.sol': {
      content: source
    }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

// Find imported files in node_modules
function findImport(file) {
  if (file.startsWith('@openzeppelin/contracts/')) {
    const modulePath = path.join(__dirname, '..', 'node_modules', file);
    if (fs.existsSync(modulePath)) {
      return { contents: fs.readFileSync(modulePath, 'utf8') };
    }
  }
  return { error: 'File not found: ' + file };
}

const output = solc.compile(JSON.stringify(input), { import: findImport });

const result = JSON.parse(output);

if (result.errors) {
  result.errors.forEach(err => console.error(err.formattedMessage || err.message));
}

const contract = result.contracts && result.contracts['MultiSigTreasury.sol'] 
  ? result.contracts['MultiSigTreasury.sol']['MultiSigTreasury'] 
  : null;

if (contract) {
  // Ensure artifacts directory exists
  const artifactsDir = path.join(__dirname, '..', 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(artifactsDir, 'MultiSigTreasury.json'),
    JSON.stringify({
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object
    }, null, 2)
  );

  console.log('✅ Contract compiled successfully!');
  console.log('📄 ABI saved to artifacts/MultiSigTreasury.json');
  console.log('📦 Bytecode size:', contract.evm.bytecode.object.length / 2, 'bytes');
} else {
  console.log('❌ Compilation failed - no contract output');
}

const solc = require('solc');
const fs = require('fs');
const path = require('path');

const input = {
  language: 'Solidity',
  sources: {
    'MultiSigTreasury.sol': {
      content: fs.readFileSync('MultiSigTreasury.sol', 'utf8')
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for errors
if (output.errors) {
  output.errors.forEach(error => {
    console.log(error.formattedMessage || error.message);
  });
}

// Create artifacts directory
if (!fs.existsSync('artifacts')) {
  fs.mkdirSync('artifacts', { recursive: true });
}

if (output.contracts && output.contracts['MultiSigTreasury.sol']) {
  const contract = output.contracts['MultiSigTreasury.sol'].MultiSigTreasury;
  
  // Save ABI
  fs.writeFileSync(
    'artifacts/abi.json',
    JSON.stringify(contract.abi, null, 2)
  );

  // Save Bytecode
  fs.writeFileSync(
    'artifacts/bytecode.txt',
    contract.evm.bytecode.object
  );

  console.log('Compilation successful!');
  console.log('ABI saved to artifacts/abi.json');
  console.log('Bytecode saved to artifacts/bytecode.txt');
} else {
  console.log('Compilation failed - no contract output');
}

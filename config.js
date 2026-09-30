window.APP_CONFIG = {
 "contract": "0x8632e439055499668a41305f60f107B88AB3EE77",
 "chainId": 4663,
 "chainName": "Robinhood Chain",
 "chainIdHex": "0x1237",
 "rpcUrl": "https://rpc.mainnet.chain.robinhood.com",
 "explorer": "https://robin.etherscan.io",
 "abi": [
  {
   "inputs": [
    {
     "internalType": "address",
     "name": "owner",
     "type": "address"
    }
   ],
   "name": "balanceOf",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "cost",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "freeMint",
   "outputs": [],
   "stateMutability": "nonpayable",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "freeMintCooldown",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [
    {
     "internalType": "address",
     "name": "",
     "type": "address"
    }
   ],
   "name": "freeMintsPerWallet",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "freeMintSupply",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "freeNFTAlreadyMinted",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "lastFreeMintTimestamp",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "maxFreeMintAmountPerWallet",
   "outputs": [
    {
     "internalType": "uint8",
     "name": "",
     "type": "uint8"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "maxMintAmountPerTx",
   "outputs": [
    {
     "internalType": "uint8",
     "name": "",
     "type": "uint8"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "maxPaidMintAmountPerWallet",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "maxSupply",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [
    {
     "internalType": "uint256",
     "name": "_mintAmount",
     "type": "uint256"
    }
   ],
   "name": "mint",
   "outputs": [],
   "stateMutability": "payable",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "name",
   "outputs": [
    {
     "internalType": "string",
     "name": "",
     "type": "string"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [
    {
     "internalType": "address",
     "name": "",
     "type": "address"
    }
   ],
   "name": "paidMintsPerWallet",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "paidMintSupply",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "paidNFTAlreadyMinted",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "paused",
   "outputs": [
    {
     "internalType": "bool",
     "name": "",
     "type": "bool"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "payoutReceiver",
   "outputs": [
    {
     "internalType": "address",
     "name": "",
     "type": "address"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "symbol",
   "outputs": [
    {
     "internalType": "string",
     "name": "",
     "type": "string"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "totalSupply",
   "outputs": [
    {
     "internalType": "uint256",
     "name": "",
     "type": "uint256"
    }
   ],
   "stateMutability": "view",
   "type": "function"
  },
  {
   "inputs": [],
   "name": "ApprovalCallerNotOwnerNorApproved",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "ApprovalQueryForNonexistentToken",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "ApprovalToCurrentOwner",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "ApproveToCaller",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "BalanceQueryForZeroAddress",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "MintToZeroAddress",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "MintZeroQuantity",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "OwnerQueryForNonexistentToken",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "TransferCallerNotOwnerNorApproved",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "TransferFromIncorrectOwner",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "TransferToNonERC721ReceiverImplementer",
   "type": "error"
  },
  {
   "inputs": [],
   "name": "TransferToZeroAddress",
   "type": "error"
  }
 ]
};

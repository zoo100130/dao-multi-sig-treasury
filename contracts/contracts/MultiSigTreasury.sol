// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MultiSigTreasury
 * @notice DAO Multi-Sig Treasury Contract
 */
contract MultiSigTreasury is AccessControl {
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    
    // Signature thresholds
    uint256 public constant THRESHOLD_LOW = 2;      // < 10 ETH needs 2 signatures
    uint256 public constant THRESHOLD_MEDIUM = 3;  // 10-100 ETH needs 3 signatures
    uint256 public constant THRESHOLD_HIGH = 5;    // > 100 ETH needs 5 signatures
    
    uint256 public constant LOW_LIMIT = 10 ether;
    uint256 public constant MEDIUM_LIMIT = 100 ether;
    
    // Transaction structure
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 signatures;
        uint256 executionTime;
    }
    
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public hasSigned;
    
    // Vote structure (separate to avoid struct with mapping)
    mapping(uint256 => mapping(address => int256)) public votes;
    mapping(uint256 => uint256) public yesVotes;
    mapping(uint256 => uint256) public noVotes;
    mapping(uint256 => uint256) public votingEnds;
    mapping(uint256 => string) public proposalDescriptions;
    mapping(uint256 => uint256) public proposalTxIds;
    mapping(uint256 => bool) public proposalExecuted;
    
    uint256 public proposalCount;
    
    event TransactionProposed(uint256 indexed txId, address indexed proposer, string description);
    event TransactionSigned(uint256 indexed txId, address indexed signer);
    event TransactionExecuted(uint256 indexed txId);
    event VoteCast(uint256 indexed proposalId, address indexed voter, int256 vote);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SIGNER_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
    }
    
    // Propose transaction
    function proposeTransaction(
        address to,
        uint256 value,
        bytes memory data,
        string memory description
    ) external onlyRole(PROPOSER_ROLE) returns (uint256) {
        Transaction memory tx_ = Transaction({
            to: to,
            value: value,
            data: data,
            executed: false,
            signatures: 0,
            executionTime: 0
        });
        
        transactions.push(tx_);
        uint256 txId = transactions.length - 1;
        
        // Create proposal
        uint256 proposalId = proposalCount++;
        proposalDescriptions[proposalId] = description;
        proposalTxIds[proposalId] = txId;
        votingEnds[proposalId] = block.timestamp + 7 days;
        
        emit TransactionProposed(txId, msg.sender, description);
        emit VoteCast(proposalId, address(0), 0); // Placeholder event
        
        return txId;
    }
    
    // Sign transaction
    function signTransaction(uint256 txId) external onlyRole(SIGNER_ROLE) {
        require(!transactions[txId].executed, "Already executed");
        require(!hasSigned[txId][msg.sender], "Already signed");
        
        hasSigned[txId][msg.sender] = true;
        transactions[txId].signatures++;
        
        emit TransactionSigned(txId, msg.sender);
    }
    
    // Cast vote
    function castVote(uint256 proposalId, int256 vote) external onlyRole(SIGNER_ROLE) {
        require(block.timestamp < votingEnds[proposalId], "Voting ended");
        require(vote == 1 || vote == -1 || vote == 0, "Invalid vote");
        require(votes[proposalId][msg.sender] == 0, "Already voted");
        
        votes[proposalId][msg.sender] = vote;
        
        if (vote == 1) yesVotes[proposalId]++;
        else if (vote == -1) noVotes[proposalId]++;
        
        emit VoteCast(proposalId, msg.sender, vote);
    }
    
    // Execute transaction (requires threshold signatures)
    function executeTransaction(uint256 txId) external onlyRole(SIGNER_ROLE) {
        Transaction storage tx_ = transactions[txId];
        require(!tx_.executed, "Already executed");
        
        uint256 threshold = getThreshold(tx_.value);
        require(tx_.signatures >= threshold, "Not enough signatures");
        
        tx_.executed = true;
        tx_.executionTime = block.timestamp;
        
        (bool success, ) = tx_.to.call{value: tx_.value}(tx_.data);
        require(success, "Transaction failed");
        
        emit TransactionExecuted(txId);
    }
    
    // Get threshold based on amount
    function getThreshold(uint256 value) public pure returns (uint256) {
        if (value < LOW_LIMIT) return THRESHOLD_LOW;
        if (value < MEDIUM_LIMIT) return THRESHOLD_MEDIUM;
        return THRESHOLD_HIGH;
    }
    
    // Get proposal details
    function getProposal(uint256 proposalId) external view returns (
        uint256 txId,
        string memory description,
        uint256 votingEnd,
        uint256 yes,
        uint256 no,
        bool executed
    ) {
        return (
            proposalTxIds[proposalId],
            proposalDescriptions[proposalId],
            votingEnds[proposalId],
            yesVotes[proposalId],
            noVotes[proposalId],
            proposalExecuted[proposalId]
        );
    }
    
    // Get transaction details
    function getTransaction(uint256 txId) external view returns (
        address to,
        uint256 value,
        bool executed,
        uint256 signatures
    ) {
        Transaction storage tx_ = transactions[txId];
        return (tx_.to, tx_.value, tx_.executed, tx_.signatures);
    }
    
    // Receive ETH
    receive() external payable {}
}

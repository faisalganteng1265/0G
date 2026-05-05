// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice ERC-721 Intelligent NFT representing an AI Mentor on 0G Network.
/// Inspired by ERC-7857: carries a reference to encrypted knowledge on 0G Storage
/// and tracks on-chain confidence signals from the AI Confidence Oracle.
contract AIMentorINFT is ERC721, Ownable {
    enum Status { DRAFT, REVIEW, READY, SUSPENDED }

    struct MentorMeta {
        address creator;
        string storageRef;      // 0G Storage KV/Log CID of encrypted knowledge
        string name;
        string category;
        uint8 confidenceScore;  // 0-100, updated by oracle
        uint32 gapCount;        // open blind spots detected on-chain
        uint32 totalQueries;
        Status status;
        uint64 lastUpdatedAt;   // unix timestamp of last knowledge update
        uint64 mintedAt;
    }

    uint256 private _nextTokenId;

    mapping(uint256 => MentorMeta) private _mentors;
    mapping(address => bool) public oracles;
    mapping(address => uint256[]) private _mentorsByCreator;

    event MentorMinted(uint256 indexed tokenId, address indexed creator, string name, string storageRef);
    event StorageRefUpdated(uint256 indexed tokenId, string newRef, uint8 newConfidence);
    event GapIncremented(uint256 indexed tokenId, uint32 newGapCount);
    event GapResolved(uint256 indexed tokenId, uint32 newGapCount);
    event ConfidenceUpdated(uint256 indexed tokenId, uint8 oldScore, uint8 newScore);
    event StatusChanged(uint256 indexed tokenId, Status oldStatus, Status newStatus);
    event OracleSet(address indexed oracle, bool enabled);

    modifier onlyOracle() {
        require(oracles[msg.sender] || msg.sender == owner(), "not oracle");
        _;
    }

    constructor() ERC721("AI Mentor INFT", "AIMT") Ownable(msg.sender) {}

    // ─── Owner mutations (called by MentorMarketplace) ───────────────────────

    function mintMentor(
        address to,
        string calldata name,
        string calldata category,
        string calldata storageRef
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        _mentors[tokenId] = MentorMeta({
            creator: to,
            storageRef: storageRef,
            name: name,
            category: category,
            confidenceScore: 0,
            gapCount: 0,
            totalQueries: 0,
            status: Status.DRAFT,
            lastUpdatedAt: uint64(block.timestamp),
            mintedAt: uint64(block.timestamp)
        });

        _mentorsByCreator[to].push(tokenId);
        emit MentorMinted(tokenId, to, name, storageRef);
    }

    function updateStorageRef(uint256 tokenId, string calldata newRef, uint8 newConfidence)
        external
        onlyOracle
    {
        require(newConfidence <= 100, "score > 100");
        MentorMeta storage m = _mentors[tokenId];
        m.storageRef = newRef;
        m.confidenceScore = newConfidence;
        m.lastUpdatedAt = uint64(block.timestamp);
        emit StorageRefUpdated(tokenId, newRef, newConfidence);
    }

    function setStatus(uint256 tokenId, Status newStatus) external onlyOwner {
        Status old = _mentors[tokenId].status;
        _mentors[tokenId].status = newStatus;
        emit StatusChanged(tokenId, old, newStatus);
    }

    // ─── Oracle mutations (called directly by AI Confidence Oracle backend) ──

    function incrementGapCount(uint256 tokenId) external onlyOracle {
        uint32 newCount = ++_mentors[tokenId].gapCount;
        emit GapIncremented(tokenId, newCount);
    }

    function resolveGap(uint256 tokenId) external onlyOracle {
        MentorMeta storage m = _mentors[tokenId];
        require(m.gapCount > 0, "no gaps");
        uint32 newCount = --m.gapCount;
        emit GapResolved(tokenId, newCount);
    }

    function updateConfidence(uint256 tokenId, uint8 score) external onlyOracle {
        require(score <= 100, "score > 100");
        uint8 old = _mentors[tokenId].confidenceScore;
        _mentors[tokenId].confidenceScore = score;
        emit ConfidenceUpdated(tokenId, old, score);
    }

    function recordQuery(uint256 tokenId) external onlyOracle {
        _mentors[tokenId].totalQueries++;
    }

    function setOracle(address oracle, bool enabled) external onlyOwner {
        oracles[oracle] = enabled;
        emit OracleSet(oracle, enabled);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function mentors(uint256 tokenId) external view returns (MentorMeta memory) {
        return _mentors[tokenId];
    }

    function getMentorsByCreator(address creator) external view returns (uint256[] memory) {
        return _mentorsByCreator[creator];
    }

    function totalMentors() external view returns (uint256) {
        return _nextTokenId;
    }
}

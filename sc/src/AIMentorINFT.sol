// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC7857.sol";

/// @notice ERC-7857 Intelligent NFT representing an AI Mentor on 0G Network.
///         Knowledge is stored encrypted on 0G Storage. sealedKey holds the AES key
///         re-encrypted for the current owner's wallet, produced by 0G Compute TEE.
contract AIMentorINFT is ERC721, Ownable, IERC7857 {
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

    // ERC-7857 storage
    mapping(uint256 => bytes) private _sealedKeys;                          // AES key sealed for current owner
    mapping(uint256 => address[]) private _authorizedExecutors;             // authorized third-party users
    mapping(uint256 => mapping(address => bytes)) private _permissions;     // permissions per executor

    event MentorMinted(uint256 indexed tokenId, address indexed creator, string name, string storageRef);
    event StorageRefUpdated(uint256 indexed tokenId, string newRef, uint8 newConfidence);
    event GapIncremented(uint256 indexed tokenId, uint32 newGapCount);
    event GapResolved(uint256 indexed tokenId, uint32 newGapCount);
    event ConfidenceUpdated(uint256 indexed tokenId, uint8 oldScore, uint8 newScore);
    event StatusChanged(uint256 indexed tokenId, Status oldStatus, Status newStatus);

    modifier onlyOracle() {
        require(oracles[msg.sender] || msg.sender == owner(), "not oracle");
        _;
    }

    constructor() ERC721("AI Mentor INFT", "AIMT") Ownable(msg.sender) {}

    // ─── ERC-7857: secure transfer ────────────────────────────────────────────

    /// @inheritdoc IERC7857
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external override {
        require(to != address(0), "transfer to zero address");
        address tokenOwner = ownerOf(tokenId);
        require(tokenOwner == from, "transfer from incorrect owner");
        require(_isAuthorized(tokenOwner, msg.sender, tokenId), "not owner or approved");
        _verifyOracleProof(
            keccak256(abi.encodePacked(from, to, tokenId, sealedKey)),
            proof
        );
        _sealedKeys[tokenId] = sealedKey;
        _transfer(from, to, tokenId);
        emit MetadataUpdated(tokenId, keccak256(sealedKey));
    }

    /// @inheritdoc IERC7857
    function clone(
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external override returns (uint256 newTokenId) {
        require(to != address(0), "clone to zero address");
        address tokenOwner = ownerOf(tokenId);
        require(_isAuthorized(tokenOwner, msg.sender, tokenId), "not owner or approved");
        _verifyOracleProof(
            keccak256(abi.encodePacked(to, tokenId, sealedKey)),
            proof
        );

        MentorMeta memory src = _mentors[tokenId];
        newTokenId = _nextTokenId++;
        _safeMint(to, newTokenId);

        _mentors[newTokenId] = MentorMeta({
            creator: src.creator,
            storageRef: src.storageRef,
            name: src.name,
            category: src.category,
            confidenceScore: src.confidenceScore,
            gapCount: 0,
            totalQueries: 0,
            status: Status.DRAFT,
            lastUpdatedAt: uint64(block.timestamp),
            mintedAt: uint64(block.timestamp)
        });
        _sealedKeys[newTokenId] = sealedKey;
        _mentorsByCreator[to].push(newTokenId);

        emit MentorMinted(newTokenId, to, src.name, src.storageRef);
        emit MetadataUpdated(newTokenId, keccak256(sealedKey));
    }

    /// @inheritdoc IERC7857
    function authorizeUsage(
        uint256 tokenId,
        address executor,
        bytes calldata permissions
    ) external override {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(executor != address(0), "executor is zero address");
        _authorizedExecutors[tokenId].push(executor);
        _permissions[tokenId][executor] = permissions;
        emit UsageAuthorized(tokenId, executor);
    }

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

    function setStatus(uint256 tokenId, Status newStatus) external onlyOwner {
        Status old = _mentors[tokenId].status;
        _mentors[tokenId].status = newStatus;
        emit StatusChanged(tokenId, old, newStatus);
    }

    // ─── Oracle mutations ─────────────────────────────────────────────────────

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
        emit MetadataUpdated(tokenId, keccak256(bytes(newRef)));
    }

    /// @notice Set or replace the sealedKey for a token (called by oracle/TEE after re-encryption).
    function setSealedKey(uint256 tokenId, bytes calldata sealedKey) external onlyOracle {
        _sealedKeys[tokenId] = sealedKey;
        emit MetadataUpdated(tokenId, keccak256(sealedKey));
    }

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
        emit OracleUpdated(oracle, enabled);
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

    /// @notice Returns the sealedKey (AES key encrypted for current owner) of a token.
    function sealedKeyOf(uint256 tokenId) external view returns (bytes memory) {
        return _sealedKeys[tokenId];
    }

    /// @notice Returns all addresses authorized to use a token without owning it.
    function authorizedUsersOf(uint256 tokenId) external view returns (address[] memory) {
        return _authorizedExecutors[tokenId];
    }

    /// @notice Returns the permissions granted to an executor for a token.
    function permissionsOf(uint256 tokenId, address executor) external view returns (bytes memory) {
        return _permissions[tokenId][executor];
    }

    // ─── ERC-165 supportsInterface ────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC7857).interfaceId || super.supportsInterface(interfaceId);
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    /// @notice Verifies that `proof` is an oracle signature over `msgHash`.
    function _verifyOracleProof(bytes32 msgHash, bytes calldata proof) internal view {
        require(proof.length == 65, "invalid proof length");
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash));
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(proof.offset)
            s := calldataload(add(proof.offset, 32))
            v := byte(0, calldataload(add(proof.offset, 64)))
        }
        address signer = ecrecover(ethHash, v, r, s);
        require(signer != address(0) && oracles[signer], "invalid oracle proof");
    }
}

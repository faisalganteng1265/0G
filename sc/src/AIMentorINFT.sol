// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC7857.sol";

/// @notice ERC-7857 Intelligent NFT representing an AI Mentor on 0G Network.
///         Knowledge is stored encrypted on 0G Storage. sealedKey holds the AES key
///         re-encrypted for the current owner's wallet, produced by 0G Compute TEE.
contract AIMentorINFT is ERC721, Ownable, IERC7857, IERC7857DataVerifier {
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

    mapping(uint256 => bytes) private _sealedKeys;
    mapping(uint256 => IntelligentData[]) private _intelligentData;
    mapping(uint256 => address[]) private _authorizedUsers;
    mapping(uint256 => mapping(address => bool)) private _isAuthorizedUser;
    mapping(address => address) private _accessAssistants;
    mapping(bytes32 => bool) private _usedProofNonces;

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

    function name() public view override(ERC721, IERC7857Metadata) returns (string memory) {
        return super.name();
    }

    function symbol() public view override(ERC721, IERC7857Metadata) returns (string memory) {
        return super.symbol();
    }

    function ownerOf(uint256 tokenId) public view override(ERC721, IERC7857) returns (address) {
        return super.ownerOf(tokenId);
    }

    function approve(address to, uint256 tokenId) public override(ERC721, IERC7857) {
        super.approve(to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public override(ERC721, IERC7857) {
        super.setApprovalForAll(operator, approved);
    }

    function getApproved(uint256 tokenId) public view override(ERC721, IERC7857) returns (address) {
        return super.getApproved(tokenId);
    }

    function isApprovedForAll(address tokenOwner, address operator)
        public
        view
        override(ERC721, IERC7857)
        returns (bool)
    {
        return super.isApprovedForAll(tokenOwner, operator);
    }

    // ─── ERC-7857: secure transfer / clone / usage ───────────────────────────

    /// @inheritdoc IERC7857
    function verifier() external view override returns (IERC7857DataVerifier) {
        return IERC7857DataVerifier(address(this));
    }

    /// @inheritdoc IERC7857
    function iTransfer(
        address to,
        uint256 tokenId,
        TransferValidityProof[] calldata proofs
    ) external override {
        require(to != address(0), "transfer to zero address");
        address tokenOwner = ownerOf(tokenId);
        require(_isAuthorized(tokenOwner, msg.sender, tokenId), "not owner or approved");

        TransferValidityProofOutput[] memory outputs = _verifyTransferValidityFor(to, tokenId, proofs);
        _publishVerifiedData(to, tokenId, outputs);

        _transfer(tokenOwner, to, tokenId);
        emit Transferred(tokenId, tokenOwner, to);
    }

    /// @inheritdoc IERC7857
    function iClone(
        address to,
        uint256 tokenId,
        TransferValidityProof[] calldata proofs
    ) external override returns (uint256 newTokenId) {
        require(to != address(0), "clone to zero address");
        address tokenOwner = ownerOf(tokenId);
        require(_isAuthorized(tokenOwner, msg.sender, tokenId), "not owner or approved");
        TransferValidityProofOutput[] memory outputs = _verifyTransferValidityFor(to, tokenId, proofs);

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
        _mentorsByCreator[to].push(newTokenId);
        _publishVerifiedData(to, newTokenId, outputs);

        emit MentorMinted(newTokenId, to, src.name, src.storageRef);
        emit Cloned(tokenId, newTokenId, tokenOwner, to);
    }

    /// @inheritdoc IERC7857
    function authorizeUsage(
        uint256 tokenId,
        address user
    ) external override {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(user != address(0), "zero address");
        require(!_isAuthorizedUser[tokenId][user], "already authorized");
        _authorizedUsers[tokenId].push(user);
        _isAuthorizedUser[tokenId][user] = true;
        emit Authorization(msg.sender, user, tokenId);
    }

    /// @inheritdoc IERC7857
    function revokeAuthorization(uint256 tokenId, address user) external override {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(user != address(0), "zero address");
        require(_isAuthorizedUser[tokenId][user], "not authorized");

        address[] storage users = _authorizedUsers[tokenId];
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == user) {
                users[i] = users[users.length - 1];
                users.pop();
                break;
            }
        }

        _isAuthorizedUser[tokenId][user] = false;
        emit AuthorizationRevoked(msg.sender, user, tokenId);
    }

    /// @inheritdoc IERC7857
    function delegateAccess(address assistant) external override {
        require(assistant != address(0), "zero address");
        _accessAssistants[msg.sender] = assistant;
        emit DelegateAccess(msg.sender, assistant);
    }

    // ─── Owner mutations (called by MentorMarketplace) ───────────────────────

    function mintMentor(
        address to,
        string calldata mentorName,
        string calldata category,
        string calldata storageRef
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        _mentors[tokenId] = MentorMeta({
            creator: to,
            storageRef: storageRef,
            name: mentorName,
            category: category,
            confidenceScore: 0,
            gapCount: 0,
            totalQueries: 0,
            status: Status.DRAFT,
            lastUpdatedAt: uint64(block.timestamp),
            mintedAt: uint64(block.timestamp)
        });
        _setIntelligentData(tokenId, storageRef);

        _mentorsByCreator[to].push(tokenId);
        emit MentorMinted(tokenId, to, mentorName, storageRef);
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
        _requireOwned(tokenId);
        require(newConfidence <= 100, "score > 100");
        MentorMeta storage m = _mentors[tokenId];
        m.storageRef = newRef;
        m.confidenceScore = newConfidence;
        m.lastUpdatedAt = uint64(block.timestamp);
        _setIntelligentData(tokenId, newRef);
        emit StorageRefUpdated(tokenId, newRef, newConfidence);
    }

    /// @notice Set or replace the sealedKey for a token (called by oracle/TEE after re-encryption).
    function setSealedKey(uint256 tokenId, bytes calldata sealedKey) external onlyOracle {
        _requireOwned(tokenId);
        _sealedKeys[tokenId] = sealedKey;
        bytes[] memory sealedKeys = new bytes[](1);
        sealedKeys[0] = sealedKey;
        emit PublishedSealedKey(ownerOf(tokenId), tokenId, sealedKeys);
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
        ownerOf(tokenId);
        return _authorizedUsers[tokenId];
    }

    /// @inheritdoc IERC7857
    function getDelegateAccess(address user) external view override returns (address) {
        return _accessAssistants[user];
    }

    /// @inheritdoc IERC7857Metadata
    function intelligentDataOf(uint256 tokenId) external view override returns (IntelligentData[] memory) {
        ownerOf(tokenId);
        return _intelligentData[tokenId];
    }

    /// @inheritdoc IERC7857DataVerifier
    function verifyTransferValidity(TransferValidityProof[] calldata proofs)
        external
        override
        returns (TransferValidityProofOutput[] memory)
    {
        require(msg.sender == address(this), "internal verifier only");
        return _verifyTransferValidity(proofs);
    }

    // ─── ERC-165 supportsInterface ────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return interfaceId == type(IERC7857).interfaceId || super.supportsInterface(interfaceId);
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    function _setIntelligentData(uint256 tokenId, string memory storageRef) internal {
        delete _intelligentData[tokenId];
        _intelligentData[tokenId].push(IntelligentData({
            dataDescription: storageRef,
            dataHash: keccak256(bytes(storageRef))
        }));
    }

    function _publishVerifiedData(
        address to,
        uint256 tokenId,
        TransferValidityProofOutput[] memory outputs
    ) internal {
        require(outputs.length > 0, "empty proofs");

        bytes[] memory sealedKeys = new bytes[](outputs.length);
        delete _intelligentData[tokenId];

        for (uint256 i = 0; i < outputs.length; i++) {
            _intelligentData[tokenId].push(IntelligentData({
                dataDescription: _mentors[tokenId].storageRef,
                dataHash: outputs[i].newDataHash
            }));
            sealedKeys[i] = outputs[i].sealedKey;
        }

        _sealedKeys[tokenId] = outputs[0].sealedKey;
        emit PublishedSealedKey(to, tokenId, sealedKeys);
    }

    function _verifyTransferValidityFor(
        address to,
        uint256 tokenId,
        TransferValidityProof[] calldata proofs
    ) internal returns (TransferValidityProofOutput[] memory outputs) {
        outputs = _verifyTransferValidity(proofs);
        bytes32 currentHash = _currentDataHash(tokenId);

        for (uint256 i = 0; i < outputs.length; i++) {
            require(outputs[i].oldDataHash == currentHash, "old data hash mismatch");
            address accessSigner = outputs[i].accessAssistant;
            require(accessSigner == to || accessSigner == _accessAssistants[to] || oracles[accessSigner], "invalid access signer");
        }
    }

    function _verifyTransferValidity(TransferValidityProof[] calldata proofs)
        internal
        returns (TransferValidityProofOutput[] memory outputs)
    {
        require(proofs.length > 0, "empty proofs");
        outputs = new TransferValidityProofOutput[](proofs.length);

        for (uint256 i = 0; i < proofs.length; i++) {
            AccessProof calldata accessProof = proofs[i].accessProof;
            OwnershipProof calldata ownershipProof = proofs[i].ownershipProof;
            require(accessProof.oldDataHash == ownershipProof.oldDataHash, "proof old hash mismatch");
            require(accessProof.newDataHash == ownershipProof.newDataHash, "proof new hash mismatch");
            require(keccak256(accessProof.encryptedPubKey) == keccak256(ownershipProof.encryptedPubKey), "pubkey mismatch");
            require(ownershipProof.sealedKey.length > 0, "empty sealed key");

            bytes32 ownershipNonce = keccak256(ownershipProof.nonce);
            require(!_usedProofNonces[ownershipNonce], "proof already used");
            _usedProofNonces[ownershipNonce] = true;

            address oracleSigner = _recoverSigner(
                _ownershipProofHash(ownershipProof),
                ownershipProof.proof
            );
            require(oracles[oracleSigner], "invalid oracle proof");

            address accessSigner = _recoverSigner(
                _accessProofHash(accessProof),
                accessProof.proof
            );

            outputs[i] = TransferValidityProofOutput({
                oldDataHash: ownershipProof.oldDataHash,
                newDataHash: ownershipProof.newDataHash,
                sealedKey: ownershipProof.sealedKey,
                encryptedPubKey: ownershipProof.encryptedPubKey,
                wantedKey: "",
                accessAssistant: accessSigner,
                accessProofNonce: accessProof.nonce,
                ownershipProofNonce: ownershipProof.nonce
            });
        }
    }

    function _currentDataHash(uint256 tokenId) internal view returns (bytes32) {
        if (_intelligentData[tokenId].length == 0) {
            return keccak256(bytes(_mentors[tokenId].storageRef));
        }
        return _intelligentData[tokenId][0].dataHash;
    }

    function _accessProofHash(AccessProof calldata accessProof) internal view returns (bytes32) {
        return keccak256(abi.encode(
            address(this),
            block.chainid,
            accessProof.oldDataHash,
            accessProof.newDataHash,
            keccak256(accessProof.nonce),
            keccak256(accessProof.encryptedPubKey)
        ));
    }

    function _ownershipProofHash(OwnershipProof calldata ownershipProof) internal view returns (bytes32) {
        return keccak256(abi.encode(
            address(this),
            block.chainid,
            ownershipProof.oracleType,
            ownershipProof.oldDataHash,
            ownershipProof.newDataHash,
            keccak256(ownershipProof.sealedKey),
            keccak256(ownershipProof.encryptedPubKey),
            keccak256(ownershipProof.nonce)
        ));
    }

    function _recoverSigner(bytes32 msgHash, bytes calldata proof) internal pure returns (address) {
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
        require(signer != address(0), "invalid proof");
        return signer;
    }
}

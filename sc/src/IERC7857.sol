// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice ERC-7857 data verifier interface.
/// @dev Mirrors the EIP-7857 proof model while allowing the concrete verifier
///      to use TEE or ZKP attestations behind the interface.
interface IERC7857DataVerifier {
    enum OracleType {
        TEE,
        ZKP
    }

    struct AccessProof {
        bytes32 oldDataHash;
        bytes32 newDataHash;
        bytes nonce;
        bytes encryptedPubKey;
        bytes proof;
    }

    struct OwnershipProof {
        OracleType oracleType;
        bytes32 oldDataHash;
        bytes32 newDataHash;
        bytes sealedKey;
        bytes encryptedPubKey;
        bytes nonce;
        bytes proof;
    }

    struct TransferValidityProof {
        AccessProof accessProof;
        OwnershipProof ownershipProof;
    }

    struct TransferValidityProofOutput {
        bytes32 oldDataHash;
        bytes32 newDataHash;
        bytes sealedKey;
        bytes encryptedPubKey;
        bytes wantedKey;
        address accessAssistant;
        bytes accessProofNonce;
        bytes ownershipProofNonce;
    }

    function verifyTransferValidity(TransferValidityProof[] calldata proofs)
        external
        returns (TransferValidityProofOutput[] memory);
}

interface IERC7857Metadata {
    struct IntelligentData {
        string dataDescription;
        bytes32 dataHash;
    }

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function intelligentDataOf(uint256 tokenId) external view returns (IntelligentData[] memory);
}

/// @notice ERC-7857: AI Agents NFT with Private Metadata.
/// @dev Main NFT interface from EIP-7857. Implementations may additionally
///      implement ERC-721 for marketplace and wallet compatibility.
interface IERC7857 is IERC7857Metadata {
    event Authorization(address indexed from, address indexed to, uint256 indexed tokenId);
    event AuthorizationRevoked(address indexed from, address indexed to, uint256 indexed tokenId);
    event Transferred(uint256 tokenId, address indexed from, address indexed to);
    event Cloned(uint256 indexed tokenId, uint256 indexed newTokenId, address from, address to);
    event PublishedSealedKey(address indexed to, uint256 indexed tokenId, bytes[] sealedKeys);
    event DelegateAccess(address indexed user, address indexed assistant);

    function verifier() external view returns (IERC7857DataVerifier);

    function iTransfer(
        address to,
        uint256 tokenId,
        IERC7857DataVerifier.TransferValidityProof[] calldata proofs
    ) external;

    function iClone(
        address to,
        uint256 tokenId,
        IERC7857DataVerifier.TransferValidityProof[] calldata proofs
    ) external returns (uint256 newTokenId);

    function authorizeUsage(uint256 tokenId, address user) external;
    function revokeAuthorization(uint256 tokenId, address user) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function delegateAccess(address assistant) external;
    function ownerOf(uint256 tokenId) external view returns (address);
    function authorizedUsersOf(uint256 tokenId) external view returns (address[] memory);
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function getDelegateAccess(address user) external view returns (address);
}

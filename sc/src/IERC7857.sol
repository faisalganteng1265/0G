// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title IERC7857 — Intelligent NFT standard (0G Labs, 2025)
/// @notice Extends ERC-721 with secure knowledge transfer, cloning, and usage authorization.
///         Knowledge is stored encrypted off-chain (0G Storage). The sealedKey is the AES
///         encryption key re-encrypted for each recipient inside a TEE, proven by oracle sig.
interface IERC7857 is IERC721 {
    /// @notice Emitted when encrypted metadata reference is updated on-chain.
    event MetadataUpdated(uint256 indexed tokenId, bytes32 newHash);

    /// @notice Emitted when a third-party executor is authorized to use a token.
    event UsageAuthorized(uint256 indexed tokenId, address indexed executor);

    /// @notice Emitted when oracle authorization changes.
    event OracleUpdated(address indexed oracle, bool enabled);

    /// @notice Secure transfer: re-encrypts the knowledge key for the recipient inside TEE.
    /// @param from    Current owner.
    /// @param to      New owner.
    /// @param tokenId Token to transfer.
    /// @param sealedKey AES key re-encrypted for `to`'s public key, produced by TEE.
    /// @param proof   Oracle signature over keccak256(from, to, tokenId, sealedKey).
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external;

    /// @notice Clone an INFT: mints a new token with the same knowledge, key re-encrypted for recipient.
    /// @param to      Recipient of the cloned token.
    /// @param tokenId Source token to clone.
    /// @param sealedKey AES key re-encrypted for `to`'s public key, produced by TEE.
    /// @param proof   Oracle signature over keccak256(to, tokenId, sealedKey).
    /// @return newTokenId ID of the newly minted clone.
    function clone(
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external returns (uint256 newTokenId);

    /// @notice Authorize a third party to execute queries against this INFT without ownership.
    /// @param tokenId     Token to authorize usage on.
    /// @param executor    Address permitted to use the INFT.
    /// @param permissions Arbitrary permission bytes (e.g. query limit, expiry, scope).
    function authorizeUsage(
        uint256 tokenId,
        address executor,
        bytes calldata permissions
    ) external;
}

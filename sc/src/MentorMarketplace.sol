// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AIMentorINFT.sol";
import "./AccessSharesMarket.sol";
import "./RevenueDistributor.sol";
import "./VestingEscrow.sol";

/// @notice Central entry-point for the AI Mentor Marketplace.
/// Orchestrates minting, share creation, query access, and revenue routing.
/// All sub-contracts are owned by this contract; caller validation happens here.
contract MentorMarketplace is Ownable, ReentrancyGuard {
    AIMentorINFT public immutable inft;
    AccessSharesMarket public immutable sharesMarket;
    RevenueDistributor public immutable revenue;
    VestingEscrow public immutable vesting;

    event MentorRegistered(uint256 indexed tokenId, address indexed creator, string name);
    event KnowledgeUpdated(uint256 indexed tokenId, string newStorageRef, uint8 confidence);
    event QueryExecuted(uint256 indexed mentorId, address indexed querier);
    event MentorRoyaltyClaimed(uint256 indexed mentorId, address indexed mentor, uint256 amount);

    constructor(
        address inft_,
        address sharesMarket_,
        address revenue_,
        address vesting_
    ) Ownable(msg.sender) {
        inft = AIMentorINFT(inft_);
        sharesMarket = AccessSharesMarket(payable(sharesMarket_));
        revenue = RevenueDistributor(payable(revenue_));
        vesting = VestingEscrow(payable(vesting_));
    }

    // ─── Mentor flow ─────────────────────────────────────────────────────────

    /// Mint a new AI Mentor INFT and initialize its share pool.
    function registerMentor(
        string calldata name,
        string calldata category,
        string calldata storageRef
    ) external returns (uint256 tokenId) {
        tokenId = inft.mintMentor(msg.sender, name, category, storageRef);
        sharesMarket.createPool(tokenId, msg.sender);
        emit MentorRegistered(tokenId, msg.sender, name);
    }

    /// Mentor updates knowledge base on 0G Storage and refreshes confidence score.
    function updateKnowledge(
        uint256 mentorId,
        string calldata newStorageRef,
        uint8 confidence
    ) external {
        require(inft.ownerOf(mentorId) == msg.sender, "not mentor owner");
        inft.updateStorageRef(mentorId, newStorageRef, confidence);
        emit KnowledgeUpdated(mentorId, newStorageRef, confidence);
    }

    /// Promote a mentor from DRAFT → REVIEW → READY.
    function setMentorStatus(uint256 mentorId, AIMentorINFT.Status status) external {
        require(inft.ownerOf(mentorId) == msg.sender, "not mentor owner");
        inft.setStatus(mentorId, status);
    }

    // ─── Curator flow ─────────────────────────────────────────────────────────

    function buyShares(uint256 mentorId, uint32 amount) external payable nonReentrant {
        sharesMarket.buyShares{value: msg.value}(mentorId, amount, msg.sender);
    }

    function sellShares(uint256 mentorId, uint32 amount) external nonReentrant {
        sharesMarket.sellShares(mentorId, amount, msg.sender);
    }

    // ─── Learner flow ─────────────────────────────────────────────────────────

    function subscribe(uint256 mentorId) external payable nonReentrant {
        revenue.subscribe{value: msg.value}(mentorId, msg.sender);
    }

    /// Pay-per-query: verify access, record query on-chain, distribute revenue.
    function executeQuery(uint256 mentorId) external payable nonReentrant {
        if (revenue.isSubscribed(mentorId, msg.sender)) {
            inft.recordQuery(mentorId);
            emit QueryExecuted(mentorId, msg.sender);
            if (msg.value > 0) {
                (bool ok,) = msg.sender.call{value: msg.value}("");
                require(ok, "refund failed");
            }
            return;
        }
        revenue.payPerQuery{value: msg.value}(mentorId);
        inft.recordQuery(mentorId);
        emit QueryExecuted(mentorId, msg.sender);
    }

    // ─── Claims ──────────────────────────────────────────────────────────────

    /// Move accumulated royalties into 30-day vesting. Call before claimVested.
    function vestEarnings(uint256 mentorId) external nonReentrant {
        require(inft.ownerOf(mentorId) == msg.sender, "not mentor owner");
        uint256 amount = revenue.mentorClaimable(mentorId);
        require(amount > 0, "nothing to vest");
        revenue.claimMentorRoyalty(mentorId, payable(address(this)));
        AIMentorINFT.MentorMeta memory m = inft.mentors(mentorId);
        vesting.addVesting{value: amount}(mentorId, m.lastUpdatedAt);
    }

    /// Claim royalties directly without vesting (skips the anti-staleness mechanism).
    function claimMentorRoyalty(uint256 mentorId) external nonReentrant {
        require(inft.ownerOf(mentorId) == msg.sender, "not mentor owner");
        uint256 claimable = revenue.mentorClaimable(mentorId);
        revenue.claimMentorRoyalty(mentorId, payable(msg.sender));
        emit MentorRoyaltyClaimed(mentorId, msg.sender, claimable);
    }

    function claimCuratorRewards(uint256 mentorId) external nonReentrant {
        revenue.claimCuratorRewards(mentorId, payable(msg.sender));
    }

    function claimVested(uint256 mentorId) external nonReentrant {
        require(inft.ownerOf(mentorId) == msg.sender, "not mentor owner");
        vesting.claim(mentorId, payable(msg.sender));
    }

    // ─── Oracle / admin ──────────────────────────────────────────────────────

    function triggerClawback(uint256 mentorId) external onlyOwner {
        vesting.clawback(mentorId);
    }

    function setOracle(address oracle, bool enabled) external onlyOwner {
        inft.setOracle(oracle, enabled);
    }

    function claimPlatformFee(address to) external onlyOwner {
        revenue.claimPlatformFee(to);
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    function getMentorInfo(uint256 mentorId) external view returns (AIMentorINFT.MentorMeta memory) {
        return inft.mentors(mentorId);
    }

    function getShareBalance(uint256 mentorId, address holder) external view returns (uint32) {
        return sharesMarket.balanceOf(mentorId, holder);
    }

    function getSharePrice(uint256 mentorId) external view returns (uint256) {
        return sharesMarket.currentPrice(mentorId);
    }

    function getPendingCuratorRewards(uint256 mentorId, address holder) external view returns (uint256) {
        return revenue.pendingCuratorRewards(mentorId, holder);
    }

    function getVestingProgress(uint256 mentorId) external view returns (uint256 progressBps) {
        return vesting.vestingProgress(mentorId);
    }

    function isSubscribed(uint256 mentorId, address user) external view returns (bool) {
        return revenue.isSubscribed(mentorId, user);
    }

    receive() external payable {}
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AccessSharesMarket.sol";

/// @notice Handles access and pay-per-query payments, then distributes
/// revenue among mentor (60%), curator pool (25%), and platform (15%).
/// All state-changing calls come through the owner (MentorMarketplace),
/// which passes the actual payer/claimant addresses.
contract RevenueDistributor is Ownable, ReentrancyGuard {
    uint256 public constant MENTOR_BPS = 6000;   // 60%
    uint256 public constant CURATOR_BPS = 2500;  // 25%
    uint256 public constant PLATFORM_BPS = 1500; // 15%
    uint256 public constant BPS_DENOM = 10000;

    uint256 public constant QUERY_PRICE = 0.0005 ether;       // pay-per-query

    AccessSharesMarket public immutable sharesMarket;

    mapping(uint256 => uint256) public mentorClaimable;    // mentor's unclaimed royalties
    mapping(uint256 => uint256) public curatorPoolTotal;   // total ETH in curator pool
    mapping(uint256 => mapping(address => uint256)) public lastCuratorSnapshot;
    mapping(uint256 => mapping(address => uint256)) public curatorClaimable;

    uint256 public platformClaimable;

    event RevenueReceived(uint256 indexed mentorId, uint256 amount, string source);
    event MentorRoyaltyClaimed(uint256 indexed mentorId, address indexed mentor, uint256 amount);
    event CuratorRewardClaimed(uint256 indexed mentorId, address indexed curator, uint256 amount);
    event PlatformFeeClaimed(address indexed to, uint256 amount);

    constructor(address sharesMarket_) Ownable(msg.sender) {
        sharesMarket = AccessSharesMarket(payable(sharesMarket_));
    }

    // ─── Payment entry points (owner = MentorMarketplace passes actual caller) ─

    function payPerQuery(uint256 mentorId) external payable onlyOwner {
        require(msg.value >= QUERY_PRICE, "insufficient payment");
        _distribute(mentorId, QUERY_PRICE);

        uint256 excess = msg.value - QUERY_PRICE;
        if (excess > 0) {
            // excess refund handled by marketplace
            (bool ok,) = msg.sender.call{value: excess}("");
            require(ok, "refund failed");
        }
    }

    // ─── Claim functions ─────────────────────────────────────────────────────

    function claimMentorRoyalty(uint256 mentorId, address payable recipient)
        external
        onlyOwner
        nonReentrant
    {
        uint256 amount = mentorClaimable[mentorId];
        require(amount > 0, "nothing to claim");
        mentorClaimable[mentorId] = 0;
        (bool ok,) = recipient.call{value: amount}("");
        require(ok, "transfer failed");
        emit MentorRoyaltyClaimed(mentorId, recipient, amount);
    }

    function claimCuratorRewards(uint256 mentorId, address payable holder)
        external
        onlyOwner
        nonReentrant
    {
        _settleCurator(mentorId, holder);
        uint256 amount = curatorClaimable[mentorId][holder];
        require(amount > 0, "nothing to claim");
        curatorClaimable[mentorId][holder] = 0;
        (bool ok,) = holder.call{value: amount}("");
        require(ok, "transfer failed");
        emit CuratorRewardClaimed(mentorId, holder, amount);
    }

    function claimPlatformFee(address to) external onlyOwner nonReentrant {
        uint256 amount = platformClaimable;
        require(amount > 0, "nothing to claim");
        platformClaimable = 0;
        (bool ok,) = to.call{value: amount}("");
        require(ok, "transfer failed");
        emit PlatformFeeClaimed(to, amount);
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    function pendingCuratorRewards(uint256 mentorId, address holder) external view returns (uint256) {
        uint32 shares = sharesMarket.balanceOf(mentorId, holder);
        if (shares == 0) return curatorClaimable[mentorId][holder];
        uint256 poolDelta = curatorPoolTotal[mentorId] - lastCuratorSnapshot[mentorId][holder];
        uint256 pending = (poolDelta * shares) / 1000; // TOTAL_SHARES = 1000
        return curatorClaimable[mentorId][holder] + pending;
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _distribute(uint256 mentorId, uint256 amount) internal {
        uint256 mentorCut = (amount * MENTOR_BPS) / BPS_DENOM;
        uint256 curatorCut = (amount * CURATOR_BPS) / BPS_DENOM;
        uint256 platformCut = amount - mentorCut - curatorCut;

        mentorClaimable[mentorId] += mentorCut;
        curatorPoolTotal[mentorId] += curatorCut;
        platformClaimable += platformCut;

        emit RevenueReceived(mentorId, amount, "");
    }

    function _settleCurator(uint256 mentorId, address holder) internal {
        uint32 shares = sharesMarket.balanceOf(mentorId, holder);
        if (shares == 0) return;
        uint256 snapshot = lastCuratorSnapshot[mentorId][holder];
        uint256 poolDelta = curatorPoolTotal[mentorId] - snapshot;
        if (poolDelta == 0) return;
        uint256 pending = (poolDelta * shares) / 1000; // TOTAL_SHARES = 1000
        curatorClaimable[mentorId][holder] += pending;
        lastCuratorSnapshot[mentorId][holder] = curatorPoolTotal[mentorId];
    }

    receive() external payable {
        platformClaimable += msg.value;
    }
}

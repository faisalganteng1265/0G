// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Bonding-curve share market for each AI Mentor.
/// Each mentor has 1000 total shares. On registration, 500 go to the mentor (creator)
/// and 500 are available for purchase by curators via a linear bonding curve.
/// All state-changing functions are gated to the owner (MentorMarketplace),
/// which validates callers and forwards the actual buyer/seller addresses.
contract AccessSharesMarket is Ownable, ReentrancyGuard {
    uint32 public constant TOTAL_SHARES = 1000;
    uint32 public constant MENTOR_INITIAL = 500;   // shares reserved for creator
    uint32 public constant CURATOR_POOL = 500;     // shares available for sale

    // Linear bonding curve: price_wei = BASE_PRICE + (soldCount * PRICE_SLOPE)
    uint256 public constant BASE_PRICE = 0.001 ether;
    uint256 public constant PRICE_SLOPE = 0.000002 ether;

    struct SharePool {
        address creator;
        uint32 sold;          // curator shares sold so far
        bool initialized;
    }

    // mentorId => holder => shares owned
    mapping(uint256 => mapping(address => uint32)) public balanceOf;
    mapping(uint256 => SharePool) public pools;

    event SharePoolCreated(uint256 indexed mentorId, address indexed creator);
    event SharesBought(uint256 indexed mentorId, address indexed buyer, uint32 amount, uint256 totalCost);
    event SharesSold(uint256 indexed mentorId, address indexed seller, uint32 amount, uint256 payout);

    modifier poolExists(uint256 mentorId) {
        require(pools[mentorId].initialized, "pool not initialized");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /// Called by MentorMarketplace when a mentor is registered.
    function createPool(uint256 mentorId, address creator) external onlyOwner {
        require(!pools[mentorId].initialized, "already initialized");
        pools[mentorId] = SharePool({ creator: creator, sold: 0, initialized: true });
        balanceOf[mentorId][creator] = MENTOR_INITIAL;
        emit SharePoolCreated(mentorId, creator);
    }

    /// Buy `amount` curator shares via bonding curve. ETH is forwarded from marketplace.
    function buyShares(uint256 mentorId, uint32 amount, address buyer)
        external
        payable
        onlyOwner
        nonReentrant
        poolExists(mentorId)
    {
        require(amount > 0, "amount = 0");
        SharePool storage pool = pools[mentorId];
        require(pool.sold + amount <= CURATOR_POOL, "not enough shares");

        uint256 cost = _buyCost(pool.sold, amount);
        require(msg.value >= cost, "insufficient payment");

        pool.sold += amount;
        balanceOf[mentorId][buyer] += amount;

        uint256 excess = msg.value - cost;
        if (excess > 0) {
            (bool ok, ) = buyer.call{value: excess}("");
            require(ok, "refund failed");
        }

        emit SharesBought(mentorId, buyer, amount, cost);
    }

    /// Sell `amount` shares back to the curve. Payout is sent to seller.
    function sellShares(uint256 mentorId, uint32 amount, address seller)
        external
        onlyOwner
        nonReentrant
        poolExists(mentorId)
    {
        require(amount > 0, "amount = 0");
        SharePool storage pool = pools[mentorId];
        require(balanceOf[mentorId][seller] >= amount, "insufficient shares");

        if (seller == pool.creator) {
            require(balanceOf[mentorId][seller] - amount >= MENTOR_INITIAL, "cannot sell creator allocation");
        }

        uint256 payout = _sellProceeds(pool.sold, amount);
        pool.sold -= amount;
        balanceOf[mentorId][seller] -= amount;

        (bool ok, ) = seller.call{value: payout}("");
        require(ok, "payout failed");

        emit SharesSold(mentorId, seller, amount, payout);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function currentPrice(uint256 mentorId) external view poolExists(mentorId) returns (uint256) {
        return BASE_PRICE + (pools[mentorId].sold * PRICE_SLOPE);
    }

    function buyQuote(uint256 mentorId, uint32 amount) external view poolExists(mentorId) returns (uint256) {
        return _buyCost(pools[mentorId].sold, amount);
    }

    function sellQuote(uint256 mentorId, uint32 amount) external view poolExists(mentorId) returns (uint256) {
        return _sellProceeds(pools[mentorId].sold, amount);
    }

    function availableShares(uint256 mentorId) external view poolExists(mentorId) returns (uint32) {
        return CURATOR_POOL - pools[mentorId].sold;
    }

    // Sum of linear prices from sold to sold+amount-1
    function _buyCost(uint32 sold, uint32 amount) internal pure returns (uint256) {
        return amount * BASE_PRICE + PRICE_SLOPE * (uint256(amount) * sold + uint256(amount) * (amount - 1) / 2);
    }

    // Sell proceeds: integral from sold-amount to sold-1
    function _sellProceeds(uint32 sold, uint32 amount) internal pure returns (uint256) {
        require(sold >= amount, "sold underflow");
        uint32 newSold = sold - amount;
        return _buyCost(newSold, amount);
    }

    receive() external payable {}
}

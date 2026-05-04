// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice 30-day vesting escrow for mentor earnings.
/// If a mentor is inactive (no knowledge update) for more than STALE_PERIOD,
/// the platform can clawback unvested funds back to the curator pool.
contract VestingEscrow is Ownable, ReentrancyGuard {
    uint64 public constant VESTING_PERIOD = 30 days;
    uint64 public constant STALE_PERIOD = 30 days; // inactivity threshold for clawback

    struct VestingSchedule {
        uint256 total;
        uint256 claimed;
        uint64 startTime;
        uint64 lastMentorUpdate; // mirrors AIMentorINFT.lastUpdatedAt
        bool clawedBack;
    }

    // mentorId => schedule
    mapping(uint256 => VestingSchedule) public schedules;

    // Clawback sink: unclaimed vested funds go here for redistribution
    uint256 public clawbackPool;

    event VestingAdded(uint256 indexed mentorId, uint256 amount);
    event VestingClaimed(uint256 indexed mentorId, address indexed mentor, uint256 amount);
    event Clawback(uint256 indexed mentorId, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /// Called by MentorMarketplace when a mentor earns royalties.
    function addVesting(uint256 mentorId, uint64 mentorLastUpdate) external payable onlyOwner {
        require(msg.value > 0, "zero value");
        VestingSchedule storage s = schedules[mentorId];
        if (s.startTime == 0) {
            s.startTime = uint64(block.timestamp);
        }
        s.total += msg.value;
        s.lastMentorUpdate = mentorLastUpdate;
        emit VestingAdded(mentorId, msg.value);
    }

    /// Mentor claims vested portion. `mentor` must be verified by caller (MentorMarketplace).
    function claim(uint256 mentorId, address payable mentor) external onlyOwner nonReentrant {
        VestingSchedule storage s = schedules[mentorId];
        require(!s.clawedBack, "clawed back");
        require(s.total > 0, "no schedule");

        uint256 vested = _vestedAmount(s);
        uint256 claimable = vested - s.claimed;
        require(claimable > 0, "nothing to claim");

        s.claimed += claimable;
        (bool ok,) = mentor.call{value: claimable}("");
        require(ok, "transfer failed");
        emit VestingClaimed(mentorId, mentor, claimable);
    }

    /// Platform initiates clawback if mentor has been inactive past STALE_PERIOD.
    function clawback(uint256 mentorId) external onlyOwner nonReentrant {
        VestingSchedule storage s = schedules[mentorId];
        require(!s.clawedBack, "already clawed back");
        require(s.total > 0, "no schedule");
        require(
            block.timestamp > s.lastMentorUpdate + STALE_PERIOD,
            "mentor still active"
        );

        uint256 unvested = s.total - s.claimed;
        require(unvested > 0, "fully vested");
        s.clawedBack = true;
        clawbackPool += unvested;
        emit Clawback(mentorId, unvested);
    }

    /// Withdraw clawback pool to platform treasury.
    function withdrawClawbackPool(address payable to) external onlyOwner nonReentrant {
        uint256 amount = clawbackPool;
        require(amount > 0, "empty");
        clawbackPool = 0;
        (bool ok,) = to.call{value: amount}("");
        require(ok, "transfer failed");
    }

    function vestedAmount(uint256 mentorId) external view returns (uint256) {
        return _vestedAmount(schedules[mentorId]);
    }

    function claimableAmount(uint256 mentorId) external view returns (uint256) {
        VestingSchedule storage s = schedules[mentorId];
        return _vestedAmount(s) - s.claimed;
    }

    function vestingProgress(uint256 mentorId) external view returns (uint256 progressBps) {
        VestingSchedule storage s = schedules[mentorId];
        if (s.total == 0 || s.startTime == 0) return 0;
        uint64 elapsed = uint64(block.timestamp) - s.startTime;
        if (elapsed >= VESTING_PERIOD) return 10000;
        return (uint256(elapsed) * 10000) / VESTING_PERIOD;
    }

    function _vestedAmount(VestingSchedule storage s) internal view returns (uint256) {
        if (s.total == 0 || s.startTime == 0) return 0;
        uint64 elapsed = uint64(block.timestamp) - s.startTime;
        if (elapsed >= VESTING_PERIOD) return s.total;
        return (s.total * elapsed) / VESTING_PERIOD;
    }

    receive() external payable {}
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/AIMentorINFT.sol";
import "../src/AccessSharesMarket.sol";
import "../src/RevenueDistributor.sol";
import "../src/VestingEscrow.sol";
import "../src/MentorMarketplace.sol";

contract MentorMarketplaceTest is Test {
    AIMentorINFT inft;
    AccessSharesMarket shares;
    RevenueDistributor rev;
    VestingEscrow vest;
    MentorMarketplace marketplace;

    address mentor   = makeAddr("mentor");
    address curator1 = makeAddr("curator1");
    address curator2 = makeAddr("curator2");
    address learner  = makeAddr("learner");
    address oracle   = makeAddr("oracle");
    address platform = makeAddr("platform");

    uint256 mentorId;

    // Cache constants so prank is not consumed by static calls inline
    uint256 SUB_PRICE;
    uint256 Q_PRICE;

    function setUp() public {
        inft        = new AIMentorINFT();
        shares      = new AccessSharesMarket();
        rev         = new RevenueDistributor(address(shares));
        vest        = new VestingEscrow();
        marketplace = new MentorMarketplace(address(inft), address(shares), address(rev), address(vest));

        inft.transferOwnership(address(marketplace));
        shares.transferOwnership(address(marketplace));
        rev.transferOwnership(address(marketplace));
        vest.transferOwnership(address(marketplace));

        marketplace.setOracle(oracle, true);

        SUB_PRICE = rev.SUBSCRIPTION_PRICE();
        Q_PRICE   = rev.QUERY_PRICE();

        vm.deal(mentor,   10 ether);
        vm.deal(curator1, 10 ether);
        vm.deal(curator2, 10 ether);
        vm.deal(learner,  10 ether);

        vm.prank(mentor);
        mentorId = marketplace.registerMentor("IndoRegulator_01", "Regulatory Playbook", "0g://abc123");
    }

    // --- Minting ---

    function test_RegisterMentor() public view {
        AIMentorINFT.MentorMeta memory m = marketplace.getMentorInfo(mentorId);
        assertEq(m.creator, mentor);
        assertEq(m.name, "IndoRegulator_01");
        assertEq(uint8(m.status), uint8(AIMentorINFT.Status.DRAFT));
        assertEq(marketplace.getShareBalance(mentorId, mentor), shares.MENTOR_INITIAL());
    }

    function test_UpdateKnowledge() public {
        vm.prank(mentor);
        marketplace.updateKnowledge(mentorId, "0g://newref456", 88);
        AIMentorINFT.MentorMeta memory m = marketplace.getMentorInfo(mentorId);
        assertEq(m.confidenceScore, 88);
        assertEq(m.storageRef, "0g://newref456");
    }

    function test_OracleUpdateStorageRef() public {
        vm.prank(oracle);
        inft.updateStorageRef(mentorId, "0g://oracle-ref", 77);

        AIMentorINFT.MentorMeta memory m = marketplace.getMentorInfo(mentorId);
        assertEq(m.confidenceScore, 77);
        assertEq(m.storageRef, "0g://oracle-ref");
    }

    function test_UpdateStorageRef_RevertIfNotOracle() public {
        vm.prank(learner);
        vm.expectRevert("not oracle");
        inft.updateStorageRef(mentorId, "0g://bad-ref", 77);
    }

    function test_UpdateStorageRef_RevertIfScoreTooHigh() public {
        vm.prank(oracle);
        vm.expectRevert("score > 100");
        inft.updateStorageRef(mentorId, "0g://bad-score", 101);
    }

    function test_SetMentorStatus_READY() public {
        vm.startPrank(mentor);
        marketplace.setMentorStatus(mentorId, AIMentorINFT.Status.REVIEW);
        marketplace.setMentorStatus(mentorId, AIMentorINFT.Status.READY);
        vm.stopPrank();
        AIMentorINFT.MentorMeta memory m = marketplace.getMentorInfo(mentorId);
        assertEq(uint8(m.status), uint8(AIMentorINFT.Status.READY));
    }

    // --- Shares ---

    function test_BuyShares_Price() public view {
        uint256 quotedCost = shares.buyQuote(mentorId, 10);
        uint256 price0 = shares.BASE_PRICE();
        // 10 shares at slots 0-9: sum = 10*BASE_PRICE + SLOPE*(0+1+...+9)
        uint256 expected = 10 * price0 + shares.PRICE_SLOPE() * 45;
        assertEq(quotedCost, expected);
    }

    function test_BuyShares_BalanceUpdated() public {
        uint256 cost = shares.buyQuote(mentorId, 10);
        vm.prank(curator1);
        marketplace.buyShares{value: cost + 0.1 ether}(mentorId, 10);
        assertEq(marketplace.getShareBalance(mentorId, curator1), 10);
    }

    function test_BuyShares_Refund() public {
        uint256 cost = shares.buyQuote(mentorId, 10);
        uint256 before = curator1.balance;
        vm.prank(curator1);
        marketplace.buyShares{value: cost + 1 ether}(mentorId, 10);
        assertApproxEqAbs(curator1.balance, before - cost, 1);
    }

    function test_SellShares() public {
        uint256 cost = shares.buyQuote(mentorId, 20);
        vm.prank(curator1);
        marketplace.buyShares{value: cost + 0.5 ether}(mentorId, 20);

        uint256 before = curator1.balance;
        uint256 payout = shares.sellQuote(mentorId, 10);
        vm.prank(curator1);
        marketplace.sellShares(mentorId, 10);

        assertApproxEqAbs(curator1.balance, before + payout, 1);
        assertEq(marketplace.getShareBalance(mentorId, curator1), 10);
    }

    // --- Subscriptions & queries ---

    function test_Subscribe() public {
        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);
        assertTrue(marketplace.isSubscribed(mentorId, learner));
    }

    function test_Subscribe_Extends() public {
        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);
        uint64 first = rev.subscriptions(mentorId, learner);

        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);
        uint64 second = rev.subscriptions(mentorId, learner);

        assertEq(second, first + 30 days);
    }

    function test_ExecuteQuery_PayPerQuery() public {
        vm.prank(learner);
        marketplace.executeQuery{value: Q_PRICE}(mentorId);
        assertGt(rev.mentorClaimable(mentorId), 0);
    }

    function test_ExecuteQuery_SubscribedFree() public {
        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);

        uint256 before = learner.balance;
        vm.prank(learner);
        marketplace.executeQuery{value: 0}(mentorId);
        assertEq(learner.balance, before);
    }

    // --- Revenue distribution ---

    function test_Revenue_SplitCorrect() public {
        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);

        uint256 expectedMentor   = (SUB_PRICE * 6000) / 10000;
        uint256 expectedCurator  = (SUB_PRICE * 2500) / 10000;
        uint256 expectedPlatform = SUB_PRICE - expectedMentor - expectedCurator;

        assertEq(rev.mentorClaimable(mentorId),  expectedMentor);
        assertEq(rev.curatorPoolTotal(mentorId), expectedCurator);
        assertEq(rev.platformClaimable(),        expectedPlatform);
    }

    function test_CuratorRewards_ProRata() public {
        uint256 cost1 = shares.buyQuote(mentorId, 100);
        vm.prank(curator1);
        marketplace.buyShares{value: cost1 + 1 ether}(mentorId, 100);

        uint256 cost2 = shares.buyQuote(mentorId, 150);
        vm.prank(curator2);
        marketplace.buyShares{value: cost2 + 1 ether}(mentorId, 150);

        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);

        uint256 curatorPool = rev.curatorPoolTotal(mentorId);
        uint256 expected1   = (curatorPool * 100) / 1000; // 10%
        uint256 expected2   = (curatorPool * 150) / 1000; // 15%

        assertApproxEqAbs(rev.pendingCuratorRewards(mentorId, curator1), expected1, 1);
        assertApproxEqAbs(rev.pendingCuratorRewards(mentorId, curator2), expected2, 1);
    }

    function test_MentorRoyaltyClaim() public {
        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);

        uint256 claimable = rev.mentorClaimable(mentorId);
        uint256 before    = mentor.balance;
        vm.prank(mentor);
        marketplace.claimMentorRoyalty(mentorId);
        assertApproxEqAbs(mentor.balance, before + claimable, 1);
        assertEq(rev.mentorClaimable(mentorId), 0);
    }

    // --- Vesting ---

    function test_VestEarnings_Linear() public {
        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);

        vm.prank(mentor);
        marketplace.vestEarnings(mentorId);

        assertEq(marketplace.getVestingProgress(mentorId), 0);

        vm.warp(block.timestamp + 15 days);
        assertApproxEqAbs(marketplace.getVestingProgress(mentorId), 5000, 10);

        vm.warp(block.timestamp + 15 days);
        assertEq(marketplace.getVestingProgress(mentorId), 10000);
    }

    function test_VestEarnings_ClaimAfterFullVest() public {
        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);

        uint256 vested = rev.mentorClaimable(mentorId);

        vm.prank(mentor);
        marketplace.vestEarnings(mentorId);

        vm.warp(block.timestamp + 30 days);

        uint256 before = mentor.balance;
        vm.prank(mentor);
        marketplace.claimVested(mentorId);
        assertApproxEqAbs(mentor.balance, before + vested, 1);
    }

    // --- Oracle: gap tracking ---

    function test_OracleIncrementsGap() public {
        vm.prank(oracle);
        inft.incrementGapCount(mentorId);
        assertEq(inft.mentors(mentorId).gapCount, 1);
    }

    function test_OracleResolvesGap() public {
        vm.prank(oracle);
        inft.incrementGapCount(mentorId);
        vm.prank(oracle);
        inft.resolveGap(mentorId);
        assertEq(inft.mentors(mentorId).gapCount, 0);
    }

    function test_OracleUpdatesConfidence() public {
        vm.prank(oracle);
        inft.updateConfidence(mentorId, 92);
        assertEq(inft.mentors(mentorId).confidenceScore, 92);
    }

    // --- Access control ---

    function test_NonMentor_CannotUpdateKnowledge() public {
        vm.prank(curator1);
        vm.expectRevert("not mentor owner");
        marketplace.updateKnowledge(mentorId, "evil://ref", 99);
    }

    function test_NonOracle_CannotIncrementGap() public {
        vm.prank(learner);
        vm.expectRevert("not oracle");
        inft.incrementGapCount(mentorId);
    }

    function test_CreatorCannotSellInitialAllocation() public {
        vm.prank(mentor);
        vm.expectRevert("cannot sell creator allocation");
        marketplace.sellShares(mentorId, 1);
    }

    // --- Clawback ---

    function test_Clawback_FailsIfMentorActive() public {
        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);

        vm.prank(mentor);
        marketplace.vestEarnings(mentorId);

        vm.expectRevert("mentor still active");
        marketplace.triggerClawback(mentorId);
    }

    function test_Clawback_SucceedsAfterStalePeriod() public {
        vm.prank(learner);
        marketplace.subscribe{value: SUB_PRICE}(mentorId);

        vm.prank(mentor);
        marketplace.vestEarnings(mentorId);

        vm.warp(block.timestamp + 31 days);

        uint256 poolBefore = vest.clawbackPool();
        marketplace.triggerClawback(mentorId);
        assertGt(vest.clawbackPool(), poolBefore);
    }
}

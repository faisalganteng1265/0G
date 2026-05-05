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
    address learner;
    address oracle   = makeAddr("oracle");
    address platform = makeAddr("platform");
    uint256 proofOraclePk = 0xA11CE;
    uint256 learnerPk = 0xB0B;
    address proofOracle;

    uint256 mentorId;

    // Cache constants so prank is not consumed by static calls inline
    uint256 SUB_PRICE;
    uint256 Q_PRICE;

    function setUp() public {
        proofOracle = vm.addr(proofOraclePk);
        learner = vm.addr(learnerPk);

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
        marketplace.setOracle(proofOracle, true);

        SUB_PRICE = rev.SUBSCRIPTION_PRICE();
        Q_PRICE   = rev.QUERY_PRICE();

        vm.deal(mentor,   10 ether);
        vm.deal(curator1, 10 ether);
        vm.deal(curator2, 10 ether);
        vm.deal(learner,  10 ether);

        vm.prank(mentor);
        mentorId = marketplace.registerMentor("IndoRegulator_01", "Regulatory Playbook", "0g://abc123");
    }

    function _packSignature(uint8 v, bytes32 r, bytes32 s) internal pure returns (bytes memory) {
        return abi.encodePacked(r, s, v);
    }

    function _ethSignedHash(bytes32 msgHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash));
    }

    function _accessSignature(
        address to,
        bytes32 oldDataHash,
        bytes32 newDataHash,
        bytes memory accessNonce,
        bytes memory encryptedPubKey
    ) internal view returns (bytes memory) {
        bytes32 accessHash = keccak256(abi.encode(
            address(inft),
            block.chainid,
            oldDataHash,
            newDataHash,
            keccak256(accessNonce),
            keccak256(encryptedPubKey)
        ));
        uint256 signerPk = to == learner ? learnerPk : proofOraclePk;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, _ethSignedHash(accessHash));
        return _packSignature(v, r, s);
    }

    function _ownershipSignature(
        bytes32 oldDataHash,
        bytes32 newDataHash,
        bytes memory sealedKey,
        bytes memory encryptedPubKey,
        bytes memory ownershipNonce
    ) internal view returns (bytes memory) {
        bytes32 ownershipHash = keccak256(abi.encode(
            address(inft),
            block.chainid,
            IERC7857DataVerifier.OracleType.TEE,
            oldDataHash,
            newDataHash,
            keccak256(sealedKey),
            keccak256(encryptedPubKey),
            keccak256(ownershipNonce)
        ));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(proofOraclePk, _ethSignedHash(ownershipHash));
        return _packSignature(v, r, s);
    }

    function _proofs(address to, uint256 tokenId, bytes memory sealedKey)
        internal
        view
        returns (IERC7857DataVerifier.TransferValidityProof[] memory)
    {
        AIMentorINFT.MentorMeta memory meta = marketplace.getMentorInfo(tokenId);
        bytes32 oldDataHash = keccak256(bytes(meta.storageRef));
        bytes32 newDataHash = oldDataHash;
        bytes memory encryptedPubKey = abi.encodePacked(to);
        bytes memory accessNonce = abi.encodePacked("access", tokenId, to, sealedKey);
        bytes memory ownershipNonce = abi.encodePacked("ownership", tokenId, to, sealedKey);

        IERC7857DataVerifier.TransferValidityProof[] memory proofs =
            new IERC7857DataVerifier.TransferValidityProof[](1);
        proofs[0] = IERC7857DataVerifier.TransferValidityProof({
            accessProof: IERC7857DataVerifier.AccessProof({
                oldDataHash: oldDataHash,
                newDataHash: newDataHash,
                nonce: accessNonce,
                encryptedPubKey: encryptedPubKey,
                proof: _accessSignature(to, oldDataHash, newDataHash, accessNonce, encryptedPubKey)
            }),
            ownershipProof: IERC7857DataVerifier.OwnershipProof({
                oracleType: IERC7857DataVerifier.OracleType.TEE,
                oldDataHash: oldDataHash,
                newDataHash: newDataHash,
                sealedKey: sealedKey,
                encryptedPubKey: encryptedPubKey,
                nonce: ownershipNonce,
                proof: _ownershipSignature(oldDataHash, newDataHash, sealedKey, encryptedPubKey, ownershipNonce)
            })
        });
        return proofs;
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

    // --- ERC-7857 ---

    function test_ERC7857_SetSealedKey() public {
        bytes memory sealedKey = hex"010203";

        vm.prank(oracle);
        inft.setSealedKey(mentorId, sealedKey);

        assertEq(inft.sealedKeyOf(mentorId), sealedKey);
    }

    function test_ERC7857_TransferWithOracleProof() public {
        bytes memory sealedKey = hex"aabbcc";
        IERC7857DataVerifier.TransferValidityProof[] memory proofs = _proofs(learner, mentorId, sealedKey);

        vm.prank(mentor);
        inft.iTransfer(learner, mentorId, proofs);

        assertEq(inft.ownerOf(mentorId), learner);
        assertEq(inft.sealedKeyOf(mentorId), sealedKey);
    }

    function test_ERC7857_TransferRevertsIfCallerNotAuthorized() public {
        bytes memory sealedKey = hex"aabbcc";
        IERC7857DataVerifier.TransferValidityProof[] memory proofs = _proofs(learner, mentorId, sealedKey);

        vm.prank(curator1);
        vm.expectRevert("not owner or approved");
        inft.iTransfer(learner, mentorId, proofs);
    }

    function test_ERC7857_TransferRevertsIfProofInvalid() public {
        bytes memory sealedKey = hex"aabbcc";
        IERC7857DataVerifier.TransferValidityProof[] memory proofs = _proofs(learner, mentorId, sealedKey);
        proofs[0].ownershipProof.sealedKey = hex"deadbeef";

        vm.prank(mentor);
        vm.expectRevert("invalid oracle proof");
        inft.iTransfer(learner, mentorId, proofs);
    }

    function test_ERC7857_CloneWithOracleProof() public {
        bytes memory sealedKey = hex"c0ffee";
        IERC7857DataVerifier.TransferValidityProof[] memory proofs = _proofs(learner, mentorId, sealedKey);

        vm.prank(mentor);
        uint256 cloneId = inft.iClone(learner, mentorId, proofs);

        assertEq(inft.ownerOf(cloneId), learner);
        assertEq(inft.sealedKeyOf(cloneId), sealedKey);

        AIMentorINFT.MentorMeta memory original = marketplace.getMentorInfo(mentorId);
        AIMentorINFT.MentorMeta memory cloned = marketplace.getMentorInfo(cloneId);
        assertEq(cloned.storageRef, original.storageRef);
        assertEq(cloned.name, original.name);
    }

    function test_ERC7857_CloneRevertsIfCallerNotAuthorized() public {
        bytes memory sealedKey = hex"c0ffee";
        IERC7857DataVerifier.TransferValidityProof[] memory proofs = _proofs(learner, mentorId, sealedKey);

        vm.prank(curator1);
        vm.expectRevert("not owner or approved");
        inft.iClone(learner, mentorId, proofs);
    }

    function test_ERC7857_AuthorizeUsage() public {
        vm.prank(mentor);
        inft.authorizeUsage(mentorId, learner);

        address[] memory users = inft.authorizedUsersOf(mentorId);
        assertEq(users.length, 1);
        assertEq(users[0], learner);
    }

    function test_ERC7857_RevokeAuthorization() public {
        vm.prank(mentor);
        inft.authorizeUsage(mentorId, learner);

        vm.prank(mentor);
        inft.revokeAuthorization(mentorId, learner);

        address[] memory users = inft.authorizedUsersOf(mentorId);
        assertEq(users.length, 0);
    }

    function test_ERC7857_DelegateAccess() public {
        vm.prank(learner);
        inft.delegateAccess(oracle);

        assertEq(inft.getDelegateAccess(learner), oracle);
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

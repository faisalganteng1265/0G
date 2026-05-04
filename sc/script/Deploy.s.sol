// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/AIMentorINFT.sol";
import "../src/AccessSharesMarket.sol";
import "../src/RevenueDistributor.sol";
import "../src/VestingEscrow.sol";
import "../src/MentorMarketplace.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        // 1. Deploy core components
        AIMentorINFT inft = new AIMentorINFT();
        AccessSharesMarket shares = new AccessSharesMarket();
        RevenueDistributor rev = new RevenueDistributor(address(shares));
        VestingEscrow vest = new VestingEscrow();

        // 2. Deploy marketplace (orchestrator)
        MentorMarketplace marketplace = new MentorMarketplace(
            address(inft),
            address(shares),
            address(rev),
            address(vest)
        );

        // 3. Transfer ownership of sub-contracts to marketplace
        inft.transferOwnership(address(marketplace));
        shares.transferOwnership(address(marketplace));
        rev.transferOwnership(address(marketplace));
        vest.transferOwnership(address(marketplace));

        // 4. Set deployer as oracle (can be updated after TEE setup)
        marketplace.setOracle(deployer, true);

        vm.stopBroadcast();

        console.log("=== AI Mentor Marketplace Deployed ===");
        console.log("AIMentorINFT:       ", address(inft));
        console.log("AccessSharesMarket: ", address(shares));
        console.log("RevenueDistributor: ", address(rev));
        console.log("VestingEscrow:      ", address(vest));
        console.log("MentorMarketplace:  ", address(marketplace));
    }
}

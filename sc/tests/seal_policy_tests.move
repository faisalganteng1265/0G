#[test_only]
module tacit::seal_policy_tests;

use std::string;
use std::unit_test::destroy;
use sui::clock;
use sui::test_scenario;
use tacit::config;
use tacit::mentor_nft;
use tacit::seal_policy;
use tacit::shares_market;

const ALICE: address = @0xA11CE; // creator, holds the initial 500 shares
const BOB: address = @0xB0B; // buys shares -> should be approved
const EVE: address = @0xE7E; // no shares, no allow-list entry -> should be denied
const CAROL: address = @0xCA201; // explicitly allow-listed despite zero shares

#[test]
fun test_seal_approve_allows_shareholder() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx());
    let test_clock = clock::create_for_testing(scenario.ctx());

    let (nft, state) = mentor_nft::register(
        string::utf8(b"Mentor"),
        string::utf8(b"Cat"),
        string::utf8(b"blob"),
        &test_clock,
        scenario.ctx(),
    );
    let pool = shares_market::new_pool(object::id(&state), ALICE, scenario.ctx());

    scenario.next_tx(ALICE);
    let config_obj = scenario.take_shared<config::PlatformConfig>();

    // Alice holds the creator's initial 500 shares -> approved.
    seal_policy::seal_approve(b"id", &state, &pool, &config_obj, scenario.ctx());

    destroy(nft);
    destroy(state);
    destroy(pool);
    test_scenario::return_shared(config_obj);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = seal_policy::ENoAccess)]
fun test_seal_approve_denies_non_shareholder() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx());
    let test_clock = clock::create_for_testing(scenario.ctx());

    let (nft, state) = mentor_nft::register(
        string::utf8(b"Mentor"),
        string::utf8(b"Cat"),
        string::utf8(b"blob"),
        &test_clock,
        scenario.ctx(),
    );
    let pool = shares_market::new_pool(object::id(&state), ALICE, scenario.ctx());

    scenario.next_tx(EVE);
    let config_obj = scenario.take_shared<config::PlatformConfig>();
    seal_policy::seal_approve(b"id", &state, &pool, &config_obj, scenario.ctx());

    destroy(nft);
    destroy(state);
    destroy(pool);
    test_scenario::return_shared(config_obj);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
fun test_seal_approve_allows_oracle_address() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx()); // ALICE is registered as the default oracle address
    let test_clock = clock::create_for_testing(scenario.ctx());

    let (nft, state) = mentor_nft::register(
        string::utf8(b"Mentor"),
        string::utf8(b"Cat"),
        string::utf8(b"blob"),
        &test_clock,
        scenario.ctx(),
    );
    let pool = shares_market::new_pool(object::id(&state), BOB, scenario.ctx());

    scenario.next_tx(ALICE);
    let config_obj = scenario.take_shared<config::PlatformConfig>();
    // ALICE owns 0 shares of this pool (BOB is creator here) but is the oracle address.
    seal_policy::seal_approve(b"id", &state, &pool, &config_obj, scenario.ctx());

    destroy(nft);
    destroy(state);
    destroy(pool);
    test_scenario::return_shared(config_obj);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
fun test_seal_approve_allows_allow_listed_address() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx());
    let test_clock = clock::create_for_testing(scenario.ctx());

    let (nft, mut state) = mentor_nft::register(
        string::utf8(b"Mentor"),
        string::utf8(b"Cat"),
        string::utf8(b"blob"),
        &test_clock,
        scenario.ctx(),
    );
    let pool = shares_market::new_pool(object::id(&state), ALICE, scenario.ctx());
    mentor_nft::grant_access(&nft, &mut state, CAROL);

    scenario.next_tx(CAROL);
    let config_obj = scenario.take_shared<config::PlatformConfig>();
    seal_policy::seal_approve(b"id", &state, &pool, &config_obj, scenario.ctx());

    destroy(nft);
    destroy(state);
    destroy(pool);
    test_scenario::return_shared(config_obj);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

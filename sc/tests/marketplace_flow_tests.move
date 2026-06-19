#[test_only]
module tacit::marketplace_flow_tests;

use std::string;
use std::unit_test::destroy;
use sui::clock::{Self, Clock};
use sui::coin;
use sui::sui::SUI;
use sui::test_scenario;
use tacit::config;
use tacit::marketplace;
use tacit::mentor_nft::{Self, MentorNFT, MentorState};
use tacit::revenue::RevenuePool;
use tacit::shares_market::SharePool;
use tacit::vesting::VestingSchedule;

const ALICE: address = @0xA11CE; // mentor
const BOB: address = @0xB0B; // shareholder/learner
const DAY_MS: u64 = 86_400_000;

/// End-to-end narrative mirroring the original Solidity suite's overall
/// coverage: register -> buy shares -> execute query -> claim curator
/// rewards -> vest mentor earnings -> claim vested -> clawback after a
/// stale period.
#[test]
fun test_full_marketplace_flow() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx());
    let mut test_clock = clock::create_for_testing(scenario.ctx());

    scenario.next_tx(ALICE);
    marketplace::register_mentor(
        string::utf8(b"Regulatory Insider"),
        string::utf8(b"Compliance"),
        string::utf8(b"walrus-blob-1"),
        &test_clock,
        scenario.ctx(),
    );

    scenario.next_tx(ALICE);
    let nft = scenario.take_from_sender<MentorNFT>();
    let state = scenario.take_shared<MentorState>();
    let mut share_pool = scenario.take_shared<SharePool>();
    let mut revenue_pool = scenario.take_shared<RevenuePool>();
    let mut vesting_schedule = scenario.take_shared<VestingSchedule>();

    assert!(state.status() == mentor_nft::status_draft());
    assert!(share_pool.balance_of(ALICE) == tacit::shares_market::mentor_initial());

    // Bob buys 100 curator-pool shares.
    scenario.next_tx(BOB);
    let buy_cost = share_pool.buy_quote(100);
    let buy_payment = coin::mint_for_testing<SUI>(buy_cost, scenario.ctx());
    let buy_change = tacit::shares_market::buy_shares(&mut share_pool, buy_payment, 100, scenario.ctx());
    destroy(buy_change);
    assert!(share_pool.balance_of(BOB) == 100);

    // Bob executes a paid query against the mentor he now holds shares in.
    let query_price = tacit::revenue::query_price();
    let query_payment = coin::mint_for_testing<SUI>(query_price, scenario.ctx());
    let query_change = marketplace::execute_query(&state, &share_pool, &mut revenue_pool, query_payment, scenario.ctx());
    destroy(query_change);
    assert!(revenue_pool.mentor_claimable() == query_price * 6000 / 10000);

    // Bob claims his pro-rata curator reward (self-transferred by the facade).
    marketplace::claim_curator_rewards(&mut revenue_pool, &share_pool, scenario.ctx());
    scenario.next_tx(BOB);
    let curator_payout = scenario.take_from_sender<coin::Coin<SUI>>();
    assert!(curator_payout.value() > 0);

    scenario.next_tx(ALICE);
    // Mentor pushes earnings into vesting instead of claiming immediately.
    marketplace::vest_earnings(&nft, &state, &mut revenue_pool, &mut vesting_schedule, &test_clock, scenario.ctx());
    assert!(revenue_pool.mentor_claimable() == 0);
    assert!(vesting_schedule.total() == query_price * 6000 / 10000);

    clock::increment_for_testing(&mut test_clock, 30 * DAY_MS);
    scenario.next_tx(ALICE);
    let config_obj = scenario.take_shared<config::PlatformConfig>();
    marketplace::claim_vested(&nft, &mut vesting_schedule, &config_obj, &test_clock, scenario.ctx());
    assert!(vesting_schedule.claimed() == vesting_schedule.total());

    destroy(curator_payout);
    test_scenario::return_to_sender(&scenario, nft);
    test_scenario::return_shared(state);
    test_scenario::return_shared(share_pool);
    test_scenario::return_shared(revenue_pool);
    test_scenario::return_shared(vesting_schedule);
    test_scenario::return_shared(config_obj);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
fun test_clawback_after_mentor_goes_stale() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx());
    let mut test_clock = clock::create_for_testing(scenario.ctx());

    scenario.next_tx(ALICE);
    marketplace::register_mentor(
        string::utf8(b"Founder Playbook"),
        string::utf8(b"Strategy"),
        string::utf8(b"walrus-blob-2"),
        &test_clock,
        scenario.ctx(),
    );

    scenario.next_tx(ALICE);
    let nft = scenario.take_from_sender<MentorNFT>();
    let state = scenario.take_shared<MentorState>();
    let mut revenue_pool = scenario.take_shared<RevenuePool>();
    let mut vesting_schedule = scenario.take_shared<VestingSchedule>();

    let query_price = tacit::revenue::query_price();
    let query_payment = coin::mint_for_testing<SUI>(query_price, scenario.ctx());
    let change = tacit::revenue::pay_query(&mut revenue_pool, query_payment, scenario.ctx());
    destroy(change);

    marketplace::vest_earnings(&nft, &state, &mut revenue_pool, &mut vesting_schedule, &test_clock, scenario.ctx());

    // Mentor goes silent for 31 days — past the 30-day stale period.
    clock::increment_for_testing(&mut test_clock, 31 * DAY_MS);

    let admin_cap = scenario.take_from_sender<config::AdminCap>();
    let config_obj = scenario.take_shared<config::PlatformConfig>();
    let mut clawback_pool = tacit::vesting::new_clawback_pool(scenario.ctx());

    tacit::vesting::clawback(&admin_cap, &mut vesting_schedule, &mut clawback_pool, &config_obj, &test_clock);
    assert!(tacit::vesting::is_clawed_back(&vesting_schedule));

    destroy(clawback_pool);
    test_scenario::return_to_sender(&scenario, admin_cap);
    test_scenario::return_to_sender(&scenario, nft);
    test_scenario::return_shared(state);
    test_scenario::return_shared(revenue_pool);
    test_scenario::return_shared(vesting_schedule);
    test_scenario::return_shared(config_obj);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

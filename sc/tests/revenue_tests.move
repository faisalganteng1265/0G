#[test_only]
module tacit::revenue_tests;

use std::string;
use std::unit_test::destroy;
use sui::clock;
use sui::coin;
use sui::sui::SUI;
use sui::test_scenario;
use tacit::mentor_nft;
use tacit::revenue;
use tacit::shares_market;

const ALICE: address = @0xA11CE; // mentor/creator
const BOB: address = @0xB0B; // curator/shareholder

#[test]
fun test_pay_query_splits_60_25_15() {
    let mut scenario = test_scenario::begin(ALICE);
    let mentor_state_id = object::id_from_address(@0x1);
    let mut pool = revenue::new_pool(mentor_state_id, scenario.ctx());

    let price = revenue::query_price();
    let payment = coin::mint_for_testing<SUI>(price, scenario.ctx());
    let change = revenue::pay_query(&mut pool, payment, scenario.ctx());

    assert!(change.value() == 0);
    assert!(pool.mentor_claimable() == price * 6000 / 10000);

    destroy(change);
    destroy(pool);
    scenario.end();
}

#[test]
fun test_mentor_royalty_claim_zeroes_claimable() {
    let mut scenario = test_scenario::begin(ALICE);
    let test_clock = clock::create_for_testing(scenario.ctx());

    let (nft, state) = mentor_nft::register(
        string::utf8(b"Mentor"),
        string::utf8(b"Cat"),
        string::utf8(b"blob"),
        &test_clock,
        scenario.ctx(),
    );
    let mentor_state_id = object::id(&state);
    let mut pool = revenue::new_pool(mentor_state_id, scenario.ctx());

    let price = revenue::query_price();
    let payment = coin::mint_for_testing<SUI>(price, scenario.ctx());
    let change = revenue::pay_query(&mut pool, payment, scenario.ctx());
    destroy(change);

    let payout = revenue::claim_mentor_royalty(&nft, &mut pool, scenario.ctx());
    assert!(payout.value() > 0);
    assert!(pool.mentor_claimable() == 0);

    destroy(payout);
    destroy(nft);
    destroy(state);
    destroy(pool);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
fun test_curator_rewards_pro_rata() {
    let mut scenario = test_scenario::begin(ALICE);
    let mentor_state_id = object::id_from_address(@0x1);
    let mut pool = revenue::new_pool(mentor_state_id, scenario.ctx());
    let mut share_pool = shares_market::new_pool(mentor_state_id, ALICE, scenario.ctx());

    scenario.next_tx(BOB);
    let buy_cost = share_pool.buy_quote(100);
    let buy_payment = coin::mint_for_testing<SUI>(buy_cost, scenario.ctx());
    let buy_change = shares_market::buy_shares(&mut share_pool, buy_payment, 100, scenario.ctx());
    destroy(buy_change);

    let price = revenue::query_price();
    let payment = coin::mint_for_testing<SUI>(price, scenario.ctx());
    let change = revenue::pay_query(&mut pool, payment, scenario.ctx());
    destroy(change);

    // Bob holds 100/1000 shares -> entitled to 100/1000 of the curator pool.
    let pending = revenue::pending_curator_rewards(&pool, &share_pool, BOB);
    let expected_curator_pool = price * 2500 / 10000;
    assert!(pending == expected_curator_pool * 100 / 1000);

    let payout = revenue::claim_curator_rewards(&mut pool, &share_pool, scenario.ctx());
    assert!(payout.value() == pending);

    destroy(payout);
    destroy(pool);
    destroy(share_pool);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = revenue::ENothingClaimable)]
fun test_claim_mentor_royalty_fails_when_nothing_claimable() {
    let mut scenario = test_scenario::begin(ALICE);
    let test_clock = clock::create_for_testing(scenario.ctx());

    let (nft, state) = mentor_nft::register(
        string::utf8(b"Mentor"),
        string::utf8(b"Cat"),
        string::utf8(b"blob"),
        &test_clock,
        scenario.ctx(),
    );
    let mentor_state_id = object::id(&state);
    let mut pool = revenue::new_pool(mentor_state_id, scenario.ctx());

    let payout = revenue::claim_mentor_royalty(&nft, &mut pool, scenario.ctx());
    destroy(payout);
    destroy(nft);
    destroy(state);
    destroy(pool);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

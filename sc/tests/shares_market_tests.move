#[test_only]
module tacit::shares_market_tests;

use sui::coin;
use sui::sui::SUI;
use sui::test_scenario;
use std::unit_test::destroy;
use tacit::shares_market;

const ALICE: address = @0xA11CE;
const BOB: address = @0xB0B;

#[test]
fun test_initial_pool_grants_creator_initial_shares() {
    let mut scenario = test_scenario::begin(ALICE);
    let pool = shares_market::new_pool(object::id_from_address(@0x1), ALICE, scenario.ctx());
    assert!(pool.balance_of(ALICE) == shares_market::mentor_initial());
    assert!(pool.sold() == 0);
    destroy(pool);
    scenario.end();
}

#[test]
fun test_buy_shares_updates_balance_and_price() {
    let mut scenario = test_scenario::begin(ALICE);
    let mut pool = shares_market::new_pool(object::id_from_address(@0x1), ALICE, scenario.ctx());

    scenario.next_tx(BOB);
    let cost = pool.buy_quote(10);
    let payment = coin::mint_for_testing<SUI>(cost, scenario.ctx());
    let change = shares_market::buy_shares(&mut pool, payment, 10, scenario.ctx());

    assert!(change.value() == 0);
    assert!(pool.balance_of(BOB) == 10);
    assert!(pool.sold() == 10);
    assert!(pool.current_price() > 10_000_000); // base price in MIST

    destroy(change);
    destroy(pool);
    scenario.end();
}

#[test]
fun test_buy_shares_refunds_excess_payment() {
    let mut scenario = test_scenario::begin(ALICE);
    let mut pool = shares_market::new_pool(object::id_from_address(@0x1), ALICE, scenario.ctx());

    scenario.next_tx(BOB);
    let cost = pool.buy_quote(5);
    let payment = coin::mint_for_testing<SUI>(cost + 1_000_000, scenario.ctx());
    let change = shares_market::buy_shares(&mut pool, payment, 5, scenario.ctx());

    assert!(change.value() == 1_000_000);
    destroy(change);
    destroy(pool);
    scenario.end();
}

#[test]
fun test_sell_shares_pays_out_and_updates_balance() {
    let mut scenario = test_scenario::begin(ALICE);
    let mut pool = shares_market::new_pool(object::id_from_address(@0x1), ALICE, scenario.ctx());

    scenario.next_tx(BOB);
    let cost = pool.buy_quote(20);
    let payment = coin::mint_for_testing<SUI>(cost, scenario.ctx());
    let change = shares_market::buy_shares(&mut pool, payment, 20, scenario.ctx());
    destroy(change);

    let payout = shares_market::sell_shares(&mut pool, 8, scenario.ctx());
    assert!(payout.value() > 0);
    assert!(pool.balance_of(BOB) == 12);
    assert!(pool.sold() == 12);

    destroy(payout);
    destroy(pool);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = shares_market::ECreatorLock)]
fun test_creator_cannot_sell_below_initial_allocation() {
    let mut scenario = test_scenario::begin(ALICE);
    let mut pool = shares_market::new_pool(object::id_from_address(@0x1), ALICE, scenario.ctx());

    scenario.next_tx(ALICE);
    let payout = shares_market::sell_shares(&mut pool, 1, scenario.ctx());
    destroy(payout);
    destroy(pool);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = shares_market::ESoldOut)]
fun test_cannot_buy_more_than_curator_pool() {
    let mut scenario = test_scenario::begin(ALICE);
    let mut pool = shares_market::new_pool(object::id_from_address(@0x1), ALICE, scenario.ctx());

    scenario.next_tx(BOB);
    let cost = pool.buy_quote(shares_market::curator_pool() + 1);
    let payment = coin::mint_for_testing<SUI>(cost, scenario.ctx());
    let change = shares_market::buy_shares(&mut pool, payment, shares_market::curator_pool() + 1, scenario.ctx());
    destroy(change);
    destroy(pool);
    scenario.end();
}

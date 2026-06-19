#[test_only]
module tacit::vesting_tests;

use std::string;
use std::unit_test::destroy;
use sui::clock;
use sui::coin;
use sui::sui::SUI;
use sui::test_scenario;
use tacit::config;
use tacit::mentor_nft;
use tacit::vesting;

const ALICE: address = @0xA11CE;
const DAY_MS: u64 = 86_400_000;

#[test]
fun test_linear_vesting_0_50_100_percent() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx());
    scenario.next_tx(ALICE);
    let config_obj = scenario.take_shared<config::PlatformConfig>();

    let mut test_clock = clock::create_for_testing(scenario.ctx());
    let (nft, state) = mentor_nft::register(
        string::utf8(b"Mentor"),
        string::utf8(b"Cat"),
        string::utf8(b"blob"),
        &test_clock,
        scenario.ctx(),
    );
    let mut schedule = vesting::new_schedule(object::id(&state), scenario.ctx());

    let payment = coin::mint_for_testing<SUI>(1000, scenario.ctx());
    vesting::add_vesting(&mut schedule, payment, 0, &test_clock);
    assert!(vesting::claimable_amount(&schedule, &config_obj, &test_clock) == 0);

    clock::increment_for_testing(&mut test_clock, 15 * DAY_MS);
    assert!(vesting::claimable_amount(&schedule, &config_obj, &test_clock) == 500);
    assert!(vesting::vesting_progress_bps(&schedule, &config_obj, &test_clock) == 5000);

    clock::increment_for_testing(&mut test_clock, 15 * DAY_MS);
    assert!(vesting::claimable_amount(&schedule, &config_obj, &test_clock) == 1000);
    assert!(vesting::vesting_progress_bps(&schedule, &config_obj, &test_clock) == 10000);

    let payout = vesting::claim(&nft, &mut schedule, &config_obj, &test_clock, scenario.ctx());
    assert!(payout.value() == 1000);

    destroy(payout);
    destroy(nft);
    destroy(state);
    destroy(schedule);
    test_scenario::return_shared(config_obj);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = vesting::ENotStale)]
fun test_clawback_fails_if_mentor_active() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx());
    scenario.next_tx(ALICE);
    let config_obj = scenario.take_shared<config::PlatformConfig>();
    let admin_cap = scenario.take_from_sender<config::AdminCap>();

    let test_clock = clock::create_for_testing(scenario.ctx());
    let mut schedule = vesting::new_schedule(object::id_from_address(@0x1), scenario.ctx());
    let mut pool = vesting::new_clawback_pool(scenario.ctx());

    let payment = coin::mint_for_testing<SUI>(1000, scenario.ctx());
    vesting::add_vesting(&mut schedule, payment, 0, &test_clock);

    vesting::clawback(&admin_cap, &mut schedule, &mut pool, &config_obj, &test_clock);

    destroy(schedule);
    destroy(pool);
    test_scenario::return_to_sender(&scenario, admin_cap);
    test_scenario::return_shared(config_obj);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
fun test_clawback_succeeds_after_stale_period() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx());
    scenario.next_tx(ALICE);
    let config_obj = scenario.take_shared<config::PlatformConfig>();
    let admin_cap = scenario.take_from_sender<config::AdminCap>();

    let mut test_clock = clock::create_for_testing(scenario.ctx());
    let mut schedule = vesting::new_schedule(object::id_from_address(@0x1), scenario.ctx());
    let mut pool = vesting::new_clawback_pool(scenario.ctx());

    let payment = coin::mint_for_testing<SUI>(1000, scenario.ctx());
    vesting::add_vesting(&mut schedule, payment, 0, &test_clock);

    clock::increment_for_testing(&mut test_clock, 31 * DAY_MS);
    vesting::clawback(&admin_cap, &mut schedule, &mut pool, &config_obj, &test_clock);
    assert!(vesting::is_clawed_back(&schedule));

    destroy(schedule);
    destroy(pool);
    test_scenario::return_to_sender(&scenario, admin_cap);
    test_scenario::return_shared(config_obj);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

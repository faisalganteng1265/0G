#[test_only]
module tacit::mentor_nft_tests;

use std::string;
use sui::clock;
use sui::test_scenario;
use tacit::config;
use tacit::mentor_nft;

const ALICE: address = @0xA11CE;
const BOB: address = @0xB0B;

fun new_mentor(scenario: &mut test_scenario::Scenario, test_clock: &sui::clock::Clock) {
    let (nft, state) = mentor_nft::register(
        string::utf8(b"Mentor"),
        string::utf8(b"Cat"),
        string::utf8(b"blob-v1"),
        test_clock,
        scenario.ctx(),
    );
    transfer::public_transfer(nft, scenario.ctx().sender());
    mentor_nft::share_state(state);
}

#[test]
fun test_register_sets_draft_status_and_creator() {
    let mut scenario = test_scenario::begin(ALICE);
    let test_clock = clock::create_for_testing(scenario.ctx());
    new_mentor(&mut scenario, &test_clock);

    scenario.next_tx(ALICE);
    let nft = scenario.take_from_sender<mentor_nft::MentorNFT>();
    let state = scenario.take_shared<mentor_nft::MentorState>();

    assert!(nft.creator() == ALICE);
    assert!(state.status() == mentor_nft::status_draft());
    assert!(state.gap_count() == 0);
    assert!(state.confidence_score() == 0);

    test_scenario::return_to_sender(&scenario, nft);
    test_scenario::return_shared(state);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
fun test_owner_can_update_knowledge_and_status() {
    let mut scenario = test_scenario::begin(ALICE);
    let mut test_clock = clock::create_for_testing(scenario.ctx());
    new_mentor(&mut scenario, &test_clock);

    scenario.next_tx(ALICE);
    let nft = scenario.take_from_sender<mentor_nft::MentorNFT>();
    let mut state = scenario.take_shared<mentor_nft::MentorState>();

    clock::increment_for_testing(&mut test_clock, 1000);
    mentor_nft::update_blob_id(&nft, &mut state, string::utf8(b"blob-v2"), &test_clock);
    mentor_nft::set_status(&nft, &mut state, mentor_nft::status_ready());

    assert!(state.blob_id() == string::utf8(b"blob-v2"));
    assert!(state.status() == mentor_nft::status_ready());

    test_scenario::return_to_sender(&scenario, nft);
    test_scenario::return_shared(state);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
fun test_oracle_can_update_confidence_and_gap() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx());
    let test_clock = clock::create_for_testing(scenario.ctx());
    new_mentor(&mut scenario, &test_clock);

    scenario.next_tx(ALICE);
    let oracle_cap = scenario.take_from_sender<config::OracleCap>();
    let mut state = scenario.take_shared<mentor_nft::MentorState>();

    mentor_nft::oracle_update_confidence(&oracle_cap, &mut state, 85, &test_clock);
    mentor_nft::oracle_increment_gap(&oracle_cap, &mut state);
    mentor_nft::oracle_increment_gap(&oracle_cap, &mut state);
    mentor_nft::oracle_resolve_gap(&oracle_cap, &mut state);
    mentor_nft::oracle_record_query(&oracle_cap, &mut state);

    assert!(state.confidence_score() == 85);
    assert!(state.gap_count() == 1);
    assert!(state.total_queries() == 1);

    test_scenario::return_to_sender(&scenario, oracle_cap);
    test_scenario::return_shared(state);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = mentor_nft::EGapAlreadyZero)]
fun test_resolve_gap_fails_when_already_zero() {
    let mut scenario = test_scenario::begin(ALICE);
    config::init_for_testing(scenario.ctx());
    let test_clock = clock::create_for_testing(scenario.ctx());
    new_mentor(&mut scenario, &test_clock);

    scenario.next_tx(ALICE);
    let oracle_cap = scenario.take_from_sender<config::OracleCap>();
    let mut state = scenario.take_shared<mentor_nft::MentorState>();

    mentor_nft::oracle_resolve_gap(&oracle_cap, &mut state);

    test_scenario::return_to_sender(&scenario, oracle_cap);
    test_scenario::return_shared(state);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
fun test_transfer_changes_owner_with_no_proof_needed() {
    let mut scenario = test_scenario::begin(ALICE);
    let test_clock = clock::create_for_testing(scenario.ctx());
    new_mentor(&mut scenario, &test_clock);

    scenario.next_tx(ALICE);
    let nft = scenario.take_from_sender<mentor_nft::MentorNFT>();
    mentor_nft::transfer_mentor(nft, BOB);

    scenario.next_tx(BOB);
    let nft = scenario.take_from_sender<mentor_nft::MentorNFT>();
    assert!(nft.creator() == ALICE); // provenance preserved even after transfer

    test_scenario::return_to_sender(&scenario, nft);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
fun test_clone_preserves_creator_and_blob_resets_counters() {
    let mut scenario = test_scenario::begin(ALICE);
    let test_clock = clock::create_for_testing(scenario.ctx());
    new_mentor(&mut scenario, &test_clock);

    scenario.next_tx(ALICE);
    let nft = scenario.take_from_sender<mentor_nft::MentorNFT>();
    let state = scenario.take_shared<mentor_nft::MentorState>();

    let (clone_nft, clone_state) = mentor_nft::clone_mentor(&nft, &state, &test_clock, scenario.ctx());
    assert!(clone_nft.creator() == ALICE);
    assert!(clone_state.blob_id() == state.blob_id());
    assert!(clone_state.status() == mentor_nft::status_draft());
    assert!(clone_state.gap_count() == 0);

    transfer::public_transfer(clone_nft, BOB);
    mentor_nft::share_state(clone_state);

    test_scenario::return_to_sender(&scenario, nft);
    test_scenario::return_shared(state);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

#[test]
fun test_allow_list_grant_and_revoke() {
    let mut scenario = test_scenario::begin(ALICE);
    let test_clock = clock::create_for_testing(scenario.ctx());
    new_mentor(&mut scenario, &test_clock);

    scenario.next_tx(ALICE);
    let nft = scenario.take_from_sender<mentor_nft::MentorNFT>();
    let mut state = scenario.take_shared<mentor_nft::MentorState>();

    assert!(!state.has_access(BOB));
    mentor_nft::grant_access(&nft, &mut state, BOB);
    assert!(state.has_access(BOB));
    mentor_nft::revoke_access(&nft, &mut state, BOB);
    assert!(!state.has_access(BOB));

    test_scenario::return_to_sender(&scenario, nft);
    test_scenario::return_shared(state);
    clock::destroy_for_testing(test_clock);
    scenario.end();
}

/// Thin orchestration facade with NO privileged state of its own — every
/// check it relies on (ownership proof via `&MentorNFT`, capability checks)
/// is enforced by the modules it calls into. It exists purely to bundle
/// multi-step flows into one wallet-signed call instead of requiring the
/// frontend to hand-compose a multi-command PTB for every action.
module tacit::marketplace;

use sui::clock::Clock;
use sui::coin::Coin;
use sui::event;
use sui::sui::SUI;
use std::string::String;
use tacit::config::PlatformConfig;
use tacit::mentor_nft::{Self, MentorNFT, MentorState};
use tacit::revenue::{Self, RevenuePool};
use tacit::shares_market::{Self, SharePool};
use tacit::vesting::{Self, VestingSchedule};

const ENoAccess: u64 = 0;

public struct MentorRegistered has copy, drop {
    nft_id: ID,
    state_id: ID,
    creator: address,
    name: String,
}

public struct QueryExecuted has copy, drop {
    state_id: ID,
    querier: address,
}

/// Mints the NFT + state, creates its `SharePool`/`RevenuePool`, links them,
/// transfers the NFT to the caller and shares the rest — one wallet-signed
/// call instead of a hand-composed multi-step PTB.
#[allow(lint(self_transfer))]
public fun register_mentor(
    name: String,
    category: String,
    blob_id: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let (nft, mut state) = mentor_nft::register(name, category, blob_id, clock, ctx);
    let state_id = object::id(&state);

    let share_pool = shares_market::new_pool(state_id, ctx.sender(), ctx);
    let share_pool_id = object::id(&share_pool);
    let revenue_pool = revenue::new_pool(state_id, ctx);
    let revenue_pool_id = object::id(&revenue_pool);
    let vesting_schedule = vesting::new_schedule(state_id, ctx);

    mentor_nft::link_pools(&mut state, share_pool_id, revenue_pool_id);

    event::emit(MentorRegistered {
        nft_id: object::id(&nft),
        state_id,
        creator: nft.creator(),
        name: nft.name(),
    });

    transfer::public_transfer(nft, ctx.sender());
    mentor_nft::share_state(state);
    shares_market::share_pool(share_pool);
    revenue::share_revenue_pool(revenue_pool);
    vesting::share_schedule(vesting_schedule);
}

/// Same multi-object orchestration as `register_mentor`, but for a clone of
/// an existing mentor: new NFT/state/pools, same Walrus blob, transferred to
/// `to` instead of the caller.
public fun clone_mentor(
    nft: &MentorNFT,
    state: &MentorState,
    to: address,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let (new_nft, mut new_state) = mentor_nft::clone_mentor(nft, state, clock, ctx);
    let new_state_id = object::id(&new_state);

    let share_pool = shares_market::new_pool(new_state_id, to, ctx);
    let share_pool_id = object::id(&share_pool);
    let revenue_pool = revenue::new_pool(new_state_id, ctx);
    let revenue_pool_id = object::id(&revenue_pool);
    let vesting_schedule = vesting::new_schedule(new_state_id, ctx);

    mentor_nft::link_pools(&mut new_state, share_pool_id, revenue_pool_id);

    event::emit(MentorRegistered {
        nft_id: object::id(&new_nft),
        state_id: new_state_id,
        creator: new_nft.creator(),
        name: new_nft.name(),
    });

    transfer::public_transfer(new_nft, to);
    mentor_nft::share_state(new_state);
    shares_market::share_pool(share_pool);
    revenue::share_revenue_pool(revenue_pool);
    vesting::share_schedule(vesting_schedule);
}

/// Gates on share ownership, then settles the per-query payment split.
/// `total_queries`/confidence/gap updates are pushed separately by the
/// off-chain oracle after inference completes (see `mentor_nft`'s
/// `oracle_*` functions) — they don't need to be atomic with payment.
public fun execute_query(
    state: &MentorState,
    pool: &SharePool,
    revenue_pool: &mut RevenuePool,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
): Coin<SUI> {
    assert!(mentor_nft::share_pool_id(state) == object::id(pool), ENoAccess);
    assert!(shares_market::balance_of(pool, ctx.sender()) > 0, ENoAccess);
    event::emit(QueryExecuted { state_id: object::id(state), querier: ctx.sender() });
    revenue::pay_query(revenue_pool, payment, ctx)
}

#[allow(lint(self_transfer))]
public fun claim_mentor_royalty(nft: &MentorNFT, pool: &mut RevenuePool, ctx: &mut TxContext) {
    let payout = revenue::claim_mentor_royalty(nft, pool, ctx);
    transfer::public_transfer(payout, ctx.sender());
}

#[allow(lint(self_transfer))]
public fun claim_curator_rewards(pool: &mut RevenuePool, share_pool: &SharePool, ctx: &mut TxContext) {
    let payout = revenue::claim_curator_rewards(pool, share_pool, ctx);
    transfer::public_transfer(payout, ctx.sender());
}

/// Pulls the mentor's claimable royalty and pushes it into the vesting
/// schedule (instead of paying it out immediately), snapshotting the
/// mentor's last-knowledge-update time for later staleness/clawback checks.
public fun vest_earnings(
    nft: &MentorNFT,
    state: &MentorState,
    pool: &mut RevenuePool,
    schedule: &mut VestingSchedule,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let payout = revenue::claim_mentor_royalty(nft, pool, ctx);
    let last_update = mentor_nft::last_updated_at(state);
    vesting::add_vesting(schedule, payout, last_update, clock);
}

#[allow(lint(self_transfer))]
public fun claim_vested(
    nft: &MentorNFT,
    schedule: &mut VestingSchedule,
    config: &PlatformConfig,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let payout = vesting::claim(nft, schedule, config, clock, ctx);
    transfer::public_transfer(payout, ctx.sender());
}

public fun update_knowledge(nft: &MentorNFT, state: &mut MentorState, blob_id: String, clock: &Clock) {
    mentor_nft::update_blob_id(nft, state, blob_id, clock);
}

public fun set_mentor_status(nft: &MentorNFT, state: &mut MentorState, status: u8) {
    mentor_nft::set_status(nft, state, status);
}

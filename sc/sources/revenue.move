module tacit::revenue;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use sui::sui::SUI;
use sui::table::{Self, Table};
use tacit::config::AdminCap;
use tacit::mentor_nft::MentorNFT;
use tacit::shares_market::{Self, SharePool};

const MENTOR_BPS: u128 = 6000;
const CURATOR_BPS: u128 = 2500;
const BPS_DENOM: u128 = 10000;
const QUERY_PRICE: u64 = 500_000; // 0.0005 SUI in MIST

const EInsufficientPayment: u64 = 0;
const ENothingClaimable: u64 = 1;
const EWrongPool: u64 = 2;

public struct CuratorAccount has store, drop {
    last_snapshot: u128,
    claimable: u64,
}

/// One shared object per mentor, paired 1:1 with that mentor's `SharePool`.
public struct RevenuePool has key {
    id: UID,
    mentor_state_id: ID,
    mentor_claimable: u64,
    curator_pool_total: u128,
    platform_claimable: u64,
    curator_accounts: Table<address, CuratorAccount>,
    treasury: Balance<SUI>,
}

public struct RevenueReceived has copy, drop {
    pool_id: ID,
    amount: u64,
}

public struct MentorRoyaltyClaimed has copy, drop {
    pool_id: ID,
    mentor: address,
    amount: u64,
}

public struct CuratorRewardClaimed has copy, drop {
    pool_id: ID,
    curator: address,
    amount: u64,
}

public fun new_pool(mentor_state_id: ID, ctx: &mut TxContext): RevenuePool {
    RevenuePool {
        id: object::new(ctx),
        mentor_state_id,
        mentor_claimable: 0,
        curator_pool_total: 0,
        platform_claimable: 0,
        curator_accounts: table::new(ctx),
        treasury: balance::zero(),
    }
}

public fun share_revenue_pool(pool: RevenuePool) {
    transfer::share_object(pool);
}

public fun query_price(): u64 { QUERY_PRICE }

fun distribute(pool: &mut RevenuePool, amount: Balance<SUI>) {
    let value = amount.value();
    pool.treasury.join(amount);

    let value128 = value as u128;
    let mentor_share = value128 * MENTOR_BPS / BPS_DENOM;
    let curator_share = value128 * CURATOR_BPS / BPS_DENOM;
    let platform_share = value128 - mentor_share - curator_share;

    pool.mentor_claimable = pool.mentor_claimable + (mentor_share as u64);
    pool.curator_pool_total = pool.curator_pool_total + curator_share;
    pool.platform_claimable = pool.platform_claimable + (platform_share as u64);

    event::emit(RevenueReceived { pool_id: object::id(pool), amount: value });
}

/// Takes a per-query payment, splits it 60/25/15 (mentor/curator-pool/
/// platform), and returns any leftover change as a `Coin<SUI>`.
public fun pay_query(pool: &mut RevenuePool, mut payment: Coin<SUI>, ctx: &mut TxContext): Coin<SUI> {
    assert!(payment.value() >= QUERY_PRICE, EInsufficientPayment);
    let exact = payment.split(QUERY_PRICE, ctx);
    distribute(pool, exact.into_balance());
    payment
}

public fun claim_mentor_royalty(nft: &MentorNFT, pool: &mut RevenuePool, ctx: &mut TxContext): Coin<SUI> {
    assert!(nft.state_id() == pool.mentor_state_id, EWrongPool);
    let amount = pool.mentor_claimable;
    assert!(amount > 0, ENothingClaimable);
    pool.mentor_claimable = 0;
    let mentor = ctx.sender();
    event::emit(MentorRoyaltyClaimed { pool_id: object::id(pool), mentor, amount });
    coin::from_balance(pool.treasury.split(amount), ctx)
}

fun settle_curator(pool: &mut RevenuePool, share_pool: &SharePool, holder: address) {
    let shares = share_pool.balance_of(holder);
    if (shares == 0) return;

    let account_exists = pool.curator_accounts.contains(holder);
    let last_snapshot = if (account_exists) {
        pool.curator_accounts.borrow(holder).last_snapshot
    } else {
        0
    };
    let delta = pool.curator_pool_total - last_snapshot;
    let pending = delta * (shares as u128) / (shares_market::total_shares() as u128);

    if (account_exists) {
        let account = pool.curator_accounts.borrow_mut(holder);
        account.claimable = account.claimable + (pending as u64);
        account.last_snapshot = pool.curator_pool_total;
    } else {
        pool.curator_accounts.add(holder, CuratorAccount {
            last_snapshot: pool.curator_pool_total,
            claimable: (pending as u64),
        });
    };
}

public fun claim_curator_rewards(
    pool: &mut RevenuePool,
    share_pool: &SharePool,
    ctx: &mut TxContext,
): Coin<SUI> {
    let holder = ctx.sender();
    settle_curator(pool, share_pool, holder);

    let account = pool.curator_accounts.borrow_mut(holder);
    let amount = account.claimable;
    assert!(amount > 0, ENothingClaimable);
    account.claimable = 0;

    event::emit(CuratorRewardClaimed { pool_id: object::id(pool), curator: holder, amount });
    coin::from_balance(pool.treasury.split(amount), ctx)
}

public fun claim_platform_fee(_cap: &AdminCap, pool: &mut RevenuePool, ctx: &mut TxContext): Coin<SUI> {
    let amount = pool.platform_claimable;
    assert!(amount > 0, ENothingClaimable);
    pool.platform_claimable = 0;
    coin::from_balance(pool.treasury.split(amount), ctx)
}

public fun pending_curator_rewards(pool: &RevenuePool, share_pool: &SharePool, holder: address): u64 {
    let shares = share_pool.balance_of(holder);
    let account_exists = pool.curator_accounts.contains(holder);
    let existing_claimable = if (account_exists) {
        pool.curator_accounts.borrow(holder).claimable
    } else {
        0
    };

    if (shares == 0) {
        existing_claimable
    } else {
        let last_snapshot = if (account_exists) {
            pool.curator_accounts.borrow(holder).last_snapshot
        } else {
            0
        };
        let delta = pool.curator_pool_total - last_snapshot;
        let pending = delta * (shares as u128) / (shares_market::total_shares() as u128);
        existing_claimable + (pending as u64)
    }
}

public fun mentor_claimable(pool: &RevenuePool): u64 { pool.mentor_claimable }
public fun mentor_state_id(pool: &RevenuePool): ID { pool.mentor_state_id }

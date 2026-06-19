module tacit::vesting;

use sui::balance::{Self, Balance};
use sui::clock::Clock;
use sui::coin::{Self, Coin};
use sui::event;
use sui::sui::SUI;
use tacit::config::{AdminCap, PlatformConfig};
use tacit::mentor_nft::MentorNFT;

const EAlreadyClawedBack: u64 = 0;
const ENothingClaimable: u64 = 1;
const ENotStale: u64 = 2;
const EWrongSchedule: u64 = 3;

/// One shared object per mentor. Durations live on `PlatformConfig`, not as
/// `const`s, so they can be tuned (e.g. shortened for a testnet demo)
/// without republishing the package.
public struct VestingSchedule has key {
    id: UID,
    mentor_state_id: ID,
    total: u64,
    claimed: u64,
    started: bool,
    start_time_ms: u64,
    last_mentor_update_ms: u64,
    clawed_back: bool,
    funds: Balance<SUI>,
}

/// Global sink for clawed-back unvested funds.
public struct ClawbackPool has key {
    id: UID,
    balance: Balance<SUI>,
}

public struct VestingAdded has copy, drop {
    schedule_id: ID,
    amount: u64,
}

public struct VestingClaimed has copy, drop {
    schedule_id: ID,
    mentor: address,
    amount: u64,
}

public struct Clawback has copy, drop {
    schedule_id: ID,
    amount: u64,
}

public fun new_schedule(mentor_state_id: ID, ctx: &mut TxContext): VestingSchedule {
    VestingSchedule {
        id: object::new(ctx),
        mentor_state_id,
        total: 0,
        claimed: 0,
        started: false,
        start_time_ms: 0,
        last_mentor_update_ms: 0,
        clawed_back: false,
        funds: balance::zero(),
    }
}

public fun share_schedule(schedule: VestingSchedule) {
    transfer::share_object(schedule);
}

public fun new_clawback_pool(ctx: &mut TxContext): ClawbackPool {
    ClawbackPool { id: object::new(ctx), balance: balance::zero() }
}

public fun share_clawback_pool(pool: ClawbackPool) {
    transfer::share_object(pool);
}

public fun add_vesting(
    schedule: &mut VestingSchedule,
    payment: Coin<SUI>,
    mentor_last_update_ms: u64,
    clock: &Clock,
) {
    assert!(!schedule.clawed_back, EAlreadyClawedBack);
    if (!schedule.started) {
        schedule.started = true;
        schedule.start_time_ms = clock.timestamp_ms();
    };
    let amount = payment.value();
    schedule.total = schedule.total + amount;
    schedule.last_mentor_update_ms = mentor_last_update_ms;
    schedule.funds.join(payment.into_balance());
    event::emit(VestingAdded { schedule_id: object::id(schedule), amount });
}

public fun vested_amount(schedule: &VestingSchedule, config: &PlatformConfig, clock: &Clock): u64 {
    if (!schedule.started) {
        0
    } else {
        let elapsed = clock.timestamp_ms() - schedule.start_time_ms;
        let period = config.vesting_period_ms();
        if (elapsed >= period) {
            schedule.total
        } else {
            (((schedule.total as u128) * (elapsed as u128)) / (period as u128)) as u64
        }
    }
}

public fun claimable_amount(schedule: &VestingSchedule, config: &PlatformConfig, clock: &Clock): u64 {
    vested_amount(schedule, config, clock) - schedule.claimed
}

public fun vesting_progress_bps(schedule: &VestingSchedule, config: &PlatformConfig, clock: &Clock): u64 {
    if (!schedule.started) {
        0
    } else {
        let elapsed = clock.timestamp_ms() - schedule.start_time_ms;
        let period = config.vesting_period_ms();
        if (elapsed >= period) {
            10000
        } else {
            (((elapsed as u128) * 10000) / (period as u128)) as u64
        }
    }
}

public fun claim(
    nft: &MentorNFT,
    schedule: &mut VestingSchedule,
    config: &PlatformConfig,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<SUI> {
    assert!(nft.state_id() == schedule.mentor_state_id, EWrongSchedule);
    assert!(!schedule.clawed_back, EAlreadyClawedBack);
    let claimable = vested_amount(schedule, config, clock) - schedule.claimed;
    assert!(claimable > 0, ENothingClaimable);
    schedule.claimed = schedule.claimed + claimable;
    let mentor = ctx.sender();
    event::emit(VestingClaimed { schedule_id: object::id(schedule), mentor, amount: claimable });
    coin::from_balance(schedule.funds.split(claimable), ctx)
}

public fun clawback(
    _cap: &AdminCap,
    schedule: &mut VestingSchedule,
    clawback_pool: &mut ClawbackPool,
    config: &PlatformConfig,
    clock: &Clock,
) {
    assert!(!schedule.clawed_back, EAlreadyClawedBack);
    let stale_period = config.stale_period_ms();
    assert!(clock.timestamp_ms() > schedule.last_mentor_update_ms + stale_period, ENotStale);
    let unvested = schedule.total - schedule.claimed;
    schedule.clawed_back = true;
    clawback_pool.balance.join(schedule.funds.split(unvested));
    event::emit(Clawback { schedule_id: object::id(schedule), amount: unvested });
}

public fun withdraw_clawback_pool(_cap: &AdminCap, pool: &mut ClawbackPool, ctx: &mut TxContext): Coin<SUI> {
    let amount = pool.balance.value();
    assert!(amount > 0, ENothingClaimable);
    coin::from_balance(pool.balance.split(amount), ctx)
}

public fun mentor_state_id(schedule: &VestingSchedule): ID { schedule.mentor_state_id }
public fun total(schedule: &VestingSchedule): u64 { schedule.total }
public fun claimed(schedule: &VestingSchedule): u64 { schedule.claimed }
public fun is_clawed_back(schedule: &VestingSchedule): bool { schedule.clawed_back }

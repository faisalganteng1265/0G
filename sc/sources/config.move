module tacit::config;

use sui::vec_set::{Self, VecSet};

const DEFAULT_VESTING_PERIOD_MS: u64 = 2_592_000_000; // 30 days
const DEFAULT_STALE_PERIOD_MS: u64 = 2_592_000_000; // 30 days

/// Platform-wide settings shared object. Durations are mutable fields (not
/// `const`s) so a short testnet-demo period can be set without a new build,
/// and so the oracle address allow-list can be rotated without redeploying.
public struct PlatformConfig has key {
    id: UID,
    oracle_addresses: VecSet<address>,
    vesting_period_ms: u64,
    stale_period_ms: u64,
}

public struct AdminCap has key, store {
    id: UID,
}

/// Mere possession proves authorization to push oracle-derived state updates
/// (confidence, gap, query count) — held by the off-chain oracle service.
public struct OracleCap has key, store {
    id: UID,
}

fun init(ctx: &mut TxContext) {
    let mut oracle_addresses = vec_set::empty();
    oracle_addresses.insert(ctx.sender());

    transfer::share_object(PlatformConfig {
        id: object::new(ctx),
        oracle_addresses,
        vesting_period_ms: DEFAULT_VESTING_PERIOD_MS,
        stale_period_ms: DEFAULT_STALE_PERIOD_MS,
    });
    transfer::transfer(AdminCap { id: object::new(ctx) }, ctx.sender());
    transfer::transfer(OracleCap { id: object::new(ctx) }, ctx.sender());
}

public fun set_oracle(_cap: &AdminCap, config: &mut PlatformConfig, oracle: address, enabled: bool) {
    if (enabled) {
        if (!config.oracle_addresses.contains(&oracle)) {
            config.oracle_addresses.insert(oracle);
        };
    } else {
        if (config.oracle_addresses.contains(&oracle)) {
            config.oracle_addresses.remove(&oracle);
        };
    };
}

public fun set_vesting_period_ms(_cap: &AdminCap, config: &mut PlatformConfig, period_ms: u64) {
    config.vesting_period_ms = period_ms;
}

public fun set_stale_period_ms(_cap: &AdminCap, config: &mut PlatformConfig, period_ms: u64) {
    config.stale_period_ms = period_ms;
}

public fun is_oracle(config: &PlatformConfig, addr: address): bool {
    config.oracle_addresses.contains(&addr)
}

public fun vesting_period_ms(config: &PlatformConfig): u64 { config.vesting_period_ms }
public fun stale_period_ms(config: &PlatformConfig): u64 { config.stale_period_ms }

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}

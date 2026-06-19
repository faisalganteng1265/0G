module tacit::shares_market;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use sui::sui::SUI;
use sui::table::{Self, Table};

const TOTAL_SHARES: u64 = 1000;
const MENTOR_INITIAL: u64 = 500;
const CURATOR_POOL: u64 = 500;
const BASE_PRICE: u64 = 10_000_000; // 0.01 SUI in MIST
const PRICE_SLOPE: u64 = 20_000;

const EZeroAmount: u64 = 0;
const ESoldOut: u64 = 1;
const EInsufficientPayment: u64 = 2;
const EInsufficientShares: u64 = 3;
const ECreatorLock: u64 = 4;

/// One shared object per mentor — lets different mentors' markets trade in
/// parallel instead of contending on one global table.
public struct SharePool has key {
    id: UID,
    mentor_state_id: ID,
    creator: address,
    sold: u64,
    holders: Table<address, u64>,
    treasury: Balance<SUI>,
}

public struct SharesBought has copy, drop {
    pool_id: ID,
    buyer: address,
    amount: u64,
    cost: u64,
}

public struct SharesSold has copy, drop {
    pool_id: ID,
    seller: address,
    amount: u64,
    payout: u64,
}

public fun new_pool(mentor_state_id: ID, creator: address, ctx: &mut TxContext): SharePool {
    let mut holders = table::new(ctx);
    holders.add(creator, MENTOR_INITIAL);
    SharePool {
        id: object::new(ctx),
        mentor_state_id,
        creator,
        sold: 0,
        holders,
        treasury: balance::zero(),
    }
}

public fun share_pool(pool: SharePool) {
    transfer::share_object(pool);
}

/// Sum of the linear price curve over `amount` shares starting at `sold`:
/// cost = amount*BASE_PRICE + PRICE_SLOPE*(amount*sold + amount*(amount-1)/2)
/// (u128 intermediate to mirror Solidity's uint256 headroom on the product terms).
fun buy_cost(sold: u64, amount: u64): u64 {
    let sold128 = sold as u128;
    let amount128 = amount as u128;
    let base = amount128 * (BASE_PRICE as u128);
    let slope_term =
        (PRICE_SLOPE as u128) * (amount128 * sold128 + (amount128 * (amount128 - 1)) / 2);
    ((base + slope_term) as u64)
}

fun sell_proceeds(sold: u64, amount: u64): u64 {
    buy_cost(sold - amount, amount)
}

public fun current_price(pool: &SharePool): u64 {
    BASE_PRICE + PRICE_SLOPE * pool.sold
}

public fun buy_quote(pool: &SharePool, amount: u64): u64 {
    buy_cost(pool.sold, amount)
}

public fun sell_quote(pool: &SharePool, amount: u64): u64 {
    sell_proceeds(pool.sold, amount)
}

public fun available_shares(pool: &SharePool): u64 {
    CURATOR_POOL - pool.sold
}

/// Takes payment by value and returns leftover change as a `Coin<SUI>` —
/// push, not pull: no "refund call failed" revert path needed since change
/// is just an object the caller's PTB receives back.
public fun buy_shares(
    pool: &mut SharePool,
    mut payment: Coin<SUI>,
    amount: u64,
    ctx: &mut TxContext,
): Coin<SUI> {
    assert!(amount > 0, EZeroAmount);
    assert!(pool.sold + amount <= CURATOR_POOL, ESoldOut);

    let cost = buy_cost(pool.sold, amount);
    assert!(payment.value() >= cost, EInsufficientPayment);

    let buyer = ctx.sender();
    let exact_payment = payment.split(cost, ctx);
    pool.treasury.join(exact_payment.into_balance());
    pool.sold = pool.sold + amount;

    if (pool.holders.contains(buyer)) {
        let bal = pool.holders.borrow_mut(buyer);
        *bal = *bal + amount;
    } else {
        pool.holders.add(buyer, amount);
    };

    event::emit(SharesBought { pool_id: object::id(pool), buyer, amount, cost });
    payment
}

public fun sell_shares(pool: &mut SharePool, amount: u64, ctx: &mut TxContext): Coin<SUI> {
    assert!(amount > 0, EZeroAmount);
    let seller = ctx.sender();
    assert!(pool.holders.contains(seller), EInsufficientShares);

    let holder_balance = *pool.holders.borrow(seller);
    assert!(holder_balance >= amount, EInsufficientShares);
    if (seller == pool.creator) {
        assert!(holder_balance - amount >= MENTOR_INITIAL, ECreatorLock);
    };

    let payout = sell_proceeds(pool.sold, amount);
    pool.sold = pool.sold - amount;
    let bal_mut = pool.holders.borrow_mut(seller);
    *bal_mut = *bal_mut - amount;

    event::emit(SharesSold { pool_id: object::id(pool), seller, amount, payout });
    coin::from_balance(pool.treasury.split(payout), ctx)
}

public fun balance_of(pool: &SharePool, holder: address): u64 {
    if (pool.holders.contains(holder)) {
        *pool.holders.borrow(holder)
    } else {
        0
    }
}

public fun mentor_state_id(pool: &SharePool): ID { pool.mentor_state_id }
public fun total_shares(): u64 { TOTAL_SHARES }
public fun mentor_initial(): u64 { MENTOR_INITIAL }
public fun curator_pool(): u64 { CURATOR_POOL }
public fun sold(pool: &SharePool): u64 { pool.sold }

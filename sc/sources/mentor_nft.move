module tacit::mentor_nft;

use std::string::String;
use sui::clock::Clock;
use sui::event;
use sui::vec_set::{Self, VecSet};
use tacit::config::OracleCap;

const STATUS_DRAFT: u8 = 0;
const STATUS_REVIEW: u8 = 1;
const STATUS_READY: u8 = 2;
const STATUS_SUSPENDED: u8 = 3;

const EInvalidConfidence: u64 = 0;
const EPoolsAlreadyLinked: u64 = 1;
const EWrongState: u64 = 2;
const EGapAlreadyZero: u64 = 3;

/// The wallet-held, transferable identity. Holding this object structurally
/// proves ownership — no `owner` field or `msg.sender` check needed.
public struct MentorNFT has key, store {
    id: UID,
    creator: address,
    name: String,
    category: String,
    minted_at: u64,
    state_id: ID,
}

/// Shared companion object holding all mutable/operational state, so the
/// oracle can push updates regardless of who currently holds the `MentorNFT`.
public struct MentorState has key {
    id: UID,
    nft_id: ID,
    blob_id: String,
    confidence_score: u8,
    gap_count: u32,
    total_queries: u32,
    status: u8,
    last_updated_at: u64,
    share_pool_id: ID,
    revenue_pool_id: ID,
    pools_linked: bool,
    allow_list: VecSet<address>,
}

public struct MentorMinted has copy, drop {
    nft_id: ID,
    state_id: ID,
    creator: address,
    name: String,
}

public struct StorageUpdated has copy, drop {
    state_id: ID,
    blob_id: String,
    confidence_score: u8,
}

public struct GapChanged has copy, drop {
    state_id: ID,
    gap_count: u32,
}

public struct ConfidenceUpdated has copy, drop {
    state_id: ID,
    score: u8,
}

public struct StatusChanged has copy, drop {
    state_id: ID,
    status: u8,
}

public struct MentorCloned has copy, drop {
    source_state_id: ID,
    new_nft_id: ID,
    new_state_id: ID,
}

/// Module-private: only reachable via `register` (creator := sender) or
/// `clone_mentor` (creator := preserved from source) — never with a caller-
/// supplied arbitrary address.
fun mint(
    creator: address,
    name: String,
    category: String,
    blob_id: String,
    clock: &Clock,
    ctx: &mut TxContext,
): (MentorNFT, MentorState) {
    let state_uid = object::new(ctx);
    let state_id = state_uid.to_inner();
    let now = clock.timestamp_ms();

    let state = MentorState {
        id: state_uid,
        nft_id: state_id, // placeholder, corrected below once nft_id exists
        blob_id,
        confidence_score: 0,
        gap_count: 0,
        total_queries: 0,
        status: STATUS_DRAFT,
        last_updated_at: now,
        share_pool_id: state_id, // placeholder until link_pools
        revenue_pool_id: state_id, // placeholder until link_pools
        pools_linked: false,
        allow_list: vec_set::empty(),
    };

    let nft_uid = object::new(ctx);
    let nft_id = nft_uid.to_inner();

    let nft = MentorNFT {
        id: nft_uid,
        creator,
        name,
        category,
        minted_at: now,
        state_id,
    };

    event::emit(MentorMinted { nft_id, state_id, creator, name: nft.name });

    (nft, state)
}

/// Permissionless: the caller always becomes both creator and initial owner.
public fun register(
    name: String,
    category: String,
    blob_id: String,
    clock: &Clock,
    ctx: &mut TxContext,
): (MentorNFT, MentorState) {
    mint(ctx.sender(), name, category, blob_id, clock, ctx)
}

/// Mints a fresh NFT+state pair pointing at the *same* Walrus blob (the
/// knowledge itself isn't duplicated) but with its own pools/allow-list/
/// gap-count/query-count, mirroring the old `iClone`'s reset semantics
/// without any oracle-signed proof step. Ownership is proven structurally
/// by `nft`/`state` being passed in; the caller decides where the returned
/// NFT goes.
public fun clone_mentor(
    nft: &MentorNFT,
    state: &MentorState,
    clock: &Clock,
    ctx: &mut TxContext,
): (MentorNFT, MentorState) {
    assert_owns_state(nft, state);
    let (new_nft, new_state) = mint(nft.creator, nft.name, nft.category, state.blob_id, clock, ctx);
    event::emit(MentorCloned {
        source_state_id: object::id(state),
        new_nft_id: object::id(&new_nft),
        new_state_id: object::id(&new_state),
    });
    (new_nft, new_state)
}

/// Called once, right after the mentor's `SharePool`/`RevenuePool` shared
/// objects are created, so `seal_policy` and clients can discover them from
/// the mentor's own state object instead of a separate index.
public fun link_pools(state: &mut MentorState, share_pool_id: ID, revenue_pool_id: ID) {
    assert!(!state.pools_linked, EPoolsAlreadyLinked);
    state.share_pool_id = share_pool_id;
    state.revenue_pool_id = revenue_pool_id;
    state.pools_linked = true;
}

public fun share_state(state: MentorState) {
    transfer::share_object(state);
}

// ---------------------------------------------------------------------------
// Mentor-self functions (ownership proven structurally by holding `&MentorNFT`)
// ---------------------------------------------------------------------------

public fun assert_owns_state(nft: &MentorNFT, state: &MentorState) {
    assert!(nft.state_id == object::id(state), EWrongState);
}

public fun update_blob_id(nft: &MentorNFT, state: &mut MentorState, blob_id: String, clock: &Clock) {
    assert_owns_state(nft, state);
    state.blob_id = blob_id;
    state.last_updated_at = clock.timestamp_ms();
    event::emit(StorageUpdated {
        state_id: object::id(state),
        blob_id: state.blob_id,
        confidence_score: state.confidence_score,
    });
}

public fun set_status(nft: &MentorNFT, state: &mut MentorState, status: u8) {
    assert_owns_state(nft, state);
    state.status = status;
    event::emit(StatusChanged { state_id: object::id(state), status });
}

public fun grant_access(nft: &MentorNFT, state: &mut MentorState, user: address) {
    assert_owns_state(nft, state);
    if (!state.allow_list.contains(&user)) {
        state.allow_list.insert(user);
    };
}

public fun revoke_access(nft: &MentorNFT, state: &mut MentorState, user: address) {
    assert_owns_state(nft, state);
    if (state.allow_list.contains(&user)) {
        state.allow_list.remove(&user);
    };
}

/// Plain native object transfer — no proofs, no nonces. Sui's object-version
/// model makes replay structurally impossible. (`MentorNFT` has `store`, so
/// `sui::transfer::public_transfer` works too; this is just a convenience
/// wrapper, not an enforced policy.)
#[allow(lint(custom_state_change))]
public fun transfer_mentor(nft: MentorNFT, to: address) {
    transfer::transfer(nft, to);
}

// ---------------------------------------------------------------------------
// Oracle-gated writes (mere possession of `&OracleCap` proves authorization)
// ---------------------------------------------------------------------------

/// The backend's upload pipeline calls this directly with the oracle's own
/// key (no mentor wallet signature needed for the on-chain write itself —
/// the mentor only triggers the off-chain encrypt+upload step). Mentors who
/// want to update knowledge straight from their own wallet instead use
/// `update_blob_id`/`marketplace::update_knowledge`.
public fun oracle_update_blob_id(
    _cap: &OracleCap,
    state: &mut MentorState,
    blob_id: String,
    confidence: u8,
    clock: &Clock,
) {
    assert!(confidence <= 100, EInvalidConfidence);
    state.blob_id = blob_id;
    state.confidence_score = confidence;
    state.last_updated_at = clock.timestamp_ms();
    event::emit(StorageUpdated {
        state_id: object::id(state),
        blob_id: state.blob_id,
        confidence_score: state.confidence_score,
    });
}

public fun oracle_update_confidence(_cap: &OracleCap, state: &mut MentorState, score: u8, clock: &Clock) {
    assert!(score <= 100, EInvalidConfidence);
    state.confidence_score = score;
    state.last_updated_at = clock.timestamp_ms();
    event::emit(ConfidenceUpdated { state_id: object::id(state), score });
}

public fun oracle_increment_gap(_cap: &OracleCap, state: &mut MentorState) {
    state.gap_count = state.gap_count + 1;
    event::emit(GapChanged { state_id: object::id(state), gap_count: state.gap_count });
}

public fun oracle_resolve_gap(_cap: &OracleCap, state: &mut MentorState) {
    assert!(state.gap_count > 0, EGapAlreadyZero);
    state.gap_count = state.gap_count - 1;
    event::emit(GapChanged { state_id: object::id(state), gap_count: state.gap_count });
}

public fun oracle_record_query(_cap: &OracleCap, state: &mut MentorState) {
    state.total_queries = state.total_queries + 1;
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

public fun state_id(nft: &MentorNFT): ID { nft.state_id }
public fun creator(nft: &MentorNFT): address { nft.creator }
public fun name(nft: &MentorNFT): String { nft.name }

public fun blob_id(state: &MentorState): String { state.blob_id }
public fun last_updated_at(state: &MentorState): u64 { state.last_updated_at }
public fun confidence_score(state: &MentorState): u8 { state.confidence_score }
public fun gap_count(state: &MentorState): u32 { state.gap_count }
public fun total_queries(state: &MentorState): u32 { state.total_queries }
public fun status(state: &MentorState): u8 { state.status }
public fun share_pool_id(state: &MentorState): ID { state.share_pool_id }
public fun revenue_pool_id(state: &MentorState): ID { state.revenue_pool_id }
public fun pools_linked(state: &MentorState): bool { state.pools_linked }
public fun has_access(state: &MentorState, user: address): bool { state.allow_list.contains(&user) }

public fun status_draft(): u8 { STATUS_DRAFT }
public fun status_review(): u8 { STATUS_REVIEW }
public fun status_ready(): u8 { STATUS_READY }
public fun status_suspended(): u8 { STATUS_SUSPENDED }

/// Gates Walrus-stored knowledge decryption. Seal key-servers dry-run
/// `seal_approve` (the naming convention they look for) against the current
/// on-chain state before issuing a decryption key share — this replaces the
/// entire `sealedKey`/oracle-re-encryption mechanism from the EVM design with
/// "decrypt only if this Move function doesn't abort."
module tacit::seal_policy;

use tacit::config::PlatformConfig;
use tacit::mentor_nft::MentorState;
use tacit::shares_market::SharePool;

const ENoAccess: u64 = 0;

/// `id` is the Seal identity bytes the encryptor namespaced to this mentor
/// (by convention, prefixed with the mentor's `MentorState` object id), so
/// each mentor's knowledge has an independent policy.
public fun seal_approve(
    _id: vector<u8>,
    state: &MentorState,
    pool: &SharePool,
    config: &PlatformConfig,
    ctx: &TxContext,
) {
    let caller = ctx.sender();
    let approved =
        pool.balance_of(caller) > 0 ||
        config.is_oracle(caller) ||
        state.has_access(caller);
    assert!(approved, ENoAccess);
}

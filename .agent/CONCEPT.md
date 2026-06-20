# Tacit: 0G -> Sui migration concept

## Why this migration exists

"Tacit" (AI Mentor Marketplace) was originally built end-to-end on 0G Chain
for the 0G APAC Hackathon: Solidity contracts, ERC-7857 "intelligent NFT"
with sealed-key custody, 0G Storage for encrypted knowledge, 0G Compute (TEE)
for sealed inference.

Decision: submit the **same product idea** to **Sui Overflow 2026** (hosted
on the deepsurge.xyz portal; tracks are *The Agentic Web* (core), *DeFi &
Payments*, plus special *Walrus* and *DeepBook* tracks). This is a **full
replace**, not a parallel build — `sc/`, `be/`, `fe/` all become Sui-native.
The 0G version is abandoned (lives only in git history).

## The pitch upgrade (why this isn't just a 1:1 port)

Original story: *"the knowledge is encrypted, and only a TEE can unwrap the
key."* You have to trust a TEE hardware vendor.

New story: *"decryption is gated by an on-chain Move policy that Seal's
key-servers enforce directly — access is auditable and revocable, not a
black-box hardware attestation."* This is a **stronger trust narrative**
than the original, not a downgrade — worth leading with in the submission
pitch, not burying as a technical footnote.

## Stack mapping

| 0G (old) | Sui (new) | Why |
|---|---|---|
| Solidity contracts | Move package (`sc/`) | Not a syntax port — Move's object model removes whole categories of the old design (see below) |
| ERC-7857 iNFT (`sealedKey`, oracle-signed transfer proofs, nonce replay table) | Plain Sui object (`MentorNFT`) + Seal policy | Sui's object-version model makes transfer replay structurally impossible; Seal replaces "sealed key" with an on-chain policy check |
| 0G Storage | **Walrus** | Also lines up with Sui Overflow's sponsored Walrus track |
| 0G Compute (TEE broker/ledger) | **Atoma Network** (`confidentialChat`) | Decentralized TEE-backed inference settled on Sui; bearer-token billing, no ledger/deposit dance |
| ethers + wagmi/viem/RainbowKit | `@mysten/sui` + `@mysten/dapp-kit` | — |

## Why the Solidity "marketplace owns sub-contracts" pattern is gone

In Solidity, `MentorMarketplace` had to be the `owner` of all 4 sub-contracts
and forward an explicit `address` parameter, because `msg.sender` inside a
sub-contract call from the marketplace would be the marketplace's address,
not the original caller — there's no way to "see through" the call chain.

In Move, every function gets `ctx: &TxContext`, and `ctx.sender()` returns
the **true original transaction sender** at any call depth. So:
- No `Ownable`/`onlyOwner` modifier, no address-forwarding plumbing.
- Privileged actions use **capability objects** (`OracleCap`, `AdminCap`) —
  mere possession of the object proves authorization. This is Move's
  idiomatic replacement for `onlyOwner`/`onlyOracle`.
- "Is the caller authorized to act on this NFT" becomes structural: you can
  only reference an owned object you actually hold as a transaction input,
  so passing `&MentorNFT` into a function *is* the ownership proof — no
  `require(msg.sender == owner)` check needed anywhere.

## The one real design wrinkle: two objects per mentor, not one

The original single-object plan ("`MentorNFT` holds all mentor fields
directly") doesn't work in Move: if `MentorNFT` is an **owned** object (so it
behaves like a wallet-held collectible, transferable via plain
`sui::transfer::transfer`), the **off-chain oracle cannot mutate it** —
Sui only lets an object's current owner submit transactions that reference
it, even as a read reference. The backend's oracle key is a different
address than whichever wallet currently holds the NFT.

Fix, implemented in `sc/sources/mentor_nft.move`:
- **`MentorNFT`** (owned, `key + store`) — wallet-held identity:
  `creator`, `name`, `category`, `minted_at`, `state_id`. Transfers via
  plain `transfer::transfer` (no proofs, no nonce table — Sui's
  object-version model makes replay structurally impossible).
- **`MentorState`** (shared) — all mutable/operational fields:
  `blob_id`, `confidence_score`, `gap_count`, `total_queries`, `status`,
  `share_pool_id`, `revenue_pool_id`, `allow_list`. The oracle mutates this
  freely via `OracleCap`-gated functions regardless of who currently holds
  the `MentorNFT`.
- Functions that need "prove caller owns this mentor" (claim royalty, vest,
  update knowledge from the mentor's own wallet, set status) take
  `&MentorNFT` **and** `&mut MentorState` together, asserting
  `nft.state_id == object::id(state)`.

This also explains why there are **two** knowledge-update paths in
`mentor_nft.move`, matching two genuinely different call sites in the
original code:
- `oracle_update_blob_id` (`OracleCap`-gated) — what the **backend's
  `/upload` route** calls after encrypting+storing on Walrus. No mentor
  wallet signature needed for the on-chain write itself, exactly like the
  original 0G design where the oracle key wrote `storageRef` directly.
- `update_blob_id` (mentor-self, takes `&MentorNFT`) — for a mentor updating
  knowledge straight from their own wallet via `marketplace::update_knowledge`,
  without going through the backend pipeline.

## Other notable Move-idiom decisions (see the approved plan for full detail)

- **Per-mentor shared objects** (`SharePool`, `RevenuePool`, one each per
  mentor, not one global table) — real parallelism win and a genuine
  "why Sui" talking point: different mentors' markets trade independently,
  no global lock. Object ids are discovered via fields on `MentorState`
  (`share_pool_id`, `revenue_pool_id`), so no separate index is needed.
- **Seal policy** (`seal_policy::seal_approve`) approves decryption if the
  caller holds shares (`shares_market::balance_of > 0`) **or** is a
  registered oracle address (`config::PlatformConfig.oracle_addresses`)
  **or** is on the mentor's allow-list — this subsumes the old
  `authorizeUsage`/`revokeAuthorization`/`delegateAccess` trio with strictly
  more power, enforced by Seal key-servers themselves, not app-layer trust.
- **No separate wallet-signature challenge for queries.** The old design had
  the frontend sign a challenge message (`/market/query-message` +
  `auth.ts`) purely to prove "this address really controls this wallet"
  before trusting a client-supplied address. In the new design,
  `marketplace::execute_query` is what gates payment AND access (share
  balance check) in one on-chain call, and the backend's
  `verifyQuerySettlement` reads the **real sender** straight off the
  verified transaction — there's no client-supplied address to spoof in the
  first place. `be/src/lib/auth.ts` was deleted outright.
- **Vesting/stale-period durations are mutable fields** on
  `config::PlatformConfig` (admin-settable via `AdminCap`), not `const`s —
  Move constants are baked into published bytecode, and this keeps the door
  open for a short testnet-demo period without a separate build.
- **Bonding-curve/query-price constants are MIST-denominated from scratch**
  (`BASE_PRICE = 10_000_000 MIST = 0.01 SUI`, `PRICE_SLOPE = 20_000 MIST`,
  `QUERY_PRICE = 500_000 MIST = 0.0005 SUI`), not a mechanical copy of the
  old wei literals — 1 SUI = 1e9 MIST vs ETH's 1e18 wei.

See `.agent/TODO.md` for what's actually left to build, and
`/home/faisalakmal/.claude/plans/encapsulated-beaming-lerdorf.md` for the
original approved migration plan (some details above are corrections made
during implementation, e.g. the two-object split, that supersede that
document — this file is the source of truth for "what we actually built and
why").

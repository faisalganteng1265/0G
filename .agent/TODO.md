# Tacit Sui migration — status & remaining work

Read `.agent/CONCEPT.md` first for the why. This file is the what's-left.

## Done

- **`sc/`** — full Move package, replaces all 5 Solidity contracts + interface.
  `sui move build` clean, `sui move test` **26/26 passing**.
  Modules: `mentor_nft`, `config`, `seal_policy`, `shares_market`, `revenue`,
  `vesting`, `marketplace` (thin facade, no privileged state).
- **`be/`** — fully rewritten for Sui/Walrus/Seal/Atoma. Converted to an ESM
  package (`"type": "module"`, `tsconfig.json` uses `NodeNext`/`NodeNext`,
  `tsx` instead of `ts-node-dev`) because `@mysten/sui`, `@mysten/walrus`,
  `@mysten/seal` are ESM-only (no CJS build at all — confirmed by inspecting
  their published `package.json` `exports` maps). `npx tsc --noEmit` is
  clean. `be/src/lib/contracts.ts` and `be/src/lib/auth.ts` were deleted.
- **`fe/`** — fully rewritten for `@mysten/sui` + `@mysten/dapp-kit`. All
  read paths go through `useSuiClientQuery`/devInspect helpers in
  `useMarketplace.ts`; all write paths use `useSignAndExecuteTransaction` +
  `Transaction.moveCall`. `npx tsc --noEmit`, `npm run lint`, and
  `npm run build` (static export of all 7 routes) are all clean.
  `PACKAGE_ID`/`CONFIG_ID` default to `""` rather than throwing (mirrors the
  old `envAddress`-defaults-to-zero pattern) since `sc/` isn't published yet
  — see "Open items" below for the one contract change this surfaced.
- Old `sc/` Solidity tree (including `sc/.env` with the 0G deployer
  `PRIVATE_KEY`) was deleted outright — confirmed with the user first since
  that `.env` was gitignored and unrecoverable from git history.

## Frontend rewrite (`fe/`) — what actually landed

Followed the planned shape (see git history for the step-by-step if needed),
with a few corrections made during implementation:

- `fe/package.json` → `@mysten/sui@^2.19.0` + `@mysten/dapp-kit@^1.1.1`
  (matches `be/`'s installed version), `wagmi`/`viem`/`@rainbow-me/rainbowkit`
  removed.
- `fe/src/lib/chains.ts` deleted; `providers.tsx` now builds
  `createNetworkConfig({ mainnet, testnet, devnet })` via
  `getJsonRpcFullnodeUrl` from `@mysten/sui/jsonRpc`, wrapped in
  `SuiClientProvider` + dapp-kit's `WalletProvider` (custom dark `ThemeVars`
  object instead of RainbowKit's `darkTheme()`).
- `fe/src/lib/contracts.ts` → just `PACKAGE_ID`/`CONFIG_ID` (default to `""`,
  not throw — see below) plus a `MOVE_EVENT_TYPES` map used by every
  `queryEvents` call site instead of hand-building strings inline.
- `fe/src/hooks/useMarketplace.ts` — `useMentors()` now does
  `api.getMentors()` (event-sourced list, `{nftId,stateId,creator,name}`)
  then ONE `multiGetObjects` batching both the `MentorNFT` and `MentorState`
  ids per mentor to fill in `category`/`confidenceScore`/`gapCount`/etc.
  Per-mentor aggregate views (share positions across all mentors for
  EarningsView/SharesView) use a batched `useQuery` that fans out parallel
  `devInspectTransactionBlock` calls in one `queryFn` — calling hooks in a
  `.map()` over a dynamically-sized mentor list isn't legal, so the
  per-mentor *aggregate* reads are plain async functions wrapped in a single
  hook, while per-row live reads (inside `SharePositionRow`/`VestingRow`
  sub-components) still use the normal one-hook-per-component pattern.
- Write paths all use `useSignAndExecuteTransaction()` +
  `Transaction.moveCall`. Every callback passed to `useTxToast` now returns
  `(await signAndExecute({transaction: tx})).digest` (a bare string) instead
  of the raw mutation result, and `ToastProvider.tsx`'s `useTxToast` no
  longer requires the result to start with `"0x"` before showing it as a tx
  reference — Sui digests are base58, not hex, so the old EVM-only heuristic
  would have silently swallowed every tx hash in the toast UI.
- `shares_market::buy_shares`, `shares_market::sell_shares`, and
  `marketplace::execute_query` all return a `Coin<SUI>` change/payout value
  with no `drop` ability — every call site splits payment from `tx.gas` and
  explicitly `tx.transferObjects([result], senderAddress)`s the returned
  coin back, otherwise the PTB fails to validate.
- `PACKAGE_ID`/`CONFIG_ID` intentionally default to `""` instead of
  throwing on missing env (mirrors the old `envAddress`-defaults-to-zero
  pattern) — `next build` prerenders every dashboard route server-side even
  though they're all `"use client"`, so a `requireEnv`-style throw at module
  scope breaks the production build entirely until `sc/` is actually
  published. Confirmed clean: `npx tsc --noEmit`, `npm run lint`,
  `npm run build` (all 7 routes prerender), and a `next dev` smoke pass
  (every dashboard route returns 200 with no error overlay in the SSR'd
  HTML, dapp-kit's `ConnectButton` renders). **Not yet verified**: an actual
  wallet-connected interactive pass in a real browser (no browser-automation
  tool was available this session) and the full on-chain round trip (needs
  `sc/` published first — see below).

## Remaining: deployment & wiring (needed before any end-to-end test, fe/ or not)

1. ~~`cd sc && sui client publish --gas-budget 500000000` against testnet.~~
   **Done 2026-06-21.** Published from address `0x1c54e345c50130efe6ad2900960502bec65914a83a98539e29c96777aaf6b26c`
   (CLI alias `tender-heliotrope`, ~0.115 SUI actual gas — dry-run estimate
   matched the real cost): `PACKAGE_ID=0xfcfd29f5994aae10c429ac9af63fdaef31d01896131cc4f5d3cecd7081db4855`,
   `PlatformConfig (shared)=0x4ba5c22fe50f191ef522384626b243a56f221c1080f43a88e8b5f97b481bd372`,
   `AdminCap=0x1ea5ff08447418fc72b894dc4623ecf082f478d47cec48aef803d2f3184adb45`,
   `OracleCap=0xe34ae096ce5db379f7e6ab9ae608a87c8c35c2b613ba6da8ef8406e287d06e17`,
   `UpgradeCap=0xab97fb73f3b0d8c04cec49a6d0cd8f385901b6972b35d65150ce6f62f820fcd0`
   (retained, not burned — see "Open items" below).
2. ~~Fill in `be/.env`~~ **Done.** `PACKAGE_ID`/`CONFIG_ID`/`ORACLE_CAP_ID`/
   `ORACLE_PRIVATE_KEY` set (private key exported+pasted by the user directly
   into the file, never through chat). `fe/.env.local`'s
   `NEXT_PUBLIC_PACKAGE_ID`/`NEXT_PUBLIC_CONFIG_ID` set to the same values.
3. `SEAL_KEY_SERVER_IDS` — **still open.** Get current testnet key-server
   object ids from https://seal-docs.wal.app/ (these rotate/are documented
   there, don't guess them). This is the one remaining blocker before a full
   `be/` smoke test (upload/download go through Seal).
4. ~~`ATOMA_API_KEY`~~ — **Atoma's signup looks sales-gated, not self-serve**:
   atoma.ai's own CTAs ("Request Demo"/"Get Started"/"Partner with us") all
   route to a contact form, no free-trial/instant-key flow found. Rather
   than block on that, added a `COMPUTE_PROVIDER` switch (`atoma` default,
   `openrouter` fallback) to `be/src/lib/compute.ts` — see "Open items"
   below for detail. `be/.env` currently has `COMPUTE_PROVIDER=openrouter`
   wired and smoke-tested with a real key; flip back to `atoma` once that
   access actually comes through.
5. Smoke-test `be/` against testnet *before* fe/ is ready, by driving it
   with `sui client call`/a scratch script instead of the UI:
   register a mentor (`marketplace::register_mentor`), grab its
   `MentorState` id from the output, hit `POST /upload` and `POST /query`
   directly with curl. Blocked only on item 3 now.

## Open items carried over from the plan (still unresolved)

- **`MentorState` gained a `vesting_schedule_id` field** (alongside the
  existing `share_pool_id`/`revenue_pool_id`), set by `link_pools` exactly
  like the other two. Found while wiring up `fe/`'s Earnings vest/claim
  flow: `vesting::new_schedule` creates a per-mentor `VestingSchedule`
  shared object, but nothing on-chain ever recorded *which* schedule
  belongs to which mentor — `marketplace::vest_earnings`/`claim_vested`
  both take `&mut VestingSchedule` as a parameter, so a client has no way to
  discover that object id otherwise (no registry, and the `MentorRegistered`
  event doesn't carry it either). Fixed in `mentor_nft.move`
  (`link_pools` now takes/stores a third id) and `marketplace.move`'s two
  call sites; `be/src/lib/sui.ts`'s `getMentorState`/`MentorStateView` was
  updated to parse the new field. `sui move test` re-verified at 26/26 after
  the change. This was a genuine gap in the original design, not a
  deliberate omission — since `sc/` isn't published yet, the struct-layout
  change was free (no migration needed).
- **`fe/`'s env vars renamed**: `NEXT_PUBLIC_PACKAGE_ID`/`NEXT_PUBLIC_CONFIG_ID`
  replace the old `NEXT_PUBLIC_{MARKETPLACE,ACCESS_SHARES,REVENUE,INFT}_ADDRESS`
  vars in both `.env.example` and the gitignored `.env.local` (the latter
  still has empty values — real ones land after `sui client publish`).
- **Atoma billing model** — `be/src/lib/compute.ts` assumes simple bearer-
  auth billing (no ledger/deposit dance like 0G needed). Confirm this is
  still accurate against current Atoma docs before relying on it for a
  live demo; the SDK call shape (`confidentialChat.create`) was verified
  by inspecting the actual published `atoma-sdk` package source, not
  training memory, but the *billing/account* side wasn't.
- **Bonding curve MIST constants** (`shares_market.move`:
  `BASE_PRICE = 10_000_000`, `PRICE_SLOPE = 20_000` MIST) — sanity-check
  against real testnet faucet drip amounts so a demo wallet can actually
  afford to buy shares + query without an unrealistic faucet ask.
- **`UpgradeCap`** — currently retained after publish (default `sui client
  publish` behavior). Decide burn-or-keep before final submission.

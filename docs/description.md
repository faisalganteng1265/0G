# Hackathon Submission - Tacit

## Description

Access intelligence that isn't on the internet. Knowledge that compounds most stays private.

A former regulator has 12 years of tactical insight into compliance loopholes. A VC partner knows which LP structures actually survive downturns. A senior engineer knows exactly why that architecture fails at scale. None of them will publish it. But with Tacit, you can talk to their AI.

Experts inject their private knowledge into an AI that only shareholders can query. The knowledge never leaves a sealed enclave. Not the platform, not the GPU operator, not anyone can read it. When you hold a share, you have a private AI trained on expertise that doesn't exist anywhere on the internet. You ask it anything, anytime, and it answers from that expert's actual playbook.

This is not Friend.tech. Nobody is buying a chat ticket to DM someone who might reply. You own a piece of a living, private AI. It's always on. It gets smarter as the mentor feeds it. And every query you make earns you dividends because other shareholders are querying it too.

The loop is simple:
- **You buy a share.** You now have access to a private AI nobody else on the internet can reach. You ask it questions that would cost thousands in consulting fees. You earn dividends from every query other shareholders make.
- **The mentor earns forever.** Every query pays them royalty. But if they stop updating their knowledge, confidence drops publicly on-chain and their vesting slows. They have to keep feeding the AI to keep earning.
- **The knowledge gets better over time.** Gaps are flagged publicly. The mentor patches them. The AI improves. Your share becomes more valuable because the intelligence behind it is sharper than yesterday.

This only works if nobody can cheat. That's why Tacit is built end-to-end on 0G, and is structurally inseparable from all four primitives:

- **0G Chain** - iNFT custody, bonding curve, atomic revenue split, vesting, oracle signaling. Remove it and there's no enforceable economics.
- **0G Storage** - encrypted knowledge, Merkle-rooted on-chain. Remove it and knowledge can be censored, subpoenaed, or revoked.
- **0G Compute (TEE)** - sealed inference where the key is unwrapped only inside the enclave. Remove it and the operator can read every expert's knowledge.
- **ERC-7857 iNFT** - transferable AI identity with iTransfer/iClone and multi-proof validation. Remove it and mentors can't sell their iNFT without leaking the knowledge.

No AWS fallback. No OpenAI black box. No trust assumption beyond the contracts and the TEE attestation.

**By the numbers:** 6 mainnet contracts (1,093 LOC Solidity) on Chain ID 16661 · 510 LOC tests · 7 production dashboards · encrypted upload to 0G Storage · sealed TEE inference on 0G Compute · ERC-7857 with iTransfer/iClone and multi-proof validation.

---

## Progress During Hackathon

Everything was built from scratch during the hackathon period:

**Smart Contracts (0G Chain, Mainnet 16661)**
- `AIMentorINFT` - full ERC-7857 iNFT: mentor identity + sealed key custody, iTransfer/iClone with multi-proof validation (464 LOC)
- `MentorMarketplace` - orchestrator: mint, query settlement, oracle hub
- `AccessSharesMarket` - bonding curve pricing for fractional access shares
- `RevenueDistributor` - atomic per-query royalty + dividend split
- `VestingEscrow` - 30-day vesting with claw-back on gap escalation
- 510 LOC of Foundry tests

**Oracle Service (0G Storage + 0G Compute)**
- Encrypted upload pipeline to 0G Storage with on-chain storageRef anchoring
- TEE inference pipeline through 0G Compute with sealed key custody
- Provider auto-funding handled programmatically
- On-chain AI confidence oracle (gapCount, confidenceScore) as public quality signal
- Routes: upload, query, oracle signaling, market data

**Frontend (Next.js 16)**
- 7 production surfaces: marketplace, my-mentors, my-shares, earnings, gap-reports, security-logs, mentor workspace
- Share-gated chat with markdown rendering and live polling
- RainbowKit + viem + wagmi wallet integration
- Bonding curve trade UI with real-time pricing

---

## Fundraising Status

Not fundraising. Built for the 0G APAC Hackathon 2026.

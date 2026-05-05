# 📋 HACKATHON 0G APAC — RECAP IDE

Hackathon: https://www.hackquest.io/hackathons/0G-APAC-Hackathon
Deadline submission: 16 Mei 2026
Prize: Grand Prize $45K / $35K / $20K
Track target: **Track 4 (Wildcard — SocialFi/Consumer App)**

---

## 💡 IDE: "AI Mentor Marketplace"

Platform di mana expert tokenize expertise mereka sebagai AI Mentor. Fans/learners bisa beli shares di AI Mentor itu. Mentor earn passive income selamanya, shareholders earn dari setiap query user, learners dapat akses ke tactical knowledge yang nggak ada di internet.

**Pitch 1-kalimat:**
ChatGPT tahu yang ada di internet. Kami tokenize yang **tidak ada** di internet — tactical expertise, regulatory insights, insider knowledge. Experts earn, shareholders gain, learners access real-world intelligence yang sebelumnya cuma untuk elite networks.

---

## 🔑 KENAPA IDE INI MENARIK

1. **Obvious-but-nobody-built** — kombinasi primitive yang familiar tapi belum pernah di-combine
2. **Number-go-up jelas** — subscription + shares + royalty untuk mentor
3. **Emotional moat** — "own a piece of your mentor's mind" = memorable pitch
4. **Data is the moat** — knowledge yang nggak bisa di-public (contoh: loophole regulasi, insider tactics) = nggak bisa di-copy ChatGPT

---

## 🏗️ ARSITEKTUR TEKNIS (4 komponen 0G dipakai esensial)

- **0G Chain** → smart contract untuk shares, royalty, access control
- **0G Storage** → knowledge mentor tersimpan encrypted (KV untuk active memory, Log untuk archive)
- **0G Compute (TEE)** → inference yang nggak bisa di-intip bahkan oleh GPU operator
- **ERC-7857 INFT** → mentor di-tokenize sebagai Intelligent NFT (NFT yang bisa "transfer otak" dengan aman)

**Why 0G, not AWS + Ethereum?**
Butuh 3 guarantee bersamaan:
- Storage uncensorable (Log layer)
- Access trustless (smart contract gate)
- Inference tamper-proof (TEE hardware)

Kalau satu lepas, mentor nggak mau titipkan knowledge sensitif.

---

## 💰 TOKENOMICS

- Mentor mint AI Mentor → dapat initial shares (misal 50%)
- Sisa 50% dijual ke early shareholders
- User bayar subscription / pay-per-query
- Revenue flow: % ke mentor (royalty forever) + % dibagi ke shareholders pro-rata

**Anti-staleness mechanism:**
- **Vesting**: earnings mentor cair bertahap (30 hari). Kalau mentor ghosting, vesting extended / claw-back
- **AI confidence oracle**: LLM self-report confidence per query. Low confidence = gap count naik on-chain = market signal buat sell

---

## 🔄 CORE LOOP (demo moment utama)

1. Mentor upload framework awal
2. Shareholder tanya → AI jawab
3. AI confidence rendah → flag sebagai blind spot
4. Mentor lihat gap → update framework
5. AI makin tajam → value shares naik
6. Repeat

**Semua aktor menang saat loop jalan.**

---

## 👤 USER ZERO (ground truth)

Skenario konkret: mentor yang paham loophole regulasi pemerintah Indonesia untuk bangun bisnis. Knowledge ini:
- Nggak ada di Google/Udemy
- Nggak bisa di-public (reputational/legal risk)
- Terus update karena regulasi berubah
- Cuma bisa diakses shareholder

Ini membuktikan 3 hal:
✅ Knowledge punya real moat
✅ Access control wajib (TEE crucial, bukan optional)
✅ Loop self-improvement natural fit

---

## ⏱️ TIMELINE (3 minggu)

- **Minggu 1:** Scope lock, smart contract (INFT + shares + vesting), setup 0G Compute account
- **Minggu 2:** Build core — upload knowledge flow, query flow, shareholder dashboard
- **Minggu 3:** Polish UX, record demo video (≤3 menit), draft README AI-friendly, X post, deploy mainnet

---

## 📦 DELIVERABLES (requirement hackathon)

- [x] Mainnet contract address + explorer link
- [x] GitHub repo public
- [x] Demo video ≤3 menit
- [x] README dengan arsitektur + 0G integration mapping
- [x] X post dengan hashtag #0GHackathon #BuildOn0G + tag @0G_labs @HackQuest_

---

## 🧠 "WHY NOW" (pitch defense)

3 waves convergence di 2026:
1. Consumer-grade LLM (GPT-4, Claude, Llama) quality
2. TEE inference accessible via API (0G Compute)
3. ERC-7857 INFT standard lahir 2025

Tanpa convergence ketiganya, ide ini unbuildable sebelum sekarang.

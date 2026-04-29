AI Mentor Marketplace — Full Documentation
Ringkasan Eksekutif
AI Mentor Marketplace adalah platform Web3 di mana para expert men-tokenize keahlian mereka menjadi AI Mentor — sebuah agen AI yang dilatih dari knowledge pribadi sang expert, lalu dimonetisasi sebagai aset knowledge on-chain. Platform ini dibangun di atas 0G Network dan menargetkan Track 4 (Wildcard — SocialFi/Consumer App) pada 0G APAC Hackathon dengan deadline 16 Mei 2026.
Pitch satu kalimat: ChatGPT tahu apa yang ada di internet. Kami tokenize apa yang tidak ada di internet — private expert playbooks, tactical expertise, regulatory insights, dan operational know-how. Experts earn, curators gain, learners access real-world intelligence yang sebelumnya hanya bisa diakses oleh elite networks.

1. Problem Statement
Saat ini ada gap besar antara pengetahuan publik (yang bisa diakses siapa saja via Google, YouTube, ChatGPT) dan pengetahuan privat yang justru paling bernilai.
Masalah untuk Expert/Mentor: Mereka punya pengetahuan langka dan bernilai tinggi — misalnya regulatory playbooks, strategi bisnis niche, field-tested tactics, dan pengalaman operasional yang tidak terdokumentasi publik — tapi tidak punya cara aman dan scalable untuk memonetisasi knowledge tersebut. Pilihan yang ada sekarang: jadi konsultan 1-on-1 (tidak scalable), buat online course (harus di-public, knowledge bocor, gampang di-bajak), atau diam saja dan knowledge-nya mati bersama mereka.
Masalah untuk Learner: Pengetahuan paling bernilai tersembunyi di balik network eksklusif, mentoring mahal, atau bahkan tidak dijual sama sekali. Seorang entrepreneur pemula di Surabaya tidak punya akses ke insight regulasi yang dimiliki konsultan top di Jakarta, padahal satu insight itu bisa menghemat ratusan juta rupiah.
Masalah untuk Curator/Supporter: Tidak ada mekanisme untuk mendukung, mengkurasi, dan ikut mendapatkan upside dari expert knowledge yang benar-benar berguna. Kamu bisa mendukung creator lewat subscription, tapi belum ada cara Web3-native untuk membantu discovery AI Mentor berkualitas dan mendapat reward saat knowledge-nya dipakai orang lain.

2. Solution: AI Mentor Marketplace
Platform ini menyelesaikan ketiga masalah tersebut dengan satu mekanisme terintegrasi.
Untuk Expert/Mentor: Upload framework knowledge mereka ke sistem. Knowledge tersimpan encrypted di 0G Storage, inference berjalan di TEE (Trusted Execution Environment) sehingga bahkan operator GPU tidak bisa mengintip isinya. Mentor mendapat royalty selamanya dari setiap query, tanpa harus online 24/7.
Untuk Learner: Bayar subscription atau per-query untuk mengakses AI Mentor — sebuah AI yang menjawab bukan dari internet, tapi dari knowledge privat expert yang terverifikasi.
Untuk Curator/Supporter: Beli access shares dari AI Mentor yang mereka yakini bernilai. Setiap kali ada user query ke AI Mentor tersebut, curator mendapat bagian usage reward pro-rata. Semakin banyak user yang terbantu, semakin besar upside bagi para curator awal.

3. Kenapa Ide Ini Menarik
Obvious-but-nobody-built. Semua komponen sudah ada secara terpisah — AI agents, NFT, revenue sharing, encrypted storage — tapi belum pernah dikombinasikan dalam satu produk yang koheren. Ini sweet spot hackathon: cukup familiar untuk langsung dipahami juri, cukup novel untuk terasa fresh.
Number-go-up yang jelas. Setiap aktor punya insentif finansial langsung: mentor dapat royalty, curator dapat usage reward, platform dapat fee. Tidak ada aktor yang bergantung pada altruism.
Emotional moat. "Access your mentor's private playbook" bukan sekadar tagline — ini pitch yang langsung membuat orang ingin tahu lebih lanjut. Bandingkan dengan "decentralized knowledge protocol" yang abstrak dan forgettable.
Data is the moat. Knowledge yang di-tokenize adalah knowledge yang tidak bisa di-copy oleh ChatGPT karena memang tidak pernah ada di internet. Regulatory playbooks, field-tested tactics, pengalaman operasional, dan private expert frameworks — semua ini biasanya hanya hidup di kepala expert.

4. Arsitektur Teknis
4.1 Komponen 0G yang Digunakan
Platform ini menggunakan keempat komponen utama 0G Network secara esensial (bukan bolt-on):
0G Chain berfungsi sebagai layer smart contract. Semua logika access shares, royalty distribution, access control, dan vesting berjalan on-chain. Ini memastikan transparansi total — mentor bisa verify bahwa royalty-nya benar, curator bisa verify bahwa pembagian usage reward pro-rata-nya akurat.
0G Storage menyimpan knowledge mentor dalam bentuk encrypted. Arsitektur storage menggunakan dua layer: KV (Key-Value) untuk active memory — yaitu knowledge yang sedang aktif digunakan untuk inference, dan Log untuk archival — yaitu versi historis knowledge yang bisa di-audit atau di-rollback.
0G Compute dengan TEE menjalankan inference AI di dalam Trusted Execution Environment. Ini krusial karena knowledge mentor bersifat sensitif. Tanpa TEE, GPU operator bisa mengintip knowledge yang sedang di-proses. Dengan TEE, bahkan infrastructure provider tidak bisa melihat apa yang terjadi di dalam enclave.
ERC-7857 INFT (Intelligent NFT) adalah standar baru (lahir 2025) yang memungkinkan NFT membawa "intelligence" — dalam konteks ini, kemampuan AI Mentor untuk menjawab query. INFT memungkinkan "transfer otak" yang aman: jika ownership INFT berpindah, AI Mentor-nya ikut berpindah dengan semua knowledge-nya, tanpa risiko knowledge bocor selama transfer.
4.2 Kenapa 0G, Bukan AWS + Ethereum?
Pertanyaan ini pasti muncul dari juri, dan jawabannya fundamental: platform ini membutuhkan tiga guarantee secara bersamaan.
Pertama, storage harus uncensorable — knowledge mentor tidak boleh bisa dihapus oleh siapapun (termasuk platform). 0G Log layer memberikan ini. AWS S3 bisa delete file kapan saja.
Kedua, access harus trustless — siapa yang boleh query harus ditentukan oleh smart contract, bukan oleh admin backend. 0G Chain memberikan ini. Centralized server bisa di-bypass.
Ketiga, inference harus tamper-proof — proses AI menjawab query tidak boleh bisa diintip. 0G Compute TEE memberikan ini. AWS Lambda tidak punya guarantee ini.
Kalau satu saja dari tiga guarantee ini hilang, expert rasional tidak akan mau menitipkan knowledge sensitifnya ke platform. Ketiga guarantee ini hanya bisa dipenuhi secara bersamaan oleh infrastruktur 0G.
5. Tokenomics
5.1 Struktur Access Shares
Ketika seorang mentor mem-mint AI Mentor-nya, access shares dibagi menjadi dua pool. Mentor mendapat initial shares (contoh: 50%) yang menjamin mereka selalu menjadi stakeholder terbesar. Sisa 50% dijual ke early curators melalui mekanisme bonding curve atau fixed-price sale.
5.2 Revenue Flow
Revenue berasal dari dua sumber: subscription (bayar bulanan untuk akses unlimited query ke satu atau beberapa AI Mentor) dan pay-per-query (bayar per pertanyaan, cocok untuk user kasual). Revenue yang masuk didistribusikan secara otomatis oleh smart contract: persentase tertentu ke mentor sebagai royalty (berlaku selamanya selama AI Mentor aktif), persentase lain dibagi ke semua curators secara pro-rata berdasarkan jumlah access shares yang dimiliki, dan sisanya ke platform sebagai operational fee.
5.3 Anti-Staleness Mechanism
Ini bagian kritis yang membedakan platform dari skema "mint-and-abandon". Ada dua mekanisme built-in.
Vesting: Earnings mentor tidak langsung cair. Ada vesting period 30 hari. Jika mentor ghosting (tidak update knowledge, tidak respond gap reports), vesting period diperpanjang atau bahkan di-clawback. Ini memastikan mentor punya skin-in-the-game untuk terus maintain kualitas AI Mentor-nya.
AI Confidence Oracle: Setiap kali AI Mentor menjawab query, sistem menghitung confidence signal dari kombinasi retrieval score, source match, dan optional LLM self-evaluation. Jika confidence rendah (artinya knowledge base belum punya jawaban yang cukup kuat), gap count naik on-chain. Gap count ini visible untuk semua orang dan berfungsi sebagai market signal. Curators bisa melihat: "AI Mentor ini gap count-nya naik terus, berarti knowledge-nya perlu di-update" — dan bisa decide untuk exit atau mendorong mentor melakukan update. Ini menciptakan tekanan natural bagi mentor untuk terus maintain kualitas.

6. Core Loop
Ini adalah "demo moment" utama — loop yang menunjukkan bagaimana semua aktor saling memperkuat.
Langkah 1: Mentor upload framework knowledge awal ke platform. Misalnya, seorang konsultan regulasi upload pemahaman mereka tentang proses perizinan bisnis di Indonesia.
Langkah 2: Curator atau subscriber mengirim query ke AI Mentor. AI menjawab berdasarkan knowledge yang tersimpan.
Langkah 3: Pada beberapa query, AI mendeteksi confidence-nya rendah — misalnya ditanya tentang regulasi terbaru yang belum ada di knowledge base. AI otomatis flag ini sebagai "blind spot" on-chain.
Langkah 4: Mentor melihat daftar blind spots di dashboard-nya. Ini seperti "to-do list" otomatis yang generated dari real user questions. Mentor kemudian update framework-nya untuk menutup gap tersebut.
Langkah 5: Setelah update, AI Mentor menjadi lebih tajam dan comprehensive. Confidence score naik, gap count turun. Ini meningkatkan perceived value, menarik lebih banyak subscriber, dan menaikkan harga access shares.
Langkah 6: Repeat. Loop ini self-reinforcing — semakin banyak query, semakin jelas gap-nya, semakin cepat mentor improve, semakin valuable AI Mentor-nya.
Kunci dari loop ini: semua aktor menang secara simultan. Mentor menang karena knowledge-nya makin comprehensive dan royalty-nya naik. Curator menang karena value access shares-nya naik. Learner menang karena kualitas jawaban makin baik. Tidak ada zero-sum.

7. User Zero: Ground Truth Validation
Untuk membuktikan bahwa ide ini bukan sekadar teori, kita pakai skenario konkret sebagai "user zero."
Persona: Seorang konsultan senior yang memahami proses, pola, dan mekanisme regulasi pemerintah Indonesia untuk mendirikan dan menjalankan bisnis. Pengetahuan ini mencakup proses perizinan yang terjadi di lapangan, jalur-jalur alternatif yang legal tapi tidak terdokumentasi dengan baik, timing optimal untuk pengajuan, checklist dokumen yang sering terlewat, dan cara navigate birokrasi secara etis.
Kenapa knowledge ini cocok untuk platform?
Pertama, knowledge ini tidak ada di Google atau Udemy. Ini bukan informasi yang bisa dicari di internet karena sifatnya tacit dan experiential.
Kedua, knowledge ini tidak selalu cocok untuk di-public. Banyak advisory knowledge bersifat kontekstual, butuh disclaimer, dan sebaiknya hanya diberikan kepada user yang punya akses serta memahami batas penggunaannya. Di dalam platform dengan access control yang ketat, mentor bisa share secara lebih aman tanpa membuat seluruh playbook mereka bocor ke publik.
Ketiga, knowledge ini terus update. Regulasi Indonesia berubah terus-menerus. Ini membuat core loop (gap detection → mentor update) sangat natural fit.
Keempat, access control bukan nice-to-have, tapi mandatory. Ini membuktikan bahwa TEE bukan fitur tambahan yang dipaksakan untuk memenuhi requirement hackathon — tapi genuinely essential untuk use case ini.

8. Competitive Landscape
vs. ChatGPT/Claude/Generic LLMs: LLM generik hanya tahu apa yang ada di training data (internet publik). AI Mentor Marketplace men-tokenize knowledge yang by definition tidak ada di internet. Bukan kompetitor, tapi komplementer — platform ini justru menggunakan LLM sebagai inference engine.
vs. Online Course Platforms (Udemy, Coursera): Course platforms mengharuskan knowledge di-public-kan. Sekali kursus dijual, knowledge-nya bisa di-copy, di-bajak, dan value-nya turun seiring waktu. AI Mentor Marketplace menjaga knowledge tetap encrypted dan access-controlled.
vs. Consulting/Coaching: Consulting bersifat 1-on-1 dan tidak scalable. Seorang konsultan hanya punya 24 jam sehari. AI Mentor bisa menjawab ribuan query secara bersamaan, 24/7, tanpa mentor harus online.
vs. Friend.tech / SocialFi Platforms: Friend.tech men-tokenize "akses ke orang." AI Mentor Marketplace men-tokenize "akses ke knowledge orang." Perbedaan kritis: di Friend.tech, value turun kalau orang-nya offline. Di platform ini, AI Mentor tetap berjalan bahkan saat mentor tidur.

9. Why Now — Tiga Gelombang Konvergensi
Ide ini unbuildable sebelum 2025-2026 karena membutuhkan konvergensi tiga perkembangan teknologi yang baru terjadi secara bersamaan.
Gelombang 1: Consumer-grade LLM. GPT-4, Claude, Llama, dan model-model open-source lainnya telah mencapai kualitas yang cukup baik untuk menjadi inference engine yang reliable. Dua tahun lalu, kualitas LLM belum cukup untuk menjawab query teknis dengan akurat berdasarkan knowledge base yang terbatas.
Gelombang 2: TEE inference accessible via API. 0G Compute membuat TEE-based inference bisa diakses lewat API, bukan harus setup hardware sendiri. Sebelumnya, menjalankan inference di TEE membutuhkan infrastruktur khusus yang mahal dan kompleks.
Gelombang 3: ERC-7857 INFT standard. Standar Intelligent NFT baru lahir di 2025. Standar ini memungkinkan NFT membawa intelligence (model weights, knowledge) dan mentransfernya secara aman. Tanpa standar ini, tokenisasi AI Mentor harus dibangun dari nol dengan risiko keamanan yang tidak terjamin.
Ketiganya harus ada. LLM tanpa TEE = knowledge bocor. TEE tanpa INFT = tidak bisa di-trade. INFT tanpa LLM = NFT kosong tanpa intelligence.

10. Timeline Pengembangan (3 Minggu)
Minggu 1 — Foundation. Scope lock dan finalisasi arsitektur. Develop smart contract untuk INFT minting, access shares registry, dan vesting logic. Setup akun 0G Compute dan konfigurasi TEE environment. Deliverable akhir minggu: smart contract deployed di testnet, TEE environment siap.
Minggu 2 — Core Build. Bangun flow utama: mentor upload knowledge (encrypted ke 0G Storage), user query flow (access check via smart contract → decrypt di TEE → LLM inference → return answer), dan curator dashboard (lihat access shares, usage reward, gap count). Deliverable akhir minggu: end-to-end flow berjalan di testnet.
Minggu 3 — Polish & Ship. Polish UX agar demo-friendly. Record demo video (maksimal 3 menit). Draft README yang comprehensive dengan arsitektur dan 0G integration mapping. Buat X post dengan hashtag yang required. Deploy ke mainnet. Deliverable akhir minggu: semua submission requirement terpenuhi.

11. Deliverables Hackathon
Sesuai requirement hackathon, berikut yang harus disubmit: mainnet contract address beserta explorer link, GitHub repository public, demo video maksimal 3 menit, README dengan arsitektur dan 0G integration mapping, serta X post dengan hashtag #0GHackathon #BuildOn0G dan tag @0G_labs @HackQuest_.

12. Risks & Mitigations
Risk: Mentor tidak mau upload knowledge sensitif. Mitigation: TEE guarantee bahwa bahkan operator GPU tidak bisa intip. Ditambah, mentor retain 50% access shares — mereka punya kontrol dan insentif. Demo dengan user zero membuktikan bahwa security model cukup kuat.
Risk: Knowledge cepat outdated. Mitigation: Anti-staleness mechanism (vesting + confidence oracle) menciptakan tekanan ekonomi bagi mentor untuk terus update. Gap detection membuat update terarah, bukan random.
Risk: Low query volume di awal. Mitigation: Fokus pada niche high-value (regulasi bisnis Indonesia) di mana satu jawaban bisa bernilai jutaan rupiah. Tidak perlu volume massal untuk generate meaningful revenue.
Risk: Regulatory uncertainty seputar tokenisasi knowledge. Mitigation: Access shares diposisikan sebagai utility primitive untuk kurasi, akses, dan usage reward di dalam platform, bukan klaim kepemilikan perusahaan atau janji profit pasif. Namun ini tetap perlu kajian legal lebih lanjut post-hackathon.

13. Future Roadmap (Post-Hackathon)
Phase 1 — Vertical Expansion. Setelah validasi dengan user zero (regulasi bisnis), expand ke vertikal lain: crypto tax optimization, DeFi strategy, real estate investment tactics, medical second opinion (dengan disclaimer yang sesuai).
Phase 2 — Mentor-to-Mentor Composition. AI Mentor bisa "consult" AI Mentor lain. Misalnya, AI Mentor regulasi bisa otomatis query AI Mentor perpajakan untuk memberikan jawaban yang lebih holistik. Revenue di-split otomatis antar mentor yang terlibat.
Phase 3 — DAO Governance. Curators dari AI Mentor tertentu bisa vote untuk keputusan penting: apakah mentor harus update topik X, apakah pricing perlu diubah, apakah knowledge tertentu perlu di-archive. Ini membuat setiap AI Mentor menjadi mini-DAO.
Phase 4 — Cross-Chain dan Multi-Model. Support untuk multiple LLM backends (GPT, Claude, open-source models) dan deployment di chain lain selain 0G untuk meningkatkan reach.

Dokumen ini mencakup keseluruhan konsep AI Mentor Marketplace — dari problem statement hingga roadmap masa depan. Kalau ada bagian yang ingin diperdalam atau direvisi, langsung bilang saja.

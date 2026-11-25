# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## APLIKASI MICRO-LEARNING INTERAKTIF

**Gamified Interactive Learning Mobile-First Web & Android Application**

| Document Information | Detail |
| :--- | :--- |
| **Project Name** | ZenoQuest *(Dapat disesuaikan sebelum rilis final)* |
| **Document Type** | Product Requirements Document (PRD) |
| **Document Version** | 1.6 (Synchronized Final Baseline) |
| **Document Status** | FROZEN BASELINE FOR IMPLEMENTATION |
| **Effective Date** | 19 November 2026 |
| **Target Deadline** | 1 Desember 2026 |
| **Target Platform** | Mobile-First Web Application (PWA) & Android Wrapper (Capacitor, Min SDK API 24 / Android 7.0+) |
| **Core Tech Stack** | Vue 3 (Composition API), Vite, Tailwind CSS, Vue Router |
| **Data Persistence** | Offline-First (Static JSON Curriculum + Browser `localStorage` via Storage Adapter) |
| **Companion Documents** | `PDD_v3.2_Vue3_Architecture.md`, `SOP_dan_Panduan_Kerja_Tim_v1.1.md`, `Panduan_Divisi_Desain.md` (v1.1) |

### Document Notice

> Dokumen Product Requirements Document (PRD) Versi 1.6 merupakan pembaruan sinkronisasi akhir dari PRD v1.5. Revisi pada versi ini menyelaraskan struktur *node* kurikulum dengan hasil produksi aktual tim Content (penggabungan *Theory*, *Code Example*, dan *Interactive Question* pada tiap *node*), menetapkan target 3 level wajib MVP dari total 5 level kurikulum penuh, mengunci navigasi bawah 3 tab aktif, mengunci mekanisme input teks ternormalisasi pada soal *Fill in the Blank*, serta menambahkan batas ukuran aset maskot dan perlindungan area aman (*safe area*) untuk pembungkusan Capacitor.

---

## 1. EXECUTIVE SUMMARY & PRODUCT OVERVIEW

### 1.1 Product Vision

Membangun aplikasi pembelajaran pemrograman mandiri berbasis *micro-learning* bergaya gamifikasi interaktif yang ringan, berjalan 100% secara luring (*offline-first*), memiliki tema visual dinamis pada setiap level, serta berarsitektur modular sehingga mudah dipelihara dan dilanjutkan oleh angkatan penerus (XI TJKT).

### 1.2 Target Audience

- **Segmen Pengguna Utama:** Pelajar SMK dan pemula usia 15–23 tahun yang mempelajari dasar pemrograman melalui perangkat seluler.
- **Karakteristik Pengguna:** Membutuhkan penjelasan ringkas (*bite-sized*), latihan interaktif bertahap, serta umpan balik langsung (*instant feedback*) tanpa ketergantungan pada koneksi internet.

### 1.3 Core Value Proposition

1. **100% Offline-First:** Seluruh kurikulum, tema, dan aset visual dibundel secara lokal tanpa memerlukan peladen (*backend server*) maupun registrasi akun daring.
2. **Dual-Track Curriculum:** Menyediakan dua jalur kurikulum terstruktur dalam satu aplikasi tunggal, yakni **Web Development (HTML/CSS/JS)** oleh Absen Kecil dan **C# Fundamentals** oleh Absen Besar.
3. **Dynamic Level Theme & Reactive Mascot:** Setiap level menghadirkan palet warna, ilustrasi latar, serta maskot dengan 4 ekspresi yang bereaksi terhadap jawaban pengguna.

### 1.4 Platform & Tech Stack Specification

- **UI Framework & Build Tool:** Vue 3 (`<script setup>`), Vite, Tailwind CSS, Vue Router.
- **Offline & Mobile Packaging:** Progressive Web App (`vite-plugin-pwa` / Service Worker) untuk distribusi web/instalasi peramban dan **Capacitor** untuk pembungkusan berkas instalasi Android (`.apk` / `.aab`).
- **Local Data Storage:** Berkas **Static JSON** (*read-only*) untuk kurikulum/tema dan `window.localStorage` melalui lapisan abstraksi (`storageService.js`) untuk menyimpan profil lokal, progres level, XP, *Hearts*, dan *Session Recovery*.

---

## 2. PROBLEM STATEMENT & PRODUCT GOALS

### 2.1 Problem Statement

1. Pemula sering kesulitan memahami sintaks pemrograman dasar melalui dokumentasi panjang tanpa latihan interaktif per konsep.
2. Keterbatasan koneksi internet pada lingkungan sekolah menghambat penggunaan platform belajar daring.
3. Proyek perangkat lunak sekolah sering terhenti setelah pengembang utama lulus karena kode tidak modular dan tidak memisahkan data kurikulum dari logika tampilan.

### 2.2 Product Goals

1. Merilis aplikasi MVP yang terintegrasi penuh antara kelompok Absen Kecil dan Absen Besar paling lambat **1 Desember 2026**.
2. Menuntaskan minimal **3 Level MVP wajib** (`L01` – `L03`) per jalur materi dari total rancangan **5 Level kurikulum penuh** (`L01` – `L05`).
3. Menjamin aplikasi berjalan stabil pada perangkat seluler dengan waktu transisi tema `< 500 ms`, penggunaan memori RAM `< 150 MB`, dan `0%` duplikasi XP.

---

## 3. PROJECT ORGANIZATION & TEAM GOVERNANCE

### 3.1 Struktur Kelompok Pengembang

Proyek dilaksanakan secara kolaboratif oleh dua kelompok operasional (**Absen Kecil** dan **Absen Besar**) yang membangun **satu produk aplikasi tunggal** pada **satu repositori Git utama**.

### 3.2 Peran Lintas Divisi

| Divisi | Tanggung Jawab Utama |
| :--- | :--- |
| **Team Lead (2 Orang: 1 per Kelompok)** | Pengambilan keputusan produk, pengendalian ruang lingkup (*scope control*), sinkronisasi lintas kelompok, dan pelaporan kepada guru pembimbing. |
| **Designer Team (5 Orang per Kelompok)** | Penyusunan *Design System* Figma, desain 6 layar utama (*mobile* 360 × 800 px), produksi 4 ekspresi maskot, palet warna tema, dan ilustrasi latar WebP. |
| **Content Team (5 Orang per Kelompok)** | Penyusunan silabus, materi teori, contoh kode teruji, 10 soal per level, umpan balik benar/salah, dan dialog maskot langsung dalam format Static JSON. |
| **Developer Team (6 Orang per Kelompok: 1 Lead Dev + 5 Anggota)** | Implementasi aplikasi Vue 3 + Tailwind CSS, lapisan penyimpanan lokal, mesin validasi soal, *Dynamic Theme Engine*, PWA, serta pembungkusan APK Capacitor. |

*(Catatan: Rincian kepemilikan berkas kode dan jadwal eksekusi harian diatur terpisah di dalam dokumen `SOP_dan_Panduan_Kerja_Tim_v1.1.md` dan `Panduan_Divisi_Desain.md` v1.1).*

---

## 4. PRODUCT SCOPE & MOSCOW PRIORITIZATION

### 4.1 Must-Have Features (Wajib Selesai untuk MVP 1 Desember)

| Feature ID | Nama Fitur | Prioritas | Deskripsi Singkat |
| :--- | :--- | :--- | :--- |
| **F-01** | **Onboarding & Local Profile** | Must-Have | Pembuatan profil lokal tunggal (nama panggilan & avatar) saat pertama kali membuka aplikasi. |
| **F-02** | **3-Tab App Shell & World Map** | Must-Have | Navigasi bawah 3 tab aktif (`Materi`, `Belajar`, `Profil`) untuk memilih jalur dan menelusuri peta level vertikal. |
| **F-03** | **Level Progression** | Must-Have | Mekanisme status level berurutan: `Locked`, `Active`, dan `Completed`. |
| **F-04** | **Dynamic Theme Engine** | Must-Have | Perubahan otomatis 4 token warna UI, ilustrasi latar WebP, dan kostum maskot sesuai level. |
| **F-05** | **Unified Quiz Arena** | Must-Have | Arena kuis di mana setiap *node* menampilkan *Theory* + *Code Example* + 1 soal interaktif (`multiple_choice`, `fill_blank`, atau `arrange_code`). |
| **F-06** | **Mascot System** | Must-Have | Maskot interaktif dengan 4 *state* (`idle`, `explain`, `happy`, `sad`) dan balon dialog (≤ 160 karakter). |
| **F-07** | **Heart System** | Must-Have | Sistem 5 *Hearts* per sesi; berkurang 1 saat jawaban salah dan memicu *Game Over* saat mencapai 0. |
| **F-08** | **XP System & Anti-Duplikasi** | Must-Have | Pemberian +10 XP per *node* baru, bonus +20 XP *Perfect Run*, dan +0 XP untuk pengulangan *node* lama. |
| **F-09** | **Session Recovery** | Must-Have | Penyimpanan posisi *node* dan sisa *Hearts* secara otomatis agar sesi dapat dilanjutkan jika aplikasi tertutup. |
| **F-10** | **Local Persistence** | Must-Have | Penyimpanan seluruh data pengguna secara lokal pada `window.localStorage` dengan manajemen versi skema. |
| **F-11** | **Offline Mode & Packaging** | Must-Have | Kemampuan berjalan 100% luring melalui *precaching* PWA serta pembungkusan akhir menjadi APK via Capacitor. |

### 4.2 Should-Have, Could-Have, & Won't-Have

- **Should-Have:** Penyuntingan nama/avatar lokal pada tab *Profil*, tombol *Reset Progress* dengan dialog konfirmasi, dan transisi halus antar-kartu soal.
- **Could-Have (Pengembangan Angkatan Penerus):** Efek suara (*SFX*), lencana pencapaian (*badges*), dan dukungan opsi *chip* pengecoh tambahan pada `fill_blank`.
- **Won't-Have (Di Luar Ruang Lingkup MVP):** Registrasi/Login server, *cloud database*, *Global Leaderboard* daring (tab Papan Peringkat dihapus), *compiler* kode sisi peladen, dan fitur chat/sosial.

---

## 5. FUNCTIONAL REQUIREMENTS & APPLICATION FLOW

### 5.1 Alur Makro Aplikasi (*Macro User Flow*)

```text
[0. Boot / Cek localStorage]
        │
        ├── (zq_profile kosong) ──▶ [1. Onboarding (/onboarding)]
        │                             • Input nama panggilan & pilih avatar
        │                             • Inisialisasi: xp = 0, unlocked = [web_lvl_01, csharp_lvl_01]
        │                                       │
        └── (zq_profile ada) ───────────────────┴──▶ [APP SHELL: 3 TAB NAVIGASI BAWAH]
                                                                  │
                              ┌───────────────────────────────────┼───────────────────────────────────┐
                              ▼                                   ▼                                   ▼
                 [Tab 1: Materi (/courses)]          [Tab 2: Belajar (/map/:track)]      [Tab 3: Profil (/profile)]
                 • Pilih Track:                      • Peta level vertikal               • Nama, avatar, total XP,
                   - Web Dev (Absen Kecil)             (L01 s/d L05; MVP L01–L03)          dan jumlah level tamat
                   - C# Dasar (Absen Besar)          • Status: Locked / Active /         • Ubah nama / avatar lokal
                 • Indikator % penyelesaian            Completed                         • Tombol "Reset Progress"
                              │                                   │
                              └─────────── (Pilih Track) ─────────┘
                                                                  │
                                                   (Ketuk Level Active / Completed)
                                                                  ▼
                                                  [4. Quiz Arena (/quiz/:levelId)]
                                                    (Layar penuh tanpa 3 tab bawah)
                                                                  │
                                                     ┌────────────┴────────────┐
                                                     ▼                         ▼
                                          [5a. Level Complete]          [5b. Game Over]
                                          • Tambah XP & Bonus           • Terjadi saat Hearts = 0
                                          • Buka level berikutnya       • Hapus active_session
                                          • Hapus active_session        • Tombol "Ulangi Level"
                                                     │                         │
                                                     └────────────┬────────────┘
                                                                  ▼
                                                   Kembali ke [Tab 2: Belajar (/map/:track)]
```

### 5.2 Alur Mikro di Dalam Quiz Arena (*Micro Quiz Flow*)

```text
[Masuk /quiz/:levelId]
  │
  ├─▶ 1. Baca JSON Level -> Terapkan Dynamic Theme (4 warna Hex, background WebP, kostum maskot)
  ├─▶ 2. Cek zq_active_session di localStorage:
  │      • Ada sesi tersimpan untuk level ini -> Pulihkan nodeIndex & currentHearts terakhir
  │      • Tidak ada -> Mulai dari Node 1 (nodeIndex = 0) dengan currentHearts = 5
  │
  ▼
[LOOP NODE: 1 sampai 10]
  │
  ├─▶ 3. Tampilkan 4 Zona Layar:
  │      • Zona 1 (Top HUD)  : Tombol Keluar (X), Progress Bar (1/10), Indikator 5 Hearts
  │      • Zona 2 (Mascot)   : Maskot (state: explain/idle) & balon dialog (<= 160 karakter)
  │      • Zona 3 (Workspace): Kartu Theory + Code Example + Soal Interaktif (1 dari 3 tipe)
  │      • Zona 4 (Action)   : Tombol "PERIKSA"
  │
  ├─▶ 4. Pengguna Menekan "PERIKSA" -> Validasi Lokal (0 ms)
  │      │
  │      ├── [BENAR]
  │      │    • Maskot beralih ke state `happy` + balon menampilkan `mascot_dialogue`
  │      │    • Bottom Sheet hijau menampilkan `feedback_correct` + tombol "LANJUT"
  │      │    • Klaim +10 XP (jika node_id belum ada di zq_node_claims)
  │      │    • Simpan zq_active_session (nodeIndex + 1) ke localStorage
  │      │
  │      └── [SALAH]
  │           • Kurangi nyawa (currentHearts - 1) & simpan ke localStorage
  │           • Maskot beralih ke state `sad`
  │           • Bottom Sheet merah menampilkan `feedback_incorrect`
  │           • Cek sisa nyawa:
  │               ├── Jika currentHearts > 0 -> Tombol "COBA LAGI" (tetap pada node yang sama)
  │               └── Jika currentHearts == 0 -> Tampilkan Modal [5b. Game Over]
  │
  ▼
[Seluruh Node Selesai (currentHearts > 0)]
  │
  ├─▶ 5. Evaluasi Bonus Perfect Run (+20 XP jika currentHearts == 5 dan belum pernah diklaim)
  ├─▶ 6. Tandai level "Completed", buka level berikutnya "Active", hapus zq_active_session
  └─▶ 7. Tampilkan Modal [5a. Level Complete]
```

### 5.3 Struktur Node Terpadu & Tiga Tipe Soal Interaktif (`F-05`)

Selaras dengan *blueprint* produksi kedua tim Content, setiap level memuat 10 Node (minimal 5–10 *node*), di mana **setiap *node* secara utuh memuat ringkasan materi (`theory`), contoh kode (`code_example`), dan tepat satu soal interaktif** dengan distribusi standar:

1. **`multiple_choice` (Standar 4 soal/level):** Pertanyaan pilihan ganda dengan 4 opsi vertikal. Pengguna mengetuk satu opsi lalu menekan **PERIKSA**.
2. **`fill_blank` (Standar 3 soal/level):** Blok kode dengan satu bagian rumpang yang ditandai token baku `___`. **Keputusan Final MVP:** Menggunakan **kolom input ketik teks ternormalisasi** (`<input type="text">`) sesuai catatan validasi QA pada *blueprint* Content (menormalisasi spasi tepi, menghapus tanda kurung sudut `< >` khusus HTML jika diminta, serta menjaga aturan *case-sensitive* pada kata kunci C#).
3. **`arrange_code` (Standar 3 soal/level):** Kumpulan kepingan blok kode teracak yang diketuk pengguna untuk disusun di area jawaban. Validasi dilakukan dengan membandingkan **gabungan string kode hasil susunan** setelah normalisasi spasi terhadap `correct_code` agar kebal terhadap duplikasi chip.

### 5.4 Cakupan Kurikulum 5 Level vs. Batas Wajib MVP

- **Target Kurikulum Penuh: 5 Level per jalur** (`L01` – `L05` untuk Web Development dan `L01` – `L05` untuk C# Fundamentals).
- **Batas Wajib Rilis MVP (1 Desember):** Minimal **3 Level Pertama (`L01`, `L02`, `L03`)** pada masing-masing jalur wajib selesai, terverifikasi bebas *bug* sintaks, dan terintegrasi penuh sebelum *Code Freeze* 28 November. Level `L04` dan `L05` dapat ditambahkan sebagai pelengkap tanpa mengganggu stabilitas MVP.

### 5.5 Aturan Sistem Nyawa, XP, & Pemulihan Sesi (`F-07`, `F-08`, `F-09`)

- **Heart System:** Setiap sesi baru dimulai dengan 5 *Hearts*. Jawaban salah mengurangi 1 *Heart* dan memberikan kesempatan mencoba lagi selama nyawa > 0. Saat nyawa mencapai 0, muncul modal *Game Over*.
- **Base Node XP & Anti-Duplikasi:** Setiap *node* yang dijawab benar untuk pertama kalinya memberikan +10 XP dan mencatat `node_id` ke `zq_node_claims`. Pengulangan *node* yang sama (baik karena *replay* level tamat maupun mengulang setelah *Game Over*) menghasilkan +0 XP.
- **Perfect Run Bonus:** Menamatkan level dengan 5 *Hearts* utuh memberikan bonus +20 XP satu kali per level (`perfect_run_claimed = true`).
- **Session Recovery vs. Restart:** Menutup aplikasi di tengah level memulihkan `nodeIndex` dan sisa *Hearts* saat dibuka kembali. Menekan **Ulangi Level** pada layar *Game Over* mengembalikan `currentHearts = 5` dan `nodeIndex = 0` tanpa menghapus XP yang sudah diklaim.

---

## 6. DATA & PERSISTENCE REQUIREMENTS

1. **Static JSON Curriculum (`src/data/`):** Menyimpan metadata jalur (`courses.json`) serta data level, tema, teori, dan soal (`web_levels.json`, `csharp_levels.json`) dalam sifat baca-saja (*read-only*).
2. **Local Storage Adapter (`src/services/storageService.js`):** Seluruh pembacaan dan penulisan ke `window.localStorage` wajib melalui satu layanan perantara terpusat dengan awalan kunci `zq_` (`zq_schema_version`, `zq_profile`, `zq_stats`, `zq_progress`, `zq_node_claims`, `zq_active_session`). Pola ini memudahkan angkatan penerus apabila kelak ingin mengganti penyimpanan ke IndexedDB atau *cloud backend* tanpa merombak komponen UI.

---

## 7. UI/UX & ACCESSIBILITY REQUIREMENTS

1. **Mobile-First Viewport:** Kontainer utama dibatasi lebarnya pada rentang 360 px–430 px (*centered layout* pada layar desktop) dengan *padding* horizontal minimal 16 px.
2. **Navigasi Bawah 3 Tab:** Hanya menampilkan 3 tab fungsional: **Materi** (`/courses`), **Belajar** (`/map/:trackId`), dan **Profil** (`/profile`). Tab ini disembunyikan secara otomatis saat pengguna berada di `/onboarding` dan `/quiz/:levelId`.
3. **Perlindungan Area Aman (*Safe Area Insets*):** Seluruh elemen puncak (*Top HUD*) dan dasar (*Bottom Navigation Bar & Bottom Action Sheet*) wajib menerapkan ruang aman CSS (`env(safe-area-inset-top)` dan `env(safe-area-inset-bottom)`) agar tidak tertutup poni layar (*notch*) atau bilah gestur Android saat dijalankan melalui Capacitor.
4. **Keterbacaan & Kontras:** Kombinasi `text_primary` terhadap `bg_primary` dan `bg_surface` wajib memenuhi rasio kontras minimal ≥ 4.5 : 1 (WCAG AA). Seluruh contoh kode dan area soal sintaks wajib menggunakan jenis huruf *monospace*.

---

## 8. ASSET & CONTENT STANDARDS

| Kategori | Spesifikasi Wajib | Batasan Keras |
| :--- | :--- | :--- |
| **Aset Maskot** | Dimensi 512 × 512 px (rasio 1 : 1), latar transparan, 4 ekspresi (`idle`, `explain`, `happy`, `sad`). | Format **WebP Transparan** (`.webp`), ukuran berkas **≤ 100 KB per pose** agar tidak melampaui batas *precache* PWA. |
| **Background Tema** | Dimensi vertikal 1080 × 1920 px hingga 1080 × 2400 px. | Format **WebP** (`.webp`), ukuran berkas **≤ 200 KB per gambar.** |
| **Palet Warna Tema** | 4 kode warna Hex (`bg_primary`, `bg_surface`, `accent_color`, `text_primary`). | Rasio kontras teks ≥ 4.5 : 1. |
| **Dialog Maskot** | Teks `mascot_dialogue` pada setiap *node*. | Panjang maksimal **≤ 160 karakter** termasuk spasi. |
| **Umpan Balik Soal** | Properti `feedback_correct` dan `feedback_incorrect`. | Wajib tersedia secara terpisah pada setiap *node* soal. |
| **Serah Terima Konten** | Berkas JSON tervalidasi (`web_levels.json`, `csharp_levels.json`). | Dilarang menyerahkan naskah produksi dalam format PDF/Word untuk mencegah rusaknya simbol kode (`=`, `<`, `>`, `;`). |

---

## 9. NON-FUNCTIONAL REQUIREMENTS (NFR)

| ID | Kategori | Requirement | Target Metrik |
| :--- | :--- | :--- | :--- |
| **NFR-01** | **Offline Capability** | Seluruh fitur inti berjalan tanpa internet setelah pemuatan pertama. | 100% fungsi aktif pada *Airplane Mode* |
| **NFR-02** | **Compatibility** | Berjalan di peramban seluler modern dan Android WebView (Capacitor). | Android 7.0+ (API 24) & Mobile Chrome/Safari |
| **NFR-03** | **Performance** | Kecepatan penerapan tema warna & latar saat berpindah level. | Waktu transisi < 500 ms |
| **NFR-04** | **Stability** | Ketahanan terhadap galat *runtime*, aset hilang, atau ketukan cepat. | *Crash-free sessions* > 99% (0 *console error*) |
| **NFR-05** | **Memory Usage** | Penggunaan memori RAM saat aset maskot dan latar aktif bersamaan. | Konsumsi RAM < 150 MB |
| **NFR-06** | **Persistence** | Keamanan progres dan pemulihan sesi saat aplikasi ditutup paksa. | 100% status `localStorage` terjaga akurat |
| **NFR-07** | **Responsiveness** | Tata letak utuh tanpa *horizontal overflow* atau teks terpotong. | Responsif pada lebar 360 px–430 px + *Safe Area* |
| **NFR-08** | **Data Integrity** | Akurasi XP serta pencegahan penambahan XP ganda. | 0% duplikasi XP pada *node* yang sudah diklaim |

---

## 10. ACCEPTANCE CRITERIA (KRITERIA PENERIMAAN MVP)

Produk dinyatakan lulus uji penerimaan dan siap dikumpulkan pada **1 Desember 2026** apabila seluruh 16 poin berikut terpenuhi:

1. [ ] Aplikasi berjalan 100% luring (*offline*) setelah pemuatan awal pada mode PWA maupun APK Android.
2. [ ] Pengguna baru dapat membuat profil lokal melalui layar *Onboarding* tanpa login peladen.
3. [ ] Navigasi bawah menampilkan tepat 3 tab fungsional (`Materi`, `Belajar`, `Profil`) tanpa tab mati.
4. [ ] Tab `Materi` menampilkan pilihan jalur **Web Development** (Absen Kecil) dan **C# Fundamentals** (Absen Besar) beserta persentase progres.
5. [ ] Minimal 3 Level MVP (`L01` – `L03`) pada masing-masing jalur tersedia, bebas kesalahan sintaks kode, dan terbuka secara berurutan (`Locked` → `Active` → `Completed`).
6. [ ] *Dynamic Theme Engine* menerapkan 4 token warna Hex, latar WebP, dan kostum maskot dalam waktu < 500 ms serta memiliki *fallback* aman jika aset belum tersedia.
7. [ ] Setiap *node* di Quiz Arena menampilkan materi *Theory*, *Code Example*, dan 1 soal interaktif secara utuh tanpa terpotong pada *viewport* 360 × 800 px.
8. [ ] Validasi `multiple_choice`, `fill_blank` (input teks ternormalisasi), dan `arrange_code` (pencocokan string kode) bekerja akurat.
9. [ ] Panel umpan balik menampilkan `feedback_correct` saat benar dan `feedback_incorrect` saat salah, sementara balon maskot menampilkan `mascot_dialogue` (≤ 160 karakter).
10. [ ] Maskot menampilkan 4 ekspresi (`idle`, `explain`, `happy`, `sad`) sesuai siklus interaksi soal.
11. [ ] Sistem 5 *Hearts* mengurangi 1 nyawa tiap jawaban salah, memberi tombol *Coba Lagi* saat nyawa > 0, dan memunculkan modal *Game Over* saat nyawa = 0.
12. [ ] Sistem memberikan +10 XP untuk tiap *node* baru dan +0 XP saat mengulang *node* yang telah diklaim sebelumnya.
13. [ ] Sistem memberikan bonus +20 XP (*Perfect Run*) tepat satu kali per level jika level selesai dengan 5 *Hearts* utuh.
14. [ ] Fitur *Session Recovery* memulihkan posisi *node* dan sisa *Hearts* ketika tab/aplikasi ditutup di tengah sesi.
15. [ ] Tombol *Ulangi Level* pada layar *Game Over* mereset nyawa ke 5 dan kembali ke *node* pertama tanpa menghapus total XP lama.
16. [ ] Tampilan *Top HUD* dan *Bottom Bar* tidak terpotong poni/bilah sistem Android pada berkas APK hasil Capacitor, dan pemakaian RAM terjaga < 150 MB.

---

## 11. RISKS & MITIGATION

| Risiko | Dampak | Strategi Mitigasi |
| :--- | :--- | :--- |
| **Keterlambatan Level 1 C# (`CSH_L01`)** | Tinggi | Menjadikan `CSH_L01` prioritas pertama tim Content Absen Besar dan menambahkan pelindung *fallback* pada router agar jalur C# tidak *crash* jika level belum lengkap. |
| **Bengkaknya ukuran bundel aset WebP** | Sedang | Mengunci batas keras ≤ 100 KB per pose maskot dan ≤ 200 KB per latar tema serta memverifikasinya sebelum masuk repositori Git. |
| **Konflik kode (*Merge Conflict*) antar kelompok** | Tinggi | Memisahkan kepemilikan berkas kode per peran (6 Developer) serta memisahkan berkas `web_levels.json` dan `csharp_levels.json`. |
| **Kesalahan sintaks kode pada soal latihan** | Tinggi | Mewajibkan penulisan langsung ke JSON dan menjalankan daftar periksa QA sintaks sebelum penggabungan ke cabang `develop`. |

---

## 12. OUT OF SCOPE (BATASAN LUAR PROYEK)

- Pembuatan *backend server*, REST API, atau basis data daring (MySQL/Firebase/Supabase).
- Autentikasi pengguna (Login, Register, sinkronisasi lintas perangkat).
- *Code compiler/executor* langsung di sisi peladen.
- Papan Peringkat daring (*Global Leaderboard*), sistem pertemanan, dan toko virtual.

---

## 13. RESOLVED PRODUCT DECISIONS (KEPUTUSAN FINAL TERKUNCI)

| No | Parameter Keputusan | Keputusan Final (Baseline v1.6) |
| :--- | :--- | :--- |
| **1** | **Platform & Stack** | Vue 3 + Vite + Tailwind CSS + Vue Router (PWA + Capacitor APK) |
| **2** | **Penyimpanan Data** | Static JSON + `window.localStorage` melalui `storageService.js` |
| **3** | **Navigasi Utama** | 3 Tab Bawah Aktif: `Materi`, `Belajar`, `Profil` (tanpa Leaderboard) |
| **4** | **Struktur Node** | Terpadu: setiap *node* memuat `theory` + `code_example` + 1 soal (`multiple_choice` / `fill_blank` / `arrange_code`) |
| **5** | **Mekanisme `fill_blank`** | Input ketik teks ternormalisasi (`<input type="text">`) sesuai catatan QA Content |
| **6** | **Target Level** | 5 Level kurikulum penuh per jalur; **3 Level pertama (`L01` – `L03`) wajib tuntas MVP** |
| **7** | **Aset Visual** | Maskot WebP Transparan (512 × 512 px, ≤ 100 KB); Latar WebP (≤ 200 KB) |
| **8** | **Tenggat Desain & Code Freeze** | Handoff Desain: **19 November 2026**; Code Freeze & QA: **28 – 30 November 2026**; Rilis: **1 Desember 2026** |

---

## 14. CHANGE LOG & APPROVAL SIGN-OFF

### 14.1 Change Log

| Version | Date | Ringkasan Perubahan | Status |
| :--- | :--- | :--- | :--- |
| **1.0 – 1.4** | Nov 2026 | Perumusan konsep awal, gamifikasi, aturan anti-duplikasi XP, dan spesifikasi aset | Superseded |
| **1.5** | 18 Nov 2026 | Migrasi spesifikasi ke Vue 3 + Vite + Tailwind + PWA/Capacitor dan Static JSON + `localStorage` | Superseded |
| **1.6** | 19 Nov 2026 | Penyelarasan struktur *node* terpadu (Teori + Contoh + Soal), penguncian input teks `fill_blank`, navigasi 3 tab, hirarki 3 level MVP vs 5 level penuh, alur makro/mikro, batas maskot ≤ 100 KB, dan *safe area* Capacitor | Frozen Baseline |

### 14.2 Approval & Sign-Off

| Position | Name | Approval Status | Date |
| :--- | :--- | :--- | :--- |
| **Team Lead Absen Kecil** | ________________________ | Approved / Pending | 19 / 11 / 2026 |
| **Team Lead Absen Besar** | ________________________ | Approved / Pending | 19 / 11 / 2026 |
| **Lead Designer** | ________________________ | Approved / Pending | 19 / 11 / 2026 |
| **Lead Content** | ________________________ | Approved / Pending | 19 / 11 / 2026 |
| **Lead Developer** | ________________________ | Approved / Pending | 19 / 11 / 2026 |

# X1 Ecochain Daily Tasks & Faucet Bot

Otomatisasi interaksi harian, klaim faucet testnet resmi, transfer koin on-chain (Send X1T), penyelesaian quest harian, dan pemburu bonus quest otomatis di jaringan **X1 Ecochain Testnet**.

---

## ✨ Fitur Utama

- **Auto Faucet Request**: Klaim faucet otomatis langsung dari API testnet resmi X1 Ecochain (`https://nft-api.x1eco.com/testnet/faucet`).
- **Cloudflare Rate-Limit Smart Cooldown**: Deteksi otomatis status HTTP 429 (IP Rate Limit ~20s) dengan jeda aman tanpa membuat bot macet atau error.
- **On-chain Transfer (Send X1T)**: Melakukan transaksi kirim koin X1T secara berantai ke akun berikutnya untuk memenuhi syarat quest on-chain.
- **Quest Faucet & Send Auto-Complete**: Menyelesaikan quest harian *Claim Faucet* (`+1 Pt`) dan *Send X1T* (`+1 Pt`).
- **Smart Quest Hunter (Bonus)**: Memindai seluruh quest aktif di API dan otomatis mengklaim quest *one-time* (seperti *Mint .x1eco domain* `+100 Pts`).
- **Antarmuka CLI Presisi 60 Karakter**: Tampilan kartu tertutup monospace (`┌─┐`, `│ │`, `└─┘`) yang rapi, informatif, dan terstruktur.

---

## 📋 Prasyarat

- **Node.js**: Versi 18 atau yang lebih baru.
- Koin testnet X1T pada wallet utama untuk biaya gas on-chain transfer.

---

## 🚀 Panduan Instalasi & Penggunaan

### 1. Clone Repository
```bash
git clone https://github.com/bitsmith826/x1-ecochain-daily.git
cd x1-ecochain-daily
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Private Key
Buat file bernama `datas.txt` di direktori utama, lalu masukkan private key wallet Anda (satu key per baris):
```text
0xYourPrivateKey1...
0xYourPrivateKey2...
```
> ⚠️ **PENTING**: Jangan pernah membagikan atau mengunggah file `datas.txt` ke repositori publik. File ini sudah otomatis diabaikan oleh `.gitignore`.

### 4. Menjalankan Bot
```bash
npm start
```

---

## ⚙️ Ringkasan Modul & Poin

| Modul / Quest | Periode | Hadiah | Deskripsi |
| :--- | :---: | :---: | :--- |
| **Faucet** | Harian | Token Testnet | Request koin via API faucet resmi |
| **Quest Claim Faucet** | Harian | **+1 Point** | Auto-complete quest faucet harian |
| **Send X1T** | Harian | **+1 Point** | On-chain transfer koin testnet |
| **Daily Login** | Harian | Profil Poin | Akumulasi saat sign-in akun |
| **Bonus Hunter** | One-time | Variatif (`+50` - `+100 Pts`) | Klaim task one-time yang belum diambil |

---

## 💡 Edukasi & Penjelasan Status Quest (FAQ)

Berikut adalah informasi penting mengenai cara kerja sistem quest dan status tampilan di terminal bot:

### 1. Mengapa baris `DAILY` berstatus `[ COOLDOWN ] Sudah Selesai`?
- **Penyebab**: Di versi testnet awal, terdapat quest fisik bernama *"Daily Login"* (ID: `691fd172814608a47a30e4a8`). Namun, oleh developer resmi X1 Ecochain, quest tersebut **telah ditiadakan dari daftar endpoint `/quests`**.
- **Cara Kerja Poin**: Poin harian check-in sekarang **otomatis ditambahkan langsung ke profil wallet saat proses autentikasi (sign-in)** ke server X1 Ecochain, bukan melalui tombol klaim quest terpisah.
- **Tampilan Bot**: Karena quest fisiknya sudah tidak ada di API, bot menandai modul ini sebagai `[ COOLDOWN ] Sudah Selesai` untuk mengonfirmasi bahwa login profil harian Anda telah sukses.

---

### 2. Mengapa baris `BONUS` berstatus `[ COOLDOWN ] Sudah Terklaim` meskipun hari sudah reset?
- **Penyebab**: Modul *Bonus Hunter* bertugas mengeklaim quest berkategori **`one_time` (Sekali seumur hidup per wallet, BUKAN quest harian)**.
- **Klaim Permanen**: Quest bonus gratis yang tersedia di API (seperti *Mint .x1eco domain* `+100 Pts`) hanya dapat diklaim **satu kali saja**. Setelah akun Anda sukses mengeklaimnya pertama kali, quest tersebut **tidak akan pernah reset lagi**.
- **Quest Bonus Tersisa**: Sisa quest *one-time* lain yang belum selesai (misalnya *Nomis Score*, *Symbiosis Bridge*, *ZION dApp*, *Coin Flip*, *Wheel Spin*) memerlukan transaksi interaktif di dApp partner masing-masing, sehingga tidak bisa di-klaim otomatis tanpa aktivitas pihak ketiga tersebut.

---

### 3. Kapan waktu Reset Harian (*Daily Reset*) X1 Ecochain?
- Quest harian yang dikerjakan dan di-klaim setiap hari oleh bot ini adalah:
  1. **Klaim Faucet** (`+1 Pt`)
  2. **Send X1T On-chain Transfer** (`+1 Pt`)
- Siklus reset harian server X1 Ecochain mengikuti waktu **UTC (00:00 UTC atau 07:00 WIB)**.
- Begitu Anda menjalankan bot dan kedua quest tersebut sukses diselesaikan pada hari itu, status di server menjadi `is_completed_today: true`. Jika bot dijalankan kembali di hari yang sama, bot akan otomatis mendeteksi status `[ COOLDOWN ]` agar tidak membuang gas fee on-chain secara sia-sia.

---

### 4. Mengapa ada jeda waktu (Rate Limit) saat klaim Faucet?
- Server faucet resmi X1 Ecochain (`nft-api.x1eco.com`) dilindungi oleh sistem Cloudflare dengan batas frekuensi (**IP Rate Limit ~20 detik per IP**).
- Bot ini dilengkapi fitur cerdas **Smart Auto-Cooldown**: saat mendeteksi respon `HTTP 429 (Rate Limit)`, bot akan menunggu jeda cooldown secara aman di balik layar tanpa menimbulkan error/crash, lalu melanjutkan proses klaim hingga berhasil.

---

## 📄 Lisensi
ISC License.

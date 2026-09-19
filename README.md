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

## 📄 Lisensi
ISC License.

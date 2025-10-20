# Panduan Deployment Kontrak Forter

Dokumen ini menjelaskan cara melakukan deployment smart contract Forter ke jaringan testnet Base Sepolia.

## ⚡️ Cara Cepat (Rekomendasi)

Proses deployment dibuat sesederhana mungkin. Cukup ikuti 3 langkah berikut:

### Langkah 1: Siapkan File Environment

Salin file contoh `.env.example` menjadi file baru bernama `.env`.

```bash
cp .env.example .env
```

### Langkah 2: Isi Variabel Environment

Buka file `.env` yang baru Anda buat dengan editor teks, lalu isi nilainya:

1.  `PRIVATE_KEY`: Private key dari wallet yang akan Anda gunakan untuk deployment. **JAGA KERAHASIAANNYA.**
2.  `BASESCAN_API_KEY`: API Key dari [Basescan](https://basescan.org/myapikey) yang diperlukan untuk verifikasi kontrak otomatis.

### Langkah 3: Jalankan Skrip Deployment

Jalankan skrip `COMMANDS.sh`. Skrip ini akan mengurus semuanya: kompilasi, deployment, dan verifikasi.

```bash
# Berikan izin eksekusi pada skrip (hanya perlu dilakukan sekali)
chmod +x COMMANDS.sh

# Jalankan skrip
./COMMANDS.sh
```

Skrip akan mendeploy kontrak Anda ke Base Sepolia. Setelah selesai, skrip akan menampilkan **satu perintah manual** yang harus Anda jalankan untuk menyelesaikan setup. Cukup salin dan jalankan perintah tersebut.

---

## ❓ Informasi Tambahan

### Prasyarat

-   **Foundry**: Pastikan Anda sudah menginstal Foundry. Jika belum, ikuti [panduan instalasi resmi](https://book.getfoundry.sh/getting-started/installation).

### Jaringan

-   **Base Sepolia (Testnet)**
    -   **Chain ID**: `84532`
    -   **RPC URL**: `https://sepolia.base.org`
    -   **Explorer**: `https://sepolia.basescan.org`
    -   **Faucet (untuk mendapatkan ETH gratis)**: `https://www.coinbase.com/faucets/base-sepolia-faucet`

### Tentang Skrip Deployment

-   `script/Deploy.s.sol`: Ini adalah skrip utama yang ditulis dalam Solidity untuk menangani logika deployment.
-   `COMMANDS.sh`: Skrip shell pembantu yang menyederhanakan eksekusi `Deploy.s.sol` dengan parameter yang benar untuk Base Sepolia.
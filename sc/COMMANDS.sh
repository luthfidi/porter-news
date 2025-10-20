#!/bin/bash

# ==============================================================================
# == Forter Smart Contract - DEPLOY TO BASE SEPOLIA (TESTNET) ==
# ==============================================================================
#
# File ini akan menjalankan seluruh proses deployment ke testnet Base Sepolia.
#
# LANGKAH:
# 1. Pastikan Anda sudah menyalin `.env.example` ke `.env`.
# 2. Pastikan Anda sudah mengisi `PRIVATE_KEY` dan `BASESCAN_API_KEY` di `.env`.
# 3. Jalankan skrip ini dari direktori 'sc': ./COMMANDS.sh
#
# APA YANG SKRIP INI LAKUKAN:
# 1. Membaca variabel dari file `.env`.
# 2. Menjalankan `forge build` untuk mengkompilasi kontrak.
# 3. Menjalankan `forge script` untuk deploy ke Base Sepolia.
#    - `--broadcast`: Mengirimkan transaksi ke jaringan.
#    - `--verify`: Memverifikasi kontrak di Basescan secara otomatis.
# 4. Memberikan instruksi untuk langkah manual pasca-deployment.
#
# ==============================================================================

# Warna untuk output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Mempersiapkan deployment ke Base Sepolia...${NC}"

# 1. Cek apakah file .env ada
if [ ! -f .env ]; then
    echo -e "${RED}Error: File .env tidak ditemukan!${NC}"
    echo -e "Silakan salin dari .env.example dan isi nilainya."
    exit 1
fi

# 2. Muat environment variables dari .env
source .env

# 3. Cek apakah variabel yang dibutuhkan ada isinya
if [ -z "$PRIVATE_KEY" ] || [ -z "$BASE_SEPOLIA_RPC_URL" ] || [ -z "$BASESCAN_API_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY, BASE_SEPOLIA_RPC_URL, atau BASESCAN_API_KEY kosong di file .env.${NC}"
    echo -e "Silakan isi semua variabel yang dibutuhkan."
    exit 1
fi

echo -e "${YELLOW}✓ Konfigurasi .env ditemukan.${NC}"
echo -e "${YELLOW}Mulai proses build & deploy...${NC}"
echo ""

# 4. Jalankan deployment script dan tangkap outputnya
output=$(forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv)

exit_code=$?
echo "$output"

# Cek exit code dari command sebelumnya
if [ $exit_code -eq 0 ]; then
    echo -e "\n${GREEN}🎉 DEPLOYMENT SELESAI! 🎉${NC}"
    echo -e "Kontrak Anda seharusnya sudah live di Base Sepolia dan terverifikasi di Basescan."

    # Ekstrak alamat dari output log
    forter_address=$(echo "$output" | grep 'Forter deployed at:' | awk '{print $4}')
    reputation_nft_address=$(echo "$output" | grep 'ReputationNFT deployed at:' | awk '{print $4}')

    if [ -z "$forter_address" ] || [ -z "$reputation_nft_address" ]; then
        echo -e "\n${YELLOW}PERINGATAN: Tidak dapat menemukan alamat kontrak dari output deployment.${NC}"
        echo -e "Anda harus menjalankan langkah pasca-deployment secara manual."
    else
        echo -e "\n${YELLOW}===============================================================${NC}"
        echo -e "${YELLOW}🔴 PENTING: SATU LANGKAH MANUAL DIBUTUHKAN! 🔴${NC}"
        echo -e "${YELLOW}===============================================================${NC}"
        echo -e "Kontrak 'Forter' membutuhkan izin untuk mengelola 'ReputationNFT'."
        echo -e "Jalankan perintah berikut untuk memberikan izin tersebut:"
        echo -e "\n${GREEN}cast send ${reputation_nft_address} \"
        echo -e \
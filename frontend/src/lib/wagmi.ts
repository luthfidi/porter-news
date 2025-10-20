import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// Custom Base Sepolia chain
const customBaseSepolia = defineChain({
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://sepolia.basescan.org",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1059647,
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: "Forter - Forecast Porter",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || "YOUR_PROJECT_ID",
  chains: [customBaseSepolia],
  ssr: true,
});

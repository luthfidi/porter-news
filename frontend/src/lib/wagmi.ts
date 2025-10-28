import { createConfig, http, fallback } from 'wagmi';
import { defineChain } from 'viem';
import { createPublicClient } from 'viem';

// Define Monad testnet chain
const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});

// Multiple RPC endpoints for reliability
const monadRPCs = [
  "https://testnet-rpc.monad.xyz",
  "https://rpc.testnet.monad.xyz",
];

export const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: fallback(
      monadRPCs.map((url) => http(url, {
        timeout: 10_000, // 10 seconds
        retryCount: 3,
        retryDelay: 1000, // 1 second
      }))
    ),
  },
  ssr: false,
});

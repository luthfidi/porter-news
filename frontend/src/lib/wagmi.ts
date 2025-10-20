import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { defineChain } from 'viem'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

// Define Monad Devnet chain
const monad = defineChain({
  id: 41455,
  name: 'Monad Devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON'
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.monad.xyz']
    }
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com'
    }
  },
  testnet: true,
})

// Only create connectors on client-side
function getConnectors() {
  if (typeof window === 'undefined') {
    return []
  }

  return [
    injected(),
    coinbaseWallet({
      appName: 'Porter News',
      preference: 'smartWalletOnly',
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || 'YOUR_PROJECT_ID',
    }),
  ]
}

export const config = createConfig({
  chains: [monad],
  connectors: getConnectors(),
  // Use cookie storage for SSR compatibility
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : cookieStorage,
  }),
  ssr: true,
  transports: {
    [monad.id]: http(),
  },
})

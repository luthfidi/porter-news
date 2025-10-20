import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

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
  chains: [baseSepolia],
  connectors: getConnectors(),
  // Use cookie storage for SSR compatibility
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : cookieStorage,
  }),
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
})

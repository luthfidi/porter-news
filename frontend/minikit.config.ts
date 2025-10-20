const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "https://forter.app";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    allowedAddresses: [""],
  },
  miniapp: {
    version: "1",
    name: "Forter - Forecast Porter",
    subtitle: "Stake on Credibility, Not Luck",
    description:
      "Permissionless information finance protocol. Create predictions, analyze with reasoning, and build on-chain reputation through verifiable insights.",
    screenshotUrls: [
      `${ROOT_URL}/screenshots/news-browse.png`,
      `${ROOT_URL}/screenshots/pool-creation.png`,
      `${ROOT_URL}/screenshots/staking-interface.png`,
    ],
    iconUrl: `${ROOT_URL}/icon-192.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0f0f0f",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "defi",
    tags: [
      "information",
      "finance",
      "prediction",
      "reputation",
      "farcaster",
      "base",
    ],
    heroImageUrl: `${ROOT_URL}/hero-image.png`,
    tagline: "Transform credibility into yield",
    ogTitle: "Forter - Forecast Porter",
    ogDescription:
      "Stake on credibility, not luck. Build on-chain reputation through verifiable analysis and earn from accurate insights.",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
    noindex: false,
  },
} as const;

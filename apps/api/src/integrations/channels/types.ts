export const OAUTH_PROVIDERS = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK_SHOP",
  "WOOCOMMERCE",
  "SHOPIFY",
] as const;

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export interface ChannelAccount {
  id: string;
  name: string;
}

export interface PendingCredentials {
  state: "PENDING_SELECTION";
  accounts: Array<ChannelAccount & Record<string, unknown>>;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  providerData?: Record<string, unknown>;
}

export interface FinalCredentials {
  state: "CONNECTED";
  account: ChannelAccount & Record<string, unknown>;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  grantedScopes?: string[];
  providerData?: Record<string, unknown>;
}

export function isOAuthProvider(value: string): value is OAuthProvider {
  return OAUTH_PROVIDERS.includes(value as OAuthProvider);
}

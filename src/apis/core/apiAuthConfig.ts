interface ApiAuthConfig {
  getAccessToken: () => string | null;
  onAccessTokenRefreshed: (accessToken: string) => void;
  onRefreshFailed: () => void;
}

const defaultConfig: ApiAuthConfig = {
  getAccessToken: () => null,
  onAccessTokenRefreshed: () => undefined,
  onRefreshFailed: () => undefined,
};

let apiAuthConfig: ApiAuthConfig = defaultConfig;

export function configureApiAuth(config: Partial<ApiAuthConfig>): void {
  apiAuthConfig = {
    ...apiAuthConfig,
    ...config,
  };
}

export function getConfiguredAccessToken(): string | null {
  return apiAuthConfig.getAccessToken();
}

export function notifyAccessTokenRefreshed(accessToken: string): void {
  apiAuthConfig.onAccessTokenRefreshed(accessToken);
}

export function notifyRefreshFailed(): void {
  apiAuthConfig.onRefreshFailed();
}

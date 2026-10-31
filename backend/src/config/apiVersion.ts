// API Version Configuration & Strategy
// This module provides a comprehensive versioning strategy for the FinAnalysis API

export interface ApiVersion {
  version: string;
  prefix: string;
  releaseDate: string;
  deprecated?: boolean;
  deprecationDate?: string;
  sunsetDate?: string;
  supportedUntil?: string;
  changelog?: string[];
}

export const apiVersions: Record<string, ApiVersion> = {
  v1: {
    version: '1.0.0',
    prefix: '/api/v1',
    releaseDate: '2026-01-15',
    deprecated: false,
    supportedUntil: '2028-01-15',
    changelog: [
      'Initial API release',
      'Authentication: JWT + Google OAuth + OTP',
      'Portfolio management: upload, scoring, analysis',
      'Assessment: 5-step risk profiling',
      'Lead management: booking, sessions',
      'Admin: users, folios, clients',
      'Chat: AI-powered financial assistant',
    ],
  },
  // Future versions would be added here
  // v2: {
  //   version: '2.0.0',
  //   prefix: '/api/v2',
  //   releaseDate: '2027-01-15',
  //   deprecated: false,
  //   supportedUntil: '2029-01-15',
  //   changelog: [
  //     'Breaking: New authentication flow with passkeys',
  //     'New: Real-time portfolio sync via WebSocket',
  //     'Enhanced: Multi-currency support',
  //   ],
  // },
};

export const apiVersionConfig = {
  defaultVersion: 'v1' as const,
  supportedVersions: ['v1'] as const,
  deprecatedVersions: [] as const,
  headerName: 'api-version' as const,
  queryParamName: 'v' as const,
  defaultPrefix: '/api/v1' as const,
};

export function getApiPrefix(versionParam?: string): string {
  const version = versionParam || apiVersionConfig.defaultVersion;
  const config = apiVersions[version];
  if (!config) {
    return apiVersionConfig.defaultPrefix;
  }
  return config.prefix;
}

export function isVersionSupported(version: string): boolean {
  return (apiVersionConfig.supportedVersions as readonly string[]).includes(version);
}

export function isVersionDeprecated(version: string): boolean {
  const config = apiVersions[version];
  return config?.deprecated ?? false;
}

export function getVersionInfo(version: string): ApiVersion | null {
  return apiVersions[version] ?? null;
}

export function negotiateVersion(
  requestedVersion?: string,
  acceptHeader?: string
): string {
  // Priority: explicit param > Accept header > default
  if (requestedVersion && isVersionSupported(requestedVersion)) {
    return requestedVersion;
  }

  // Parse Accept header for version (e.g., "application/vnd.finanalysis.v1+json")
  if (acceptHeader) {
    const match = acceptHeader.match(/application\/vnd\.finanalysis\.v(\d+)\+json/);
    if (match && isVersionSupported(`v${match[1]}`)) {
      return `v${match[1]}`;
    }
  }

  return apiVersionConfig.defaultVersion;
}

export function getDeprecationHeaders(version: string): Record<string, string> {
  const config = apiVersions[version];
  if (!config || !config.deprecated) return {};

  const headers: Record<string, string> = {
    'Deprecation': 'true',
  };

  if (config.deprecationDate) {
    headers['Deprecation-Date'] = config.deprecationDate;
  }
  if (config.sunsetDate) {
    headers['Sunset'] = config.sunsetDate;
  }
  if (config.supportedUntil) {
    headers['Link'] = `<${getApiPrefix('v1')}>; rel="successor-version"`;
  }

  return headers;
}

export function createVersionedRouter() {
  // This would be used in Express to mount versioned routes
  // Example: app.use('/api/v1', v1Router);
  //          app.use('/api/v2', v2Router);
  return apiVersionConfig;
}

// Version negotiation middleware for Express
export function versionNegotiationMiddleware(
  req: any,
  res: any,
  next: any
) {
  const requestedVersion = req.query[apiVersionConfig.queryParamName] as string;
  const acceptHeader = req.headers.accept;

  const negotiatedVersion = negotiateVersion(requestedVersion, acceptHeader);

  req.apiVersion = negotiatedVersion;
  req.apiPrefix = getApiPrefix(negotiatedVersion);

  // Add deprecation headers if needed
  const deprecationHeaders = getDeprecationHeaders(negotiatedVersion);
  Object.entries(deprecationHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Add version info to response headers
  res.setHeader('X-API-Version', negotiatedVersion);
  res.setHeader('X-API-Prefix', getApiPrefix(negotiatedVersion));

  next();
}
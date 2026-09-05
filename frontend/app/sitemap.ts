import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://finanalysis.site';

  const routes = [
    '',
    '/quiz',
    '/onboarding',
    '/emi-calculator',
    '/fd-calculator',
    '/loan-calculator',
    '/lumpsum-calculator',
    '/rd-calculator',
    '/sif-calculator',
    '/sip-calculator',
    '/step-up-sip-calculator',
    '/swp-calculator',
    '/inflation-calculator',
    '/privacy',
    '/terms',
    '/cookies',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1.0 : route === '/quiz' ? 0.8 : 0.5,
  }));
}

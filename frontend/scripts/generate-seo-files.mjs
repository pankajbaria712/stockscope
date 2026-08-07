import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const siteUrl = process.env.VITE_SITE_URL || 'https://www.stockscope.app';

const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/search',
];

const companyRoutes = [
  '/company/AAPL',
  '/company/MSFT',
  '/company/TSLA',
  '/company/GOOGL',
  '/company/AMZN',
];

const currentDate = new Date().toISOString();

const robotsContent = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /private/\nDisallow: /admin/\nDisallow: /login\nDisallow: /register\nDisallow: /watchlist\nDisallow: /profile\nSitemap: ${siteUrl}/sitemap.xml\n`;

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...publicRoutes, ...companyRoutes]
  .map((route) => {
    const isCompanyRoute = route.startsWith('/company/');
    return `  <url>\n    <loc>${siteUrl}${route}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>${isCompanyRoute ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${isCompanyRoute ? '0.8' : '0.7'}</priority>\n  </url>`;
  })
  .join('\n')}\n</urlset>\n`;

const manifestContent = {
  name: 'StockScope',
  short_name: 'StockScope',
  description: 'StockScope helps investors research stocks, monitor markets, and discover companies with live insights.',
  start_url: '/',
  display: 'standalone',
  background_color: '#0f172a',
  theme_color: '#0f172a',
  orientation: 'portrait',
  icons: [
    { src: '/favicon.png', sizes: '16x16', type: 'image/png' },
    { src: '/favicon.png', sizes: '32x32', type: 'image/png' },
    { src: '/logo.png', sizes: '180x180', type: 'image/png', purpose: 'apple-touch-icon' },
    { src: '/logo.png', sizes: '192x192', type: 'image/png' },
    { src: '/logo.png', sizes: '512x512', type: 'image/png' },
  ],
};

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf8');
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent, 'utf8');
fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifestContent, null, 2), 'utf8');

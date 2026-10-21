import type { APIRoute } from 'astro';

/**
 * robots.txt is generated at build time.
 * Until PUBLIC_ALLOW_INDEXING=true is set for the verified production build,
 * all crawling is disallowed so previews and unfinished deployments stay out of search results.
 */
export const GET: APIRoute = ({ site }) => {
  const allow = import.meta.env.PUBLIC_ALLOW_INDEXING === 'true';
  const body = allow
    ? ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${new URL('sitemap-index.xml', site).href}`, ''].join('\n')
    : ['# Indexing is disabled for this build (PUBLIC_ALLOW_INDEXING is not "true").', 'User-agent: *', 'Disallow: /', ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

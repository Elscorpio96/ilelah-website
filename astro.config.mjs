// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * The single canonical site URL. Every canonical link, Open Graph URL and
 * sitemap entry is built from this value. Override it per environment with
 * the PUBLIC_SITE_URL variable (see docs/ENVIRONMENT_SETUP.md).
 */
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://www.ilelahtech.com').replace(/\/$/, '');

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  devToolbar: { enabled: false },
});

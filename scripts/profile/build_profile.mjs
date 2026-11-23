// Renders scripts/profile/company-profile.html to public/downloads/ilelah-technologies-company-profile.pdf
// Usage: npm run profile   (uses Playwright's Chromium; set PW_CHROMIUM_PATH if needed)
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = pathToFileURL(path.join(here, 'company-profile.html')).href;
const outDir = path.join(here, '../../public/downloads');
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.goto(src, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: path.join(outDir, 'ilelah-technologies-company-profile.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('Wrote public/downloads/ilelah-technologies-company-profile.pdf');

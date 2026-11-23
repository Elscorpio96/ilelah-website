# Ilelah Technologies brand guide

## The logo

The official logo was supplied by Ilelah Technologies: a slanted navy **I** with a gold sweep that forms an **L**, above the "Ilelah" wordmark, "Technologies" and the tagline. The original file is kept in `scripts/brand/source/ilelah-logo-source.png`. Every web and print version below is cut from that file by `scripts/brand/build_brand.py`. Nothing has been redrawn.

The circular **company seal** (`ilelah-seal.png`) is for stamps, letters and certificates only. Do not use it on the website, and do not use it anywhere with the "RC" line blank. Add the RC number once CAC registration is complete.

The logo is deliberately different from the **Ilelah Business Suite** "IS" product icon. Products may have their own icons, but company materials use the Ilelah Technologies logo.

## Logo files

All in `public/brand/`, and published on the website at `/brand/…`.

| File | Use |
| --- | --- |
| `ilelah-logo-full.png` | **Primary logo** (symbol, name and tagline): documents, presentations, banners, signage |
| `ilelah-logo-full-reverse.png` | The same, for navy or dark backgrounds |
| `ilelah-logo-stacked.png` | Symbol and name without the tagline: square spaces, T-shirt fronts |
| `ilelah-logo-horizontal.png` | Symbol beside the name: letterheads, email, wide spaces |
| `ilelah-logo-horizontal-reverse.png` | Horizontal, for dark backgrounds |
| `ilelah-logo-horizontal-web.png` / `-reverse-web.png` | Small, compressed versions used in the website header and footer |
| `ilelah-mark-1024.png` | **Symbol only:** social media profile pictures, app icons, ID card corners |
| `ilelah-mark-reverse-1024.png` | Symbol for dark backgrounds |
| `ilelah-seal.png` | Company seal (documents only, see above) |
| `/favicon.ico`, `/icon-192.png`, `/icon-512.png`, `/apple-touch-icon.png` | Browser and phone icons (symbol on white) |
| `/og-default.png` | Social sharing image (1200 × 630) |

**For printers and embroiderers:** these are high-resolution PNG files, suitable for screens and ordinary print. For large signage, vehicle branding or embroidery, ask the logo's designer for the **vector original** (SVG, AI, EPS or PDF). If it is not available, have the logo professionally redrawn as a vector once, and keep that file safe.

### Usage rules

- Keep clear space around the logo of at least the height of the "e" in "Ilelah" on every side
- Minimum size: horizontal logo **32 px** tall on screen or **10 mm** in print; symbol alone **16 px** or **5 mm**
- Do not stretch, rotate, recolour, add shadows or outlines, or place the logo on busy photos
- Do not retype the name in another font. Always use the supplied files.
- On dark backgrounds, use the reverse versions (white with gold)

### Regenerating the files

If the logo source changes, replace `scripts/brand/source/ilelah-logo-source.png` (keep a transparent background), then run:

```powershell
pip install pillow
npm run brand
```

## Colour

Navy and gold are sampled from the official logo.

| Name | Hex | Use | Contrast |
| --- | --- | --- | --- |
| **Navy** | `#00143C` | Primary brand colour: headings, buttons, links | 18.0:1 on white |
| Navy hover | `#0A2554` | Button hover | |
| Navy deep | `#000C26` | Footer and dark bands | |
| **Gold** | `#C8922A` | Accent only: thin rules, markers, highlights. Gold text only on navy (6.5:1). | 2.8:1 on white, so **never gold text on white** |
| Gold ink | `#7A5306` | When a gold-family text colour is needed on white | 6.9:1 |
| Ink | `#12161C` | Body text | 18.2:1 |
| Ink soft | `#4A5363` | Secondary text | 7.8:1 |
| Mist | `#F4F6F9` | Quiet section backgrounds | |
| Line | `#DFE3EA` | Borders and dividers | |
| White | `#FFFFFF` | Main background | |

Roughly: **white 70%, navy 20%, gold 5%, everything else 5%.** Gold is precious. If it is everywhere, it stops meaning anything.

Print equivalents are approximate. Ask your printer to match the hex values, or request a proof:

- Navy ≈ CMYK 100 / 80 / 30 / 60
- Gold ≈ CMYK 15 / 40 / 90 / 5

## Typography

**Schibsted Grotesk** for website text: headings at weight 700–760, body text at 400, labels and buttons at about 620–640. It is a free, open-licence typeface (SIL Open Font License), available from Google Fonts for Word, Canva and print work.

- Headings: sentence case ("How we work", not "How We Work"), tight letter spacing
- Body: 17 px on screen, line length under about 70 characters
- Avoid ALL-CAPS labels and decorative fonts
- Fallback when Schibsted Grotesk is not available: Arial
- The logo's own lettering is part of the artwork; never retype it

## Voice

- Plain, specific and honest. Say what something does, not how innovative it is.
- Write for the customer's problem: "Results are late every term" beats "Next-generation assessment".
- Sentence case for headings and buttons. Buttons say exactly what happens: "Send quote request", "Request a demo".
- Never claim clients, numbers, awards or certifications that are not verified.

## Applications

| Item | Guidance |
| --- | --- |
| **Business cards** (85 × 55 mm) | Front: full or horizontal logo on white, or a reverse version on navy. Back: name, role, phone, email, website. A small gold rule (about 12 × 1 mm) under the name is the only gold needed. |
| **Letterhead** | `docs/brand-templates/letterhead.html`. Open in Chrome or Edge and print to PDF. Once the company is registered, add the registered name and number to the footer if the law requires it. |
| **Email signature** | `docs/brand-templates/email-signature.html` |
| **Staff ID cards** | Navy band across the top with the reverse horizontal logo; photo and name on white; a thin gold rule under the name |
| **Branded clothing** | Symbol or stacked logo on the chest: full colour on white or light garments, reverse version on navy. Use a vector original for embroidery. |
| **Social media** | Profile picture: `ilelah-mark-1024.png`. Posts: white or navy backgrounds, one gold accent. |
| **App icons** | `icon-512.png` / `ilelah-mark-1024.png` for company tools. Products such as Business Suite keep their own icon. |

## Design tokens on the website

All colours, sizes and spacing live in `src/styles/tokens.css`. Change a value there and the whole site follows. If the logo colours ever change, update the navy and gold tokens to match.

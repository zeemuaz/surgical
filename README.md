# AUREN Instruments — White-Label Surgical & Dental Manufacturer Platform

A production-ready, white-label B2B website foundation for surgical and dental instrument manufacturers (demonstrated with **AUREN Instruments**, Sialkot, Pakistan).

> **Demonstration Notice:** `AUREN Instruments`, sample unit prices (`DEMO`), contact placeholders, and studio demonstration photography are clearly marked as demonstration content and must be replaced with verified manufacturer assets before commercial launch.

---

## Quick Start

```bash
npm install
npm run dev
```

The Express + Vite application runs on **http://localhost:3000**.

### Build, Typecheck & Tests

```bash
npm run lint    # TypeScript strict check (tsc --noEmit)
npm test        # Unit tests via node:test (catalog filtering, pricing, RFQ & validation)
npm run build   # Vite production bundle
```

---

## Project Structure

```text
server.ts                        # Express backend: RFQ/contact APIs, rate limiting, sitemap.xml, robots.txt
src/
  config/site.ts                 # Single source of truth for brand, contact, currencies, OEM, SEO & media
  types/catalog.ts               # Strongly typed domain models
  data/
    categories.ts                # Curated instrument disciplines
    products.ts                  # Product catalog with unique SKUs, variations & pricing modes
    catalogs.ts                  # Downloadable PDF library (empty until verified PDFs are added)
    manufacturing.ts             # Configurable production stages
  lib/
    catalog-utils.ts             # Pure filtering, sorting, pagination, pricing, CSV export & import validator
    inquiry-validation.ts        # Shared Zod schemas (client + server) and safe URL / WhatsApp helpers
    seo.ts                       # Page-level title, meta, Open Graph, canonical & JSON-LD hook
  context/QuoteContext.tsx       # Persistent RFQ quotation list & currency state (localStorage)
  components/                    # Header, Footer, Layout, ProductCard, StudioImage, CurrencySwitcher, etc.
  pages/                         # All 11 routes + 404 page
```

---

## Client Customization Guide

### 1. Brand, Contact, Currencies & Certifications (`src/config/site.ts`)
- Update `brand.wordmark`, `brand.fullName`, `brand.descriptor`, `brand.location`, and set `brand.isDemoBrand = false`.
- Set `brand.foundingYear` to a verified year (e.g. `1994`) to display founding history on `/about`, or leave `null` to hide it.
- Update `contact.email`, `contact.phone`, `contact.whatsappNumber` (digits with country code, e.g. `"923001234567"`), `contact.streetAddress`, and `contact.mapUrl` (verified `https://` URL), and set `contact.isDemoContact = false`.
- Add verified certificates to `certifications[]` only when real certificate numbers and issuers are available.
- Set `pricing.showSamplePrices` to `false` if the manufacturer operates strictly on a `Request pricing` model, or replace prices and set `pricing.isDemoPricing = false`.

### 2. Adding Products, SKUs, Variants & Images (`src/data/products.ts` & `src/data/categories.ts`)
- Place real studio instrument photos in `public/images/products/` (recommended 4:3 aspect ratio on `#F4F6F7` cool-neutral background, WebP/JPG).
- Update `src/data/categories.ts` and `src/data/products.ts` with verified SKUs, dimensions, steel grades, finishes, and prices (`price: null` renders `Request pricing`; differing variant prices automatically render `From <price>`).
- Run `npm test` to verify SKU uniqueness across all products and variants.

### 3. Validating Bulk CSV / JSON Catalog Imports
The server provides a dry-run validation endpoint (`POST /api/catalog/validate-import`) powered by `src/lib/catalog-utils.ts`:

- **Required CSV columns**:
  `sku,slug,name,categorySlug,shortSpec,summary,material,finish,lengthLabel,priceUsd,pricePkr,featured`
- Rejects duplicate SKUs, duplicate slugs, invalid category slugs, or malformed numeric prices.

### 4. Publishing Real PDF Catalogs (`src/data/catalogs.ts`)
1. Add verified PDF files to `public/catalogs/` (e.g., `public/catalogs/general-surgery-2026.pdf`).
2. Add matching entries in `src/data/catalogs.ts` with `title`, `discipline`, `fileSize`, and `pdfUrl`.
3. Add individual product specification sheets in `public/specs/` and set `specPdfUrl` on matching products.

### 5. Configuring Live Email Delivery for RFQs & Inquiries
Copy `.env.example` to `.env` (never commit real secrets) and set:

```env
APP_URL="https://your-domain.com"
RESEND_API_KEY="re_..."
INQUIRY_RECIPIENT_EMAIL="sales@your-company.com"
INQUIRY_FROM_EMAIL="inquiries@your-domain.com"
```

When `RESEND_API_KEY` or `INQUIRY_RECIPIENT_EMAIL` is unset, `POST /api/inquiries/quote` and `POST /api/inquiries/contact` validate inputs, enforce rate limiting and honeypot spam checks, and return an honest `development_preview` confirmation rather than claiming an email was sent.

---

## Deployment

```bash
npm run build
NODE_ENV=production npm start
```

Serves the compiled static bundle from `dist/`, Express `/api/*` endpoints, `/sitemap.xml`, and `/robots.txt` on `PORT` (default `3000`).

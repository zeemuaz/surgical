import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { categories } from './src/data/categories.ts';
import { products } from './src/data/products.ts';
import {
  parseAndValidateCatalogCsv,
  validateCatalogImportRows,
} from './src/lib/catalog-import.ts';
import {
  contactInquirySchema,
  quoteInquirySchema,
} from './src/lib/inquiry-validation.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

// Simple in-memory sliding-window rate limiter per IP (10 requests / 15 min)
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 10;
const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  // Prune stale buckets occasionally so long-running processes never leak memory
  if (rateBuckets.size > 500) {
    for (const [key, times] of rateBuckets.entries()) {
      const fresh = times.filter((t) => now - t < RATE_WINDOW_MS);
      if (fresh.length === 0) rateBuckets.delete(key);
      else rateBuckets.set(key, fresh);
    }
  }
  const timestamps = (rateBuckets.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (timestamps.length >= RATE_MAX_REQUESTS) {
    rateBuckets.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateBuckets.set(ip, timestamps);
  return false;
}

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function createReferenceId(prefix: 'RFQ' | 'INQ'): string {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${datePart}-${random}`;
}

interface EmailDispatchResult {
  deliveredByEmail: boolean;
  provider: 'resend' | 'development_preview';
  detail: string;
}

async function dispatchInquiryEmail(
  subject: string,
  textBody: string,
  replyTo: string,
): Promise<EmailDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipient = process.env.INQUIRY_RECIPIENT_EMAIL?.trim();
  const fromEmail =
    process.env.INQUIRY_FROM_EMAIL?.trim() || 'inquiries@auren-instruments.local';

  if (!apiKey || !recipient) {
    return {
      deliveredByEmail: false,
      provider: 'development_preview',
      detail:
        'Email delivery credentials (RESEND_API_KEY and INQUIRY_RECIPIENT_EMAIL) are not configured on this server. Your request was validated and logged as a local development preview.',
    };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [recipient],
      reply_to: replyTo,
      subject,
      text: textBody,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Upstream email provider returned HTTP ${response.status}.`);
  }

  return {
    deliveredByEmail: true,
    provider: 'resend',
    detail: 'Your inquiry has been transmitted to our export quotation desk.',
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveSiteBaseUrl(req: express.Request): string {
  const configured = process.env.APP_URL?.trim();
  if (configured && configured !== 'MY_APP_URL' && /^https?:\/\//.test(configured)) {
    return configured.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

async function createServer(): Promise<void> {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // Cache optimized studio imagery cleanly in both dev and prod
  app.use('/src/assets/images', (_req, res, next) => {
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800',
    );
    next();
  });

  // Never cache private quotation or customer contact submissions
  app.use('/api/inquiries', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, private');
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true });
  });

  // Public read-only catalog summary endpoint with safe HTTP caching
  app.get('/api/catalog', (_req, res) => {
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600',
    );
    res.json({
      categoriesCount: categories.length,
      productsCount: products.length,
      categories,
      products,
    });
  });

  app.post('/api/inquiries/quote', async (req, res) => {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      res.status(429).json({
        ok: false,
        error: 'Too many quotation requests from this address. Please wait a few minutes and try again.',
      });
      return;
    }

    const parsed = quoteInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || 'form');
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      res.status(400).json({
        ok: false,
        error: 'Please review the highlighted fields before submitting.',
        fieldErrors,
      });
      return;
    }

    const data = parsed.data;
    const referenceId = createReferenceId('RFQ');
    const receivedAt = new Date().toISOString();

    const itemLines = data.items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ''} — SKU: ${item.sku} — Qty: ${item.quantity}`,
      )
      .join('\n');

    const textBody = [
      `Quotation Request Reference: ${referenceId}`,
      `Received: ${receivedAt}`,
      `Contact: ${data.name} (${data.email})`,
      `Company: ${data.company}`,
      `Country: ${data.country}`,
      `Phone / WhatsApp: ${data.phone}`,
      `Preferred Currency: ${data.currency}`,
      '',
      'Requested Instruments:',
      itemLines,
      '',
      `Additional Notes: ${data.message || 'None provided'}`,
    ].join('\n');

    try {
      const delivery = await dispatchInquiryEmail(
        `[${referenceId}] Quotation Request from ${data.company}`,
        textBody,
        data.email,
      );

      res.status(200).json({
        ok: true,
        referenceId,
        receivedAt,
        deliveredByEmail: delivery.deliveredByEmail,
        mode: delivery.provider,
        message: delivery.detail,
        itemCount: data.items.length,
        totalUnits: data.items.reduce((acc, item) => acc + item.quantity, 0),
        previewPayload: delivery.deliveredByEmail
          ? undefined
          : {
              contact: `${data.name} <${data.email}>`,
              company: data.company,
              country: data.country,
              currency: data.currency,
              items: data.items,
            },
      });
    } catch {
      res.status(502).json({
        ok: false,
        error:
          'Unable to transmit the quotation email via the configured provider. Please retry or use direct email.',
      });
    }
  });

  app.post('/api/inquiries/contact', async (req, res) => {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      res.status(429).json({
        ok: false,
        error: 'Too many inquiry requests from this address. Please wait a few minutes and try again.',
      });
      return;
    }

    const parsed = contactInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || 'form');
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      res.status(400).json({
        ok: false,
        error: 'Please check the required fields and try again.',
        fieldErrors,
      });
      return;
    }

    const data = parsed.data;
    const referenceId = createReferenceId('INQ');
    const receivedAt = new Date().toISOString();

    const textBody = [
      `General Inquiry Reference: ${referenceId}`,
      `Received: ${receivedAt}`,
      `Name: ${data.name}`,
      `Business Email: ${data.email}`,
      `Company: ${data.company}`,
      `Country: ${data.country}`,
      `Product Interest: ${data.productInterest}`,
      '',
      'Message:',
      data.message,
    ].join('\n');

    try {
      const delivery = await dispatchInquiryEmail(
        `[${referenceId}] General Inquiry — ${data.productInterest}`,
        textBody,
        data.email,
      );

      res.status(200).json({
        ok: true,
        referenceId,
        receivedAt,
        deliveredByEmail: delivery.deliveredByEmail,
        mode: delivery.provider,
        message: delivery.detail,
        previewPayload: delivery.deliveredByEmail
          ? undefined
          : {
              contact: `${data.name} <${data.email}>`,
              company: data.company,
              country: data.country,
              productInterest: data.productInterest,
            },
      });
    } catch {
      res.status(502).json({
        ok: false,
        error:
          'Unable to transmit the inquiry via the configured email provider. Please retry later.',
      });
    }
  });

  app.post('/api/catalog/validate-import', (req, res) => {
    const allowedCategories = categories.map((c) => c.slug);
    const { format, content } = req.body ?? {};

    if (format === 'csv' && typeof content === 'string') {
      const result = parseAndValidateCatalogCsv(content, allowedCategories);
      res.status(result.valid ? 200 : 400).json(result);
      return;
    }

    if (format === 'json' && Array.isArray(content)) {
      const result = validateCatalogImportRows(content, allowedCategories);
      res.status(result.valid ? 200 : 400).json(result);
      return;
    }

    res.status(400).json({
      valid: false,
      rows: [],
      errors: ['Provide { format: "csv", content: "..." } or { format: "json", content: [...] }.'],
    });
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveSiteBaseUrl(req);
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n'),
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveSiteBaseUrl(req);
    const staticPaths = [
      '/',
      '/products',
      '/manufacturing',
      '/about',
      '/contact',
      '/quote',
      '/catalog',
      '/privacy',
      '/terms',
    ];
    const categoryPaths = categories.map((c) => `/categories/${c.slug}`);
    const productPaths = products.map((p) => `/products/${p.slug}`);
    const allPaths = [...staticPaths, ...categoryPaths, ...productPaths];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...allPaths.map(
        (routePath) =>
          `  <url><loc>${escapeXml(`${baseUrl}${routePath}`)}</loc></url>`,
      ),
      '</urlset>',
    ].join('\n');

    res.type('application/xml').send(xml);
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    // Long-term immutable caching for content-hashed Vite bundles
    app.use(
      '/assets',
      express.static(path.join(distDir, 'assets'), {
        maxAge: '1y',
        immutable: true,
      }),
    );
    app.use(
      express.static(distDir, {
        maxAge: '1h',
        setHeaders(res, filePath) {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      }),
    );
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(indexFile);
      } else {
        res.status(503).send('Production build not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AUREN Instruments server running on http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

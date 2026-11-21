import test from 'node:test';
import assert from 'node:assert/strict';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { parseAndValidateCatalogCsv } from './catalog-import';
import {
  addQuoteItem,
  buildQuoteCsv,
  calculateQuoteSummary,
  filterProducts,
  formatCurrency,
  paginateItems,
  removeQuoteItem,
  resolveProductPriceDisplay,
  updateQuoteQuantity,
  validateUniqueSkus,
} from './catalog-utils';

test('demo catalog has strictly unique SKUs across all products and variants', () => {
  const result = validateUniqueSkus(products);
  assert.equal(result.valid, true, `Duplicate SKUs found: ${result.duplicates.join(', ')}`);
});

test('price resolver handles From pricing, exact pricing, and Request pricing honestly', () => {
  const metzenbaum = products.find((p) => p.sku === 'AUR-GS-101')!;
  const fromUsd = resolveProductPriceDisplay(metzenbaum, 'USD', true);
  assert.equal(fromUsd.kind, 'from');
  assert.equal(fromUsd.formatted, 'From USD 14.50');

  const selectedVariant = resolveProductPriceDisplay(
    metzenbaum,
    'PKR',
    true,
    metzenbaum.variants[2],
  );
  assert.equal(selectedVariant.kind, 'exact');
  assert.equal(selectedVariant.formatted, 'PKR 4,900');

  const minorSet = products.find((p) => p.sku === 'AUR-IS-601')!;
  const requestOnly = resolveProductPriceDisplay(minorSet, 'USD', true);
  assert.equal(requestOnly.kind, 'request');
  assert.equal(requestOnly.formatted, 'Request pricing');

  const hiddenPrices = resolveProductPriceDisplay(metzenbaum, 'USD', false);
  assert.equal(hiddenPrices.kind, 'request');
});

test('catalog filtering matches SKU, name, category, material, and sorts properly', () => {
  const bySku = filterProducts(
    products,
    categories,
    {
      query: 'AUR-GS-102',
      category: '',
      material: '',
      finish: '',
      pricingOnly: false,
      sort: 'featured',
    },
    'USD',
  );
  assert.equal(bySku.length, 1);
  assert.equal(bySku[0].slug, 'mayo-hegar-needle-holder-tc');

  const byCategoryPriceAsc = filterProducts(
    products,
    categories,
    {
      query: '',
      category: 'dental-instruments',
      material: '',
      finish: '',
      pricingOnly: false,
      sort: 'price-asc',
    },
    'USD',
  );
  assert.equal(byCategoryPriceAsc.length, 3);
  assert.equal(byCategoryPriceAsc[0].sku, 'AUR-DN-203'); // $6.50 mirror first
  assert.equal(byCategoryPriceAsc[2].sku, 'AUR-DN-201'); // $19.50 extracting forceps last
});

test('pagination slices predictably and clamps out-of-range pages', () => {
  const page1 = paginateItems(products, 1, 6);
  assert.equal(page1.items.length, 6);
  assert.equal(page1.totalPages, Math.ceil(products.length / 6));

  const clamped = paginateItems(products, 99, 6);
  assert.equal(clamped.page, clamped.totalPages);
});

test('quote operations merge duplicate product+variant, update qty, remove, summarize, and sanitize CSV', () => {
  let list = addQuoteItem([], {
    productId: 'prod-mayo-hegar-tc',
    productSlug: 'mayo-hegar-needle-holder-tc',
    productName: 'Mayo-Hegar Needle Holder (TC)',
    sku: 'AUR-GS-102-160',
    categorySlug: 'general-surgery',
    variantId: 'var-gs-102-160',
    variantLabel: '160 mm · 0.4 mm Pitch',
    image: '/img.jpg',
    quantity: 5,
    unitPrice: { USD: 24, PKR: 6700 },
    isDemo: true,
  });

  list = addQuoteItem(list, {
    productId: 'prod-mayo-hegar-tc',
    productSlug: 'mayo-hegar-needle-holder-tc',
    productName: 'Mayo-Hegar Needle Holder (TC)',
    sku: 'AUR-GS-102-160',
    categorySlug: 'general-surgery',
    variantId: 'var-gs-102-160',
    variantLabel: '160 mm · 0.4 mm Pitch',
    image: '/img.jpg',
    quantity: 3,
    unitPrice: { USD: 24, PKR: 6700 },
    isDemo: true,
  });

  assert.equal(list.length, 1);
  assert.equal(list[0].quantity, 8);

  list = addQuoteItem(list, {
    productId: 'prod-minor-surgery-set',
    productSlug: 'minor-general-surgery-set-16pc',
    productName: '=cmd|calc',
    sku: 'AUR-IS-601-STD',
    categorySlug: 'instrument-sets',
    variantId: 'var-is-601-std',
    variantLabel: 'Standard 16-Piece',
    image: '/img.jpg',
    quantity: 2,
    unitPrice: null,
    isDemo: true,
  });

  const summary = calculateQuoteSummary(list, 'USD', true);
  assert.equal(summary.lineCount, 2);
  assert.equal(summary.totalUnits, 10);
  assert.equal(summary.pricedLineCount, 1);
  assert.equal(summary.unpricedLineCount, 1);
  assert.equal(summary.estimatedTotal, 192);

  const csv = buildQuoteCsv(list, 'USD', true);
  assert.ok(csv.includes("'=cmd|calc"), 'Formula injection prefix must be neutralized');
  assert.ok(csv.includes('USD 192.00'));

  list = updateQuoteQuantity(list, list[0].key, 0);
  assert.equal(list[0].quantity, 1);

  list = removeQuoteItem(list, list[1].key);
  assert.equal(list.length, 1);
});

test('CSV catalog importer validates valid rows and rejects duplicate SKUs or invalid categories', () => {
  const validCsv = [
    'sku,slug,name,categorySlug,shortSpec,summary,material,finish,lengthLabel,priceUsd,pricePkr,featured',
    'AUR-TEST-01,iris-scissors-115,Iris Scissors 115 mm,general-surgery,115 mm Straight,Delicate fine-point surgical iris scissors.,AISI 420 Stainless Steel,Satin,115 mm,12.5,3500,true',
  ].join('\n');

  const ok = parseAndValidateCatalogCsv(
    validCsv,
    categories.map((c) => c.slug),
  );
  assert.equal(ok.valid, true);
  assert.equal(ok.rows.length, 1);
  assert.equal(ok.rows[0].priceUsd, 12.5);

  const dupCsv = [
    'sku,slug,name,categorySlug,shortSpec,summary,material,finish,lengthLabel,priceUsd,pricePkr,featured',
    'AUR-DUP-01,item-one,Item One,general-surgery,120 mm,Summary text here.,AISI 420,Satin,120 mm,10,2800,false',
    'AUR-DUP-01,item-two,Item Two,general-surgery,120 mm,Summary text here.,AISI 420,Satin,120 mm,12,3200,false',
  ].join('\n');

  const bad = parseAndValidateCatalogCsv(
    dupCsv,
    categories.map((c) => c.slug),
  );
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.some((e) => e.includes('Duplicate SKU')));
});

test('currency formatting outputs predictable USD and PKR strings', () => {
  assert.equal(formatCurrency(24.5, 'USD'), 'USD 24.50');
  assert.equal(formatCurrency(6700, 'PKR'), 'PKR 6,700');
});

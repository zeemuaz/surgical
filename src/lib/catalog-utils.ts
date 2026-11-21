import type {
  Category,
  CurrencyCode,
  MoneyAmounts,
  Product,
  ProductVariant,
  QuoteItem,
} from '../types/catalog';

export type CatalogSortOption =
  | 'featured'
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc';

export interface CatalogFilterState {
  query: string;
  category: string;
  material: string;
  finish: string;
  pricingOnly: boolean;
  sort: CatalogSortOption;
}

export interface ResolvedPriceDisplay {
  kind: 'exact' | 'from' | 'request';
  amount: number | null;
  formatted: string;
  currency: CurrencyCode;
  isDemo: boolean;
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  if (currency === 'PKR') {
    return `PKR ${Math.round(amount).toLocaleString('en-US')}`;
  }
  return `USD ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getAmountForCurrency(
  money: MoneyAmounts | null | undefined,
  currency: CurrencyCode,
): number | null {
  if (!money) return null;
  const value = money[currency];
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

/**
 * Resolves a product's display price without ever inventing figures.
 * - Uses `"From"` ONLY when multiple distinct variant prices exist.
 * - Returns `"Request pricing"` when pricing is disabled or unavailable.
 */
export function resolveProductPriceDisplay(
  product: Product,
  currency: CurrencyCode,
  showPrices: boolean,
  selectedVariant?: ProductVariant | null,
): ResolvedPriceDisplay {
  if (!showPrices) {
    return {
      kind: 'request',
      amount: null,
      formatted: 'Request pricing',
      currency,
      isDemo: product.isDemo,
    };
  }

  if (selectedVariant) {
    const variantAmount =
      getAmountForCurrency(selectedVariant.price, currency) ??
      getAmountForCurrency(product.price, currency);
    if (variantAmount !== null) {
      return {
        kind: 'exact',
        amount: variantAmount,
        formatted: formatCurrency(variantAmount, currency),
        currency,
        isDemo: product.isDemo,
      };
    }
    return {
      kind: 'request',
      amount: null,
      formatted: 'Request pricing',
      currency,
      isDemo: product.isDemo,
    };
  }

  const variantAmounts = product.variants
    .map((v) => getAmountForCurrency(v.price, currency))
    .filter((v): v is number => v !== null);

  if (variantAmounts.length > 0) {
    const min = Math.min(...variantAmounts);
    const max = Math.max(...variantAmounts);
    if (min !== max) {
      return {
        kind: 'from',
        amount: min,
        formatted: `From ${formatCurrency(min, currency)}`,
        currency,
        isDemo: product.isDemo,
      };
    }
    return {
      kind: 'exact',
      amount: min,
      formatted: formatCurrency(min, currency),
      currency,
      isDemo: product.isDemo,
    };
  }

  const direct = getAmountForCurrency(product.price, currency);
  if (direct !== null) {
    return {
      kind: 'exact',
      amount: direct,
      formatted: formatCurrency(direct, currency),
      currency,
      isDemo: product.isDemo,
    };
  }

  return {
    kind: 'request',
    amount: null,
    formatted: 'Request pricing',
    currency,
    isDemo: product.isDemo,
  };
}

export function getComparableMinPrice(
  product: Product,
  currency: CurrencyCode,
): number | null {
  const resolved = resolveProductPriceDisplay(product, currency, true);
  return resolved.amount;
}

export function filterProducts(
  allProducts: Product[],
  allCategories: Category[],
  filters: CatalogFilterState,
  currency: CurrencyCode,
): Product[] {
  const categoryNameBySlug = new Map(
    allCategories.map((c) => [c.slug, c.name.toLowerCase()]),
  );
  const normalizedQuery = filters.query.trim().toLowerCase();

  const filtered = allProducts.filter((product) => {
    if (filters.category && product.categorySlug !== filters.category) {
      return false;
    }

    if (
      filters.material &&
      product.material.toLowerCase() !== filters.material.toLowerCase()
    ) {
      return false;
    }

    if (
      filters.finish &&
      product.finish.toLowerCase() !== filters.finish.toLowerCase()
    ) {
      return false;
    }

    if (filters.pricingOnly) {
      const minPrice = getComparableMinPrice(product, currency);
      if (minPrice === null) return false;
    }

    if (normalizedQuery) {
      const categoryName = categoryNameBySlug.get(product.categorySlug) ?? '';
      const variantSearch = product.variants
        .map((v) => `${v.sku} ${v.label}`)
        .join(' ')
        .toLowerCase();
      const haystack = [
        product.name,
        product.sku,
        product.shortSpec,
        product.summary,
        product.material,
        product.finish,
        categoryName,
        variantSearch,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });

  return sortProducts(filtered, filters.sort, currency);
}

export function sortProducts(
  items: Product[],
  sort: CatalogSortOption,
  currency: CurrencyCode,
): Product[] {
  const copy = [...items];
  switch (sort) {
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case 'price-asc':
      return copy.sort((a, b) => {
        const pa = getComparableMinPrice(a, currency);
        const pb = getComparableMinPrice(b, currency);
        if (pa === null && pb === null) return a.name.localeCompare(b.name);
        if (pa === null) return 1;
        if (pb === null) return -1;
        return pa - pb;
      });
    case 'price-desc':
      return copy.sort((a, b) => {
        const pa = getComparableMinPrice(a, currency);
        const pb = getComparableMinPrice(b, currency);
        if (pa === null && pb === null) return a.name.localeCompare(b.name);
        if (pa === null) return 1;
        if (pb === null) return -1;
        return pb - pa;
      });
    case 'featured':
    default:
      return copy.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return 0;
      });
  }
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
} {
  const safePageSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;
  return {
    items: items.slice(start, start + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
  };
}

export function getDistinctMaterials(items: Product[]): string[] {
  return Array.from(new Set(items.map((p) => p.material))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getDistinctFinishes(items: Product[]): string[] {
  return Array.from(new Set(items.map((p) => p.finish))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function validateUniqueSkus(items: Product[]): {
  valid: boolean;
  duplicates: string[];
} {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const product of items) {
    const key = product.sku.trim().toUpperCase();
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
    for (const variant of product.variants) {
      const vKey = variant.sku.trim().toUpperCase();
      if (seen.has(vKey)) duplicates.add(vKey);
      seen.add(vKey);
    }
  }
  return {
    valid: duplicates.size === 0,
    duplicates: Array.from(duplicates),
  };
}

// ---------------------------------------------------------------------------
// Pure Quotation List Operations
// ---------------------------------------------------------------------------

export function buildQuoteItemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

export function addQuoteItem(
  current: QuoteItem[],
  incoming: Omit<QuoteItem, 'key'>,
): QuoteItem[] {
  const key = buildQuoteItemKey(incoming.productId, incoming.variantId);
  const qty = Math.max(1, Math.floor(incoming.quantity));
  const existingIndex = current.findIndex((item) => item.key === key);

  if (existingIndex === -1) {
    return [...current, { ...incoming, key, quantity: qty }];
  }

  return current.map((item, idx) =>
    idx === existingIndex ? { ...item, quantity: item.quantity + qty } : item,
  );
}

export function updateQuoteQuantity(
  current: QuoteItem[],
  key: string,
  quantity: number,
): QuoteItem[] {
  const safeQty = Math.max(1, Math.min(100000, Math.floor(quantity)));
  return current.map((item) =>
    item.key === key ? { ...item, quantity: safeQty } : item,
  );
}

export function removeQuoteItem(current: QuoteItem[], key: string): QuoteItem[] {
  return current.filter((item) => item.key !== key);
}

export interface QuoteTotalsSummary {
  lineCount: number;
  totalUnits: number;
  pricedLineCount: number;
  unpricedLineCount: number;
  estimatedTotal: number | null;
  currency: CurrencyCode;
  containsDemoPricing: boolean;
}

export function calculateQuoteSummary(
  items: QuoteItem[],
  currency: CurrencyCode,
  showPrices: boolean,
): QuoteTotalsSummary {
  let totalUnits = 0;
  let pricedLineCount = 0;
  let unpricedLineCount = 0;
  let sum = 0;
  let containsDemoPricing = false;

  for (const item of items) {
    totalUnits += item.quantity;
    if (item.isDemo) containsDemoPricing = true;
    const unit = showPrices ? getAmountForCurrency(item.unitPrice, currency) : null;
    if (unit !== null) {
      pricedLineCount += 1;
      sum += unit * item.quantity;
    } else {
      unpricedLineCount += 1;
    }
  }

  return {
    lineCount: items.length,
    totalUnits,
    pricedLineCount,
    unpricedLineCount,
    estimatedTotal: pricedLineCount > 0 ? sum : null,
    currency,
    containsDemoPricing,
  };
}

/**
 * Escapes CSV cell values and neutralizes spreadsheet formula injection.
 */
export function escapeCsvCell(raw: string | number): string {
  const str = String(raw ?? '');
  const neutralized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  if (/[",\n\r]/.test(neutralized)) {
    return `"${neutralized.replace(/"/g, '""')}"`;
  }
  return neutralized;
}

export function buildQuoteCsv(
  items: QuoteItem[],
  currency: CurrencyCode,
  showPrices: boolean,
): string {
  const header = [
    'SKU',
    'Instrument',
    'Variation',
    'Quantity',
    `Unit Price (${currency})`,
    `Line Estimate (${currency})`,
    'Pricing Status',
  ];

  const rows = items.map((item) => {
    const unit = showPrices ? getAmountForCurrency(item.unitPrice, currency) : null;
    const lineEstimate = unit !== null ? unit * item.quantity : null;
    const status =
      unit === null
        ? 'Request pricing'
        : item.isDemo
          ? 'DEMO non-binding estimate'
          : 'Non-binding estimate';

    return [
      item.sku,
      item.productName,
      item.variantLabel ?? 'Standard',
      item.quantity,
      unit !== null ? formatCurrency(unit, currency) : 'Request pricing',
      lineEstimate !== null ? formatCurrency(lineEstimate, currency) : 'TBD',
      status,
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return [header.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

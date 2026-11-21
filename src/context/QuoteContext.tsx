import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { siteConfig } from '../config/site';
import {
  addQuoteItem,
  removeQuoteItem,
  updateQuoteQuantity,
} from '../lib/catalog-utils';
import type { CurrencyCode, Product, ProductVariant, QuoteItem } from '../types/catalog';

const QUOTE_STORAGE_KEY = 'auren_quote_items_v1';
const CURRENCY_STORAGE_KEY = 'auren_currency_v1';

interface QuoteToast {
  id: number;
  message: string;
}

interface QuoteContextValue {
  items: QuoteItem[];
  totalUnits: number;
  lineCount: number;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  addToQuote: (
    product: Product,
    options?: { variant?: ProductVariant | null; quantity?: number },
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearQuote: () => void;
  toast: QuoteToast | null;
  dismissToast: () => void;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);

function readStoredQuoteItems(): QuoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(QUOTE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is QuoteItem =>
        item &&
        typeof item.key === 'string' &&
        typeof item.productId === 'string' &&
        typeof item.sku === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity >= 1,
    );
  } catch {
    return [];
  }
}

function readStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return siteConfig.pricing.defaultCurrency;
  try {
    const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (raw === 'USD' || raw === 'PKR') return raw;
  } catch {
    // Ignore storage errors
  }
  return siteConfig.pricing.defaultCurrency;
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>(readStoredQuoteItems);
  const [currency, setCurrencyState] = useState<CurrencyCode>(readStoredCurrency);
  const [toast, setToast] = useState<QuoteToast | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage quota or privacy mode fallback
    }
  }, [items]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch {
      // Ignore
    }
  }, [currency]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
  }, []);

  const addToQuote = useCallback(
    (
      product: Product,
      options?: { variant?: ProductVariant | null; quantity?: number },
    ) => {
      const selectedVariant = options?.variant ?? product.variants[0] ?? null;
      const quantity = options?.quantity ?? 1;
      const unitPrice = selectedVariant?.price ?? product.price ?? null;

      setItems((prev) =>
        addQuoteItem(prev, {
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          sku: selectedVariant?.sku ?? product.sku,
          categorySlug: product.categorySlug,
          variantId: selectedVariant?.id,
          variantLabel: selectedVariant?.label,
          image: product.images[0]?.src ?? '',
          quantity,
          unitPrice,
          isDemo: product.isDemo,
        }),
      );

      setToast({
        id: Date.now(),
        message: `Added ${product.name}${selectedVariant ? ` (${selectedVariant.label})` : ''} to quotation list.`,
      });
    },
    [],
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) => updateQuoteQuantity(prev, key, quantity));
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => removeQuoteItem(prev, key));
  }, []);

  const clearQuote = useCallback(() => {
    setItems([]);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const totalUnits = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const value = useMemo<QuoteContextValue>(
    () => ({
      items,
      totalUnits,
      lineCount: items.length,
      currency,
      setCurrency,
      addToQuote,
      updateQuantity,
      removeItem,
      clearQuote,
      toast,
      dismissToast,
    }),
    [
      items,
      totalUnits,
      currency,
      setCurrency,
      addToQuote,
      updateQuantity,
      removeItem,
      clearQuote,
      toast,
      dismissToast,
    ],
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote(): QuoteContextValue {
  const ctx = useContext(QuoteContext);
  if (!ctx) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return ctx;
}

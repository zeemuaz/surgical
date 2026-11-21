import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CurrencySwitcher } from '../components/CurrencySwitcher';
import { ProductCard } from '../components/ProductCard';
import { siteConfig } from '../config/site';
import { useQuote } from '../context/QuoteContext';
import { categories, getCategoryBySlug } from '../data/categories';
import { products } from '../data/products';
import {
  filterProducts,
  getDistinctFinishes,
  getDistinctMaterials,
  paginateItems,
  type CatalogSortOption,
} from '../lib/catalog-utils';
import { usePageSeo } from '../lib/seo';

interface ProductsPageProps {
  lockedCategorySlug?: string;
}

const VALID_SORTS: CatalogSortOption[] = [
  'featured',
  'name-asc',
  'name-desc',
  'price-asc',
  'price-desc',
];

export function ProductsPage({ lockedCategorySlug }: ProductsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currency } = useQuote();

  const lockedCategory = lockedCategorySlug
    ? getCategoryBySlug(lockedCategorySlug)
    : undefined;

  const urlQuery = searchParams.get('q') ?? '';
  const urlCategory = lockedCategorySlug ?? (searchParams.get('category') ?? '');
  const urlMaterial = searchParams.get('material') ?? '';
  const urlFinish = searchParams.get('finish') ?? '';
  const urlPricingOnly = searchParams.get('priced') === '1';
  const rawSort = searchParams.get('sort') as CatalogSortOption | null;
  const urlSort: CatalogSortOption =
    rawSort && VALID_SORTS.includes(rawSort) ? rawSort : 'featured';
  const urlPage = Math.max(1, Number(searchParams.get('page') || '1') || 1);
  const urlPageSize = [6, 9, 12, 24].includes(Number(searchParams.get('size')))
    ? Number(searchParams.get('size'))
    : 9;

  // Debounced search input synced with URL
  const [searchDraft, setSearchDraft] = useState(urlQuery);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const filterCloseRef = useRef<HTMLButtonElement>(null);

  // Mobile drawer staged filter values (Apply / Clear pattern)
  const [draftCategory, setDraftCategory] = useState(urlCategory);
  const [draftMaterial, setDraftMaterial] = useState(urlMaterial);
  const [draftFinish, setDraftFinish] = useState(urlFinish);
  const [draftPricingOnly, setDraftPricingOnly] = useState(urlPricingOnly);

  // Body scroll lock, focus, and Escape close for mobile filter drawer
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    document.body.style.overflow = 'hidden';
    const raf = window.requestAnimationFrame(() => {
      filterCloseRef.current?.focus();
    });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        filterTriggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  useEffect(() => {
    setSearchDraft(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setDraftCategory(urlCategory);
    setDraftMaterial(urlMaterial);
    setDraftFinish(urlFinish);
    setDraftPricingOnly(urlPricingOnly);
  }, [urlCategory, urlMaterial, urlFinish, urlPricingOnly, mobileDrawerOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchDraft !== urlQuery) {
        updateParams({ q: searchDraft.trim() || null, page: null });
      }
    }, 240);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next, { replace: true });
  };

  const materials = useMemo(() => getDistinctMaterials(products), []);
  const finishes = useMemo(() => getDistinctFinishes(products), []);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1);
    }
    return counts;
  }, []);

  const activeFilterCount =
    (!lockedCategorySlug && urlCategory ? 1 : 0) +
    (urlMaterial ? 1 : 0) +
    (urlFinish ? 1 : 0) +
    (urlPricingOnly ? 1 : 0);

  const filtered = useMemo(
    () =>
      filterProducts(
        products,
        categories,
        {
          query: urlQuery,
          category: urlCategory,
          material: urlMaterial,
          finish: urlFinish,
          pricingOnly: urlPricingOnly,
          sort: urlSort,
        },
        currency,
      ),
    [urlQuery, urlCategory, urlMaterial, urlFinish, urlPricingOnly, urlSort, currency],
  );

  const paged = useMemo(
    () => paginateItems(filtered, urlPage, urlPageSize),
    [filtered, urlPage, urlPageSize],
  );

  const hasActiveFilters = Boolean(
    urlQuery ||
      (!lockedCategorySlug && urlCategory) ||
      urlMaterial ||
      urlFinish ||
      urlPricingOnly,
  );

  const clearAllFilters = () => {
    setSearchDraft('');
    const next = new URLSearchParams();
    if (urlSort !== 'featured') next.set('sort', urlSort);
    setSearchParams(next, { replace: true });
  };

  const applyMobileFilters = () => {
    updateParams({
      category: lockedCategorySlug ? null : draftCategory || null,
      material: draftMaterial || null,
      finish: draftFinish || null,
      priced: draftPricingOnly ? '1' : null,
      page: null,
    });
    setMobileDrawerOpen(false);
  };

  const pageTitle = lockedCategory ? lockedCategory.name : 'Instrument Catalog';
  const pageDescription = lockedCategory
    ? lockedCategory.shortDescription
    : 'Browse surgical and dental instruments by discipline, specification, material, and SKU.';

  usePageSeo({
    title: pageTitle,
    description: pageDescription,
    canonicalPath: lockedCategory
      ? `/categories/${lockedCategory.slug}`
      : '/products',
  });

  return (
    <div className="bg-white pb-20 pt-6 sm:pb-24 sm:pt-8 lg:pt-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <Breadcrumbs
          items={
            lockedCategory
              ? [
                  { label: 'Home', to: '/' },
                  { label: 'Products', to: '/products' },
                  { label: lockedCategory.name },
                ]
              : [{ label: 'Home', to: '/' }, { label: 'Products' }]
          }
        />

        {/* Editorial Catalog Header */}
        <div className="flex flex-col gap-6 border-b border-[#E3E8EA] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
              {lockedCategory ? 'INSTRUMENT DISCIPLINE' : 'CATALOG'}
            </p>
            <h1 className="mt-3 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-tight text-[#171C20]">
              {pageTitle}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#4E5A61]">
              {pageDescription}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <CurrencySwitcher />
            <span
              data-testid="catalog-result-count"
              className="font-mono text-[12px] tabular-nums text-[#4E5A61]"
            >
              {filtered.length}{' '}
              {filtered.length === 1 ? 'instrument' : 'instruments'}
            </span>
          </div>
        </div>

        {/* Search & Toolbar */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <label htmlFor="catalog-search-input" className="sr-only">
              Search by instrument name, SKU, or specification
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C7880]"
            />
            <input
              id="catalog-search-input"
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search name, SKU, or category..."
              className="h-11 w-full rounded-[6px] border border-[#E3E8EA] bg-white pl-10 pr-9 text-[14px] text-[#171C20] placeholder:text-[#6C7880] transition-colors focus:border-[#162C35] focus:outline-none"
            />
            {searchDraft && (
              <button
                type="button"
                onClick={() => {
                  setSearchDraft('');
                  updateParams({ q: null, page: null });
                }}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[#6C7880] hover:text-[#171C20]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex w-full flex-wrap items-center gap-2.5 sm:gap-3 lg:w-auto">
            <button
              ref={filterTriggerRef}
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-expanded={mobileDrawerOpen}
              aria-controls="mobile-filter-drawer"
              className="btn-press inline-flex h-11 shrink-0 items-center gap-2 rounded-[6px] border border-[#E3E8EA] bg-white px-3.5 text-[13px] font-medium text-[#171C20] hover:border-[#A8B5B9] lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[4px] bg-[#162C35] px-1.5 font-mono text-[11px] tabular-nums text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
              <label
                htmlFor="catalog-sort-select"
                className="shrink-0 text-[12px] font-medium text-[#4E5A61]"
              >
                Sort
              </label>
              <select
                id="catalog-sort-select"
                value={urlSort}
                onChange={(e) =>
                  updateParams({ sort: e.target.value, page: null })
                }
                className="h-11 w-full min-w-0 rounded-[6px] border border-[#E3E8EA] bg-white pl-3 pr-7 text-[13px] text-[#171C20] focus:border-[#162C35] focus:outline-none sm:w-auto"
              >
                <option value="featured">Featured order</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="price-asc">Sample price: Low to High</option>
                <option value="price-desc">Sample price: High to Low</option>
              </select>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <label
                htmlFor="catalog-pagesize-select"
                className="text-[12px] font-medium text-[#4E5A61]"
              >
                Per page
              </label>
              <select
                id="catalog-pagesize-select"
                value={urlPageSize}
                onChange={(e) =>
                  updateParams({ size: e.target.value, page: null })
                }
                className="h-11 rounded-[6px] border border-[#E3E8EA] bg-white pl-3 pr-7 font-mono text-[12px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Desktop Split: Restrained Left Sidebar + Catalog Grid */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Desktop Sidebar */}
          <aside
            aria-label="Catalog filters"
            className="hidden lg:col-span-3 lg:block"
          >
            <div className="sticky top-24 space-y-8 border-r border-[#E3E8EA] pr-6">
              {!lockedCategorySlug && (
                <div>
                  <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                    Discipline
                  </p>
                  <ul className="mt-3 space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          updateParams({ category: null, page: null })
                        }
                        className={`flex w-full items-center justify-between rounded-[5px] px-2.5 py-2 text-left text-[13px] transition-colors ${
                          urlCategory === ''
                            ? 'bg-[#F4F6F7] font-semibold text-[#171C20]'
                            : 'text-[#4E5A61] hover:bg-[#F4F6F7]/70 hover:text-[#171C20]'
                        }`}
                      >
                        <span>All Instruments</span>
                        <span className="font-mono text-[11px] tabular-nums text-[#6C7880]">
                          {products.length}
                        </span>
                      </button>
                    </li>
                    {categories.map((cat) => {
                      const count = categoryCounts.get(cat.slug) ?? 0;
                      const active = urlCategory === cat.slug;
                      return (
                        <li key={cat.slug}>
                          <button
                            type="button"
                            onClick={() =>
                              updateParams({ category: cat.slug, page: null })
                            }
                            className={`flex w-full items-center justify-between rounded-[5px] px-2.5 py-2 text-left text-[13px] transition-colors ${
                              active
                                ? 'bg-[#F4F6F7] font-semibold text-[#171C20]'
                                : 'text-[#4E5A61] hover:bg-[#F4F6F7]/70 hover:text-[#171C20]'
                            }`}
                          >
                            <span>{cat.name}</span>
                            <span className="font-mono text-[11px] tabular-nums text-[#6C7880]">
                              {count}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div>
                <label
                  htmlFor="filter-material-select"
                  className="block text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]"
                >
                  Material
                </label>
                <select
                  id="filter-material-select"
                  value={urlMaterial}
                  onChange={(e) =>
                    updateParams({ material: e.target.value || null, page: null })
                  }
                  className="mt-2.5 h-10 w-full rounded-[6px] border border-[#E3E8EA] bg-white px-3 text-[13px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
                >
                  <option value="">All materials</option>
                  {materials.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="filter-finish-select"
                  className="block text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]"
                >
                  Surface Finish
                </label>
                <select
                  id="filter-finish-select"
                  value={urlFinish}
                  onChange={(e) =>
                    updateParams({ finish: e.target.value || null, page: null })
                  }
                  className="mt-2.5 h-10 w-full rounded-[6px] border border-[#E3E8EA] bg-white px-3 text-[13px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
                >
                  <option value="">All finishes</option>
                  {finishes.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-[#4E5A61]">
                  <input
                    type="checkbox"
                    checked={urlPricingOnly}
                    onChange={(e) =>
                      updateParams({
                        priced: e.target.checked ? '1' : null,
                        page: null,
                      })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-[#A8B5B9] accent-[#162C35]"
                  />
                  <span>Show instruments with sample pricing only</span>
                </label>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[13px] font-medium text-[#162C35] underline underline-offset-4 hover:text-[#0F2027]"
                >
                  Reset all filters
                </button>
              )}

              {lockedCategory && (
                <div className="border-t border-[#E3E8EA] pt-6">
                  <Link
                    to="/products"
                    className="editorial-link text-[13px] font-medium text-[#162C35]"
                  >
                    Browse all categories
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* Catalog Grid */}
          <div className="lg:col-span-9">
            {hasActiveFilters && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E8EA] pb-4 text-[13px] text-[#4E5A61]">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Active criteria:</span>
                  {urlQuery && <span>Query &ldquo;{urlQuery}&rdquo;</span>}
                  {!lockedCategorySlug && urlCategory && (
                    <span>
                      · {getCategoryBySlug(urlCategory)?.name ?? urlCategory}
                    </span>
                  )}
                  {urlMaterial && <span>· {urlMaterial}</span>}
                  {urlFinish && <span>· {urlFinish}</span>}
                  {urlPricingOnly && <span>· Sample priced only</span>}
                </div>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="font-medium text-[#162C35] underline underline-offset-4 hover:text-[#0F2027]"
                >
                  Clear filters
                </button>
              </div>
            )}

            {paged.items.length === 0 ? (
              <div className="rounded-[6px] border border-[#E3E8EA] bg-[#F4F6F7] px-6 py-16 text-center">
                <h2 className="text-[18px] font-semibold text-[#171C20]">
                  No instruments match your current filters
                </h2>
                <p className="mx-auto mt-2 max-w-md text-[14px] text-[#4E5A61]">
                  Adjust your search query or clear active specification filters.
                  For custom patterns not listed here, submit a direct inquiry.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex h-10 items-center rounded-[6px] bg-[#162C35] px-5 text-[13px] font-medium text-white hover:bg-[#0F2027]"
                  >
                    Reset Filters
                  </button>
                  <Link
                    to="/contact"
                    className="inline-flex h-10 items-center rounded-[6px] border border-[#E3E8EA] bg-white px-5 text-[13px] font-medium text-[#171C20] hover:border-[#A8B5B9]"
                  >
                    Inquire About Custom Patterns
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {paged.items.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={idx < 3}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {paged.totalPages > 1 && (
                  <nav
                    aria-label="Catalog pagination"
                    className="mt-10 flex items-center justify-between border-t border-[#E3E8EA] pt-6"
                  >
                    <span className="font-mono text-[12px] tabular-nums text-[#6C7880]">
                      Page {paged.page} of {paged.totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={paged.page <= 1}
                        onClick={() => {
                          updateParams({ page: String(paged.page - 1) });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="btn-press inline-flex h-11 items-center rounded-[6px] border border-[#E3E8EA] bg-white px-4 text-[13px] font-medium text-[#171C20] hover:border-[#162C35] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={paged.page >= paged.totalPages}
                        onClick={() => {
                          updateParams({ page: String(paged.page + 1) });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="btn-press inline-flex h-11 items-center rounded-[6px] border border-[#E3E8EA] bg-white px-4 text-[13px] font-medium text-[#171C20] hover:border-[#162C35] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10"
                      >
                        Next
                      </button>
                    </div>
                  </nav>
                )}

                {siteConfig.pricing.isDemoPricing && (
                  <p className="mt-8 text-[12px] text-[#6C7880]">
                    {siteConfig.pricing.currencyNote}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Animated Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <m.div
            id="mobile-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Filter instruments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex justify-end bg-[#171C20]/40 backdrop-blur-[2px] lg:hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setMobileDrawerOpen(false);
                filterTriggerRef.current?.focus();
              }
            }}
          >
            <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="safe-pb flex h-full w-full max-w-[360px] flex-col bg-white px-5 py-5 shadow-2xl sm:px-6"
            >
              <div className="flex items-center justify-between border-b border-[#E3E8EA] pb-4">
                <h2 className="text-[16px] font-semibold text-[#171C20]">
                  Filter Instruments
                </h2>
                <button
                  ref={filterCloseRef}
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    filterTriggerRef.current?.focus();
                  }}
                  aria-label="Close filter drawer"
                  className="btn-press inline-flex h-11 w-11 items-center justify-center rounded-[6px] text-[#171C20] hover:bg-[#F4F6F7]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex-1 space-y-6 overflow-y-auto">
                {!lockedCategorySlug && (
                  <div>
                    <label
                      htmlFor="mobile-filter-category"
                      className="block text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]"
                    >
                      Discipline
                    </label>
                    <select
                      id="mobile-filter-category"
                      value={draftCategory}
                      onChange={(e) => setDraftCategory(e.target.value)}
                      className="mt-2 h-11 w-full rounded-[6px] border border-[#E3E8EA] bg-white px-3 text-[14px] text-[#171C20]"
                    >
                      <option value="">All Instruments</option>
                      {categories.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="mobile-filter-material"
                    className="block text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]"
                  >
                    Material
                  </label>
                  <select
                    id="mobile-filter-material"
                    value={draftMaterial}
                    onChange={(e) => setDraftMaterial(e.target.value)}
                    className="mt-2 h-11 w-full rounded-[6px] border border-[#E3E8EA] bg-white px-3 text-[14px] text-[#171C20]"
                  >
                    <option value="">All materials</option>
                    {materials.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mobile-filter-finish"
                    className="block text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]"
                  >
                    Surface Finish
                  </label>
                  <select
                    id="mobile-filter-finish"
                    value={draftFinish}
                    onChange={(e) => setDraftFinish(e.target.value)}
                    className="mt-2 h-11 w-full rounded-[6px] border border-[#E3E8EA] bg-white px-3 text-[14px] text-[#171C20]"
                  >
                    <option value="">All finishes</option>
                    {finishes.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[14px] text-[#4E5A61]">
                  <input
                    type="checkbox"
                    checked={draftPricingOnly}
                    onChange={(e) => setDraftPricingOnly(e.target.checked)}
                    className="h-4 w-4 accent-[#162C35]"
                  />
                  <span>Show instruments with sample pricing only</span>
                </label>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#E3E8EA] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDraftCategory(lockedCategorySlug ?? '');
                    setDraftMaterial('');
                    setDraftFinish('');
                    setDraftPricingOnly(false);
                    clearAllFilters();
                    setMobileDrawerOpen(false);
                  }}
                  className="btn-press h-12 rounded-[6px] border border-[#E3E8EA] bg-white text-[14px] font-medium text-[#171C20] hover:border-[#162C35]"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={applyMobileFilters}
                  className="btn-press h-12 rounded-[6px] bg-[#162C35] text-[14px] font-medium text-white hover:bg-[#0F2027]"
                >
                  Apply
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { siteConfig } from '../config/site';
import { categories } from '../data/categories';
import { useQuote } from '../context/QuoteContext';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { lineCount, totalUnits } = useQuote();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileCloseBtnRef = useRef<HTMLButtonElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        rafId = 0;
      });
    };
    setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setProductsMenuOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      const id = window.requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(id);
    }
  }, [searchOpen]);

  // Focus management and scroll lock for mobile drawer
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const id = window.requestAnimationFrame(() => {
        mobileCloseBtnRef.current?.focus();
      });
      return () => {
        window.cancelAnimationFrame(id);
        document.body.style.overflow = '';
      };
    }
    document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Escape key & outside click close
  useEffect(() => {
    if (!mobileMenuOpen && !productsMenuOpen && !searchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          menuTriggerRef.current?.focus();
        }
        if (productsMenuOpen) setProductsMenuOpen(false);
        if (searchOpen) setSearchOpen(false);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (
        productsMenuOpen &&
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(e.target as Node)
      ) {
        setProductsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [mobileMenuOpen, productsMenuOpen, searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    navigate(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products');
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled
          ? 'border-b border-[#E3E8EA] bg-white/95 shadow-[0_6px_24px_rgba(23,28,32,0.04)] backdrop-blur-md'
          : 'border-b border-transparent bg-white'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:gap-6 sm:px-8 lg:h-[76px] lg:px-12">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="shrink-0 whitespace-nowrap py-2 text-[17px] font-semibold tracking-[0.22em] text-[#171C20] transition-opacity duration-200 hover:opacity-75 sm:text-[19px]"
          aria-label={`${siteConfig.brand.fullName} — Home`}
        >
          {siteConfig.brand.wordmark}
        </Link>

        {/* Zone 2: Primary Desktop Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {siteConfig.navigation.header.map((item) => {
            const isActive =
              item.to === '/products'
                ? pathname.startsWith('/products') || pathname.startsWith('/categories')
                : pathname === item.to;

            if (item.hasCategoryMenu) {
              return (
                <div
                  key={item.to}
                  ref={dropdownContainerRef}
                  className="relative flex items-center"
                >
                  <Link
                    to={item.to}
                    className={`editorial-link shrink-0 whitespace-nowrap py-1 text-[14px] font-medium transition-colors ${
                      isActive
                        ? 'text-[#171C20]'
                        : 'text-[#4E5A61] hover:text-[#171C20]'
                    }`}
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    aria-expanded={productsMenuOpen}
                    aria-controls="header-categories-menu"
                    aria-label="Toggle product categories menu"
                    onClick={() => setProductsMenuOpen((prev) => !prev)}
                    className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-[#4E5A61] transition-colors hover:bg-[#F4F6F7] hover:text-[#171C20]"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        productsMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {productsMenuOpen && (
                      <m.div
                        id="header-categories-menu"
                        role="region"
                        aria-label="Instrument categories"
                        initial={{ opacity: 0, y: 8, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.99 }}
                        transition={{ duration: 0.2, ease: EASE_EXPO }}
                        className="absolute left-0 top-full mt-3 w-[520px] origin-top-left rounded-[6px] border border-[#E3E8EA] bg-white p-5 shadow-[0_18px_40px_rgba(23,28,32,0.09)]"
                      >
                        <div className="mb-3 flex items-center justify-between border-b border-[#E3E8EA] pb-2.5">
                          <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                            Instrument Disciplines
                          </span>
                          <Link
                            to="/products"
                            className="editorial-link text-[12px] font-medium text-[#162C35]"
                          >
                            <span>View Full Catalog</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {categories.map((category) => (
                            <Link
                              key={category.slug}
                              to={`/categories/${category.slug}`}
                              className="group rounded-[5px] px-3 py-2.5 transition-colors duration-150 hover:bg-[#F4F6F7]"
                            >
                              <div className="flex items-center justify-between gap-2 text-[14px] font-medium text-[#171C20] group-hover:text-[#162C35]">
                                <span>{category.name}</span>
                                <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 text-[#162C35] transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                              </div>
                              <p className="mt-0.5 line-clamp-1 text-[12px] text-[#6C7880]">
                                {category.shortDescription}
                              </p>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-[#E3E8EA] pt-3 text-[12px] text-[#4E5A61]">
                          <Link
                            to="/catalog"
                            className="editorial-link hover:text-[#171C20]"
                          >
                            Digital Catalog Library
                          </Link>
                          <Link
                            to="/quote"
                            className="editorial-link hover:text-[#171C20]"
                          >
                            Quotation List ({lineCount})
                          </Link>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`editorial-link shrink-0 whitespace-nowrap py-1 text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'text-[#171C20]'
                    : 'text-[#4E5A61] hover:text-[#171C20]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Search, Quote Count, Primary CTA & Mobile Trigger */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <div className="hidden items-center md:flex">
            <AnimatePresence mode="wait" initial={false}>
              {searchOpen ? (
                <m.form
                  key="search-input"
                  onSubmit={handleSearchSubmit}
                  initial={{ opacity: 0, width: 120 }}
                  animate={{ opacity: 1, width: 232 }}
                  exit={{ opacity: 0, width: 120 }}
                  transition={{ duration: 0.22, ease: EASE_EXPO }}
                  className="flex items-center overflow-hidden border-b border-[#162C35] pb-0.5"
                >
                  <label htmlFor="header-catalog-search" className="sr-only">
                    Search instruments or SKU
                  </label>
                  <Search
                    aria-hidden="true"
                    className="mr-2 h-3.5 w-3.5 shrink-0 text-[#6C7880]"
                  />
                  <input
                    id="header-catalog-search"
                    ref={searchInputRef}
                    type="search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search SKU or instrument..."
                    className="w-full min-w-0 bg-transparent py-1 text-[13px] text-[#171C20] placeholder:text-[#6C7880] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Close catalog search"
                    className="ml-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-[#6C7880] transition-colors hover:bg-[#F4F6F7] hover:text-[#171C20]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </m.form>
              ) : (
                <m.button
                  key="search-trigger"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open catalog search"
                  className="btn-press inline-flex h-10 w-10 items-center justify-center rounded-[6px] text-[#4E5A61] hover:bg-[#F4F6F7] hover:text-[#171C20]"
                >
                  <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </m.button>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/quote"
            aria-label={`Quotation list, ${lineCount} ${lineCount === 1 ? 'instrument' : 'instruments'} saved`}
            className={`btn-press relative inline-flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-[6px] px-2.5 text-[#171C20] hover:bg-[#F4F6F7] sm:h-10 ${
              lineCount > 0 ? 'bg-[#F4F6F7]/80' : ''
            }`}
          >
            <ClipboardList className="h-[18px] w-[18px]" strokeWidth={1.75} />
            <span
              data-testid="header-quote-count"
              className="relative inline-flex min-w-[1ch] justify-center overflow-hidden font-mono text-[12px] font-medium tabular-nums text-[#162C35]"
            >
              <m.span
                key={lineCount}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: EASE_EXPO }}
              >
                {lineCount}
              </m.span>
            </span>
            {totalUnits > 0 && (
              <span className="sr-only">({totalUnits} total units)</span>
            )}
          </Link>

          <Link
            to="/quote"
            className="btn-press hidden h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[6px] bg-[#162C35] px-4 text-[13px] font-medium text-white hover:bg-[#0F2027] sm:inline-flex"
          >
            Request Quote
          </Link>

          <button
            ref={menuTriggerRef}
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            className="btn-press inline-flex h-11 w-11 items-center justify-center rounded-[6px] text-[#171C20] hover:bg-[#F4F6F7] lg:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 flex justify-end bg-[#171C20]/40 backdrop-blur-[2px] lg:hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setMobileMenuOpen(false);
                menuTriggerRef.current?.focus();
              }
            }}
          >
            <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="safe-pb flex h-full w-full max-w-[360px] flex-col overflow-y-auto bg-white px-5 py-5 shadow-2xl sm:px-6"
            >
              <div className="flex items-center justify-between border-b border-[#E3E8EA] pb-4">
                <span className="text-[17px] font-semibold tracking-[0.22em] text-[#171C20]">
                  {siteConfig.brand.wordmark}
                </span>
                <button
                  ref={mobileCloseBtnRef}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    menuTriggerRef.current?.focus();
                  }}
                  aria-label="Close navigation menu"
                  className="btn-press inline-flex h-11 w-11 items-center justify-center rounded-[6px] text-[#171C20] hover:bg-[#F4F6F7]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="mt-5">
                <label htmlFor="mobile-catalog-search" className="sr-only">
                  Search instruments
                </label>
                <div className="flex items-center rounded-[6px] border border-[#E3E8EA] bg-[#F4F6F7] px-3 transition-colors focus-within:border-[#162C35] focus-within:bg-white">
                  <Search className="h-4 w-4 shrink-0 text-[#6C7880]" />
                  <input
                    id="mobile-catalog-search"
                    type="search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search instruments or SKU"
                    className="h-11 w-full bg-transparent px-2.5 text-[14px] text-[#171C20] placeholder:text-[#6C7880] focus:outline-none"
                  />
                </div>
              </form>

              <nav aria-label="Mobile navigation" className="mt-5 flex flex-col">
                {siteConfig.navigation.header.map((item) => {
                  const isActive =
                    item.to === '/products'
                      ? pathname.startsWith('/products') ||
                        pathname.startsWith('/categories')
                      : pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex min-h-[48px] items-center justify-between border-b border-[#E3E8EA] text-[16px] font-medium transition-colors ${
                        isActive ? 'text-[#162C35]' : 'text-[#171C20]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight
                        className={`h-4 w-4 ${
                          isActive ? 'text-[#162C35]' : 'text-[#A8B5B9]'
                        }`}
                      />
                    </Link>
                  );
                })}
                <Link
                  to="/catalog"
                  className={`flex min-h-[48px] items-center justify-between border-b border-[#E3E8EA] text-[16px] font-medium transition-colors ${
                    pathname === '/catalog' ? 'text-[#162C35]' : 'text-[#171C20]'
                  }`}
                >
                  <span>Digital Catalog</span>
                  <ArrowRight
                    className={`h-4 w-4 ${
                      pathname === '/catalog' ? 'text-[#162C35]' : 'text-[#A8B5B9]'
                    }`}
                  />
                </Link>
              </nav>

              <div className="mt-6">
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                  Instrument Disciplines
                </p>
                <div className="mt-2.5 grid grid-cols-1 gap-0.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/categories/${cat.slug}`}
                      className="flex min-h-[44px] items-center justify-between rounded-[5px] px-2 text-[14px] text-[#4E5A61] transition-colors hover:bg-[#F4F6F7] hover:text-[#171C20]"
                    >
                      <span>{cat.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#A8B5B9]" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-7">
                <Link
                  to="/quote"
                  className="btn-press flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#162C35] text-[14px] font-medium text-white hover:bg-[#0F2027]"
                >
                  <span>Request Quote</span>
                  <span className="font-mono text-[12px] text-[#D2DCDE]">
                    ({lineCount})
                  </span>
                </Link>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}

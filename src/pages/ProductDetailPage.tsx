import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import {
  ArrowRight,
  Check,
  FileText,
  Maximize2,
  Minus,
  Plus,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CurrencySwitcher } from '../components/CurrencySwitcher';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { StudioImage } from '../components/StudioImage';
import { siteConfig } from '../config/site';
import { useQuote } from '../context/QuoteContext';
import { getCategoryBySlug } from '../data/categories';
import { getProductBySlug, getRelatedProducts } from '../data/products';
import { resolveProductPriceDisplay } from '../lib/catalog-utils';
import { getResponsiveImageAsset } from '../lib/image-manifest';
import { isSafeHref } from '../lib/url-safety';
import { usePageSeo } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  const { currency, addToQuote } = useQuote();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants[0]?.id ?? '',
  );
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [qtyInput, setQtyInput] = useState('1');
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);

  const feedbackTimerRef = useRef<number | null>(null);
  const inspectTriggerRef = useRef<HTMLButtonElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // Sync state when navigating between products
  useEffect(() => {
    setSelectedVariantId(product?.variants[0]?.id ?? '');
    setActiveImageIdx(0);
    setQuantity(1);
    setQtyInput('1');
    setAddedFeedback(false);
    setLightboxOpen(false);
    setLightboxZoomed(false);
  }, [product?.id]);

  // Body scroll lock, focus management, and Escape key close for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = 'hidden';
    const raf = window.requestAnimationFrame(() => {
      lightboxCloseRef.current?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setLightboxZoomed(false);
        inspectTriggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const category = product ? getCategoryBySlug(product.categorySlug) : undefined;
  const selectedVariant =
    product?.variants.find((v) => v.id === selectedVariantId) ??
    product?.variants[0] ??
    null;

  const activeSku = selectedVariant?.sku ?? product?.sku ?? '';
  const priceDisplay = product
    ? resolveProductPriceDisplay(
        product,
        currency,
        siteConfig.pricing.showSamplePrices,
        selectedVariant,
      )
    : null;

  const related = useMemo(
    () => (product ? getRelatedProducts(product, 3) : []),
    [product],
  );

  const productJsonLd = useMemo(() => {
    if (!product) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      sku: activeSku,
      description: product.summary,
      brand: {
        '@type': 'Brand',
        name: siteConfig.brand.fullName,
      },
      category: category?.name,
    };
  }, [product, activeSku, category?.name]);

  usePageSeo({
    title: product ? `${product.name} (${activeSku})` : 'Instrument Not Found',
    description: product?.summary,
    canonicalPath: product ? `/products/${product.slug}` : undefined,
    jsonLd: productJsonLd,
  });

  if (!product || !priceDisplay) {
    return <NotFoundPage />;
  }

  const activeImage = product.images[activeImageIdx] ?? product.images[0];
  const lightboxAsset = activeImage
    ? getResponsiveImageAsset(activeImage.src)
    : null;

  const commitQuantity = (next: number) => {
    const clamped = Math.max(1, Math.min(100000, Math.round(next)));
    setQuantity(clamped);
    setQtyInput(String(clamped));
  };

  const handleAddToQuote = () => {
    addToQuote(product, {
      variant: selectedVariant,
      quantity,
    });
    setAddedFeedback(true);
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setAddedFeedback(false);
      feedbackTimerRef.current = null;
    }, 1800);
  };

  const directInquiryQuery = encodeURIComponent(
    `${product.name} (${activeSku}${selectedVariant ? ` · ${selectedVariant.label}` : ''})`,
  );

  return (
    <div className="bg-white pb-20 pt-6 sm:pb-24 sm:pt-8 lg:pt-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Products', to: '/products' },
            ...(category
              ? [{ label: category.name, to: `/categories/${category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />

        {/* Primary Split: Sticky Gallery Left + Contiguous Procurement Module Right */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <div className="group relative overflow-hidden rounded-[8px] border border-[#E3E8EA] bg-[#F4F6F7]">
                <StudioImage
                  src={activeImage?.src ?? ''}
                  alt={activeImage?.alt ?? product.name}
                  aspectClass="aspect-[4/3]"
                  sizes="(min-width: 1024px) 56vw, 94vw"
                  priority
                  fallbackLabel={product.name}
                />
                <button
                  ref={inspectTriggerRef}
                  type="button"
                  onClick={() => {
                    setLightboxZoomed(false);
                    setLightboxOpen(true);
                  }}
                  aria-label="Inspect enlarged instrument photograph"
                  className="btn-press absolute bottom-3 right-3 inline-flex h-11 items-center gap-2 rounded-[6px] border border-[#E3E8EA] bg-white/95 px-3.5 text-[12px] font-medium text-[#171C20] shadow-sm backdrop-blur-xs hover:border-[#162C35] sm:bottom-4 sm:right-4 sm:h-10"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </button>
              </div>

              {activeImage?.caption && (
                <p className="mt-2.5 text-[12px] text-[#6C7880]">
                  {activeImage.caption}
                  {activeImage.isProvisional
                    ? ' · Provisional demonstration photograph.'
                    : ''}
                </p>
              )}

              {product.images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={`${img.src}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      aria-label={`View image ${idx + 1} of ${product.name}`}
                      aria-pressed={idx === activeImageIdx}
                      className={`w-24 shrink-0 overflow-hidden rounded-[6px] border transition-all duration-200 ${
                        idx === activeImageIdx
                          ? 'border-[#162C35] ring-1 ring-[#162C35]'
                          : 'border-[#E3E8EA] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <StudioImage
                        src={img.src}
                        alt={img.alt}
                        aspectClass="aspect-[4/3]"
                        sizes="96px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Contiguous Procurement & Specifications Module */}
          <div className="lg:col-span-5">
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#4E5A61]">
              {category && (
                <Link
                  to={`/categories/${category.slug}`}
                  className="font-medium text-[#162C35] hover:underline"
                >
                  {category.name}
                </Link>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[#6C7880]">
                SKU {activeSku}
              </span>
            </div>

            <h1 className="mt-3 text-[clamp(1.7rem,2.6vw,2.35rem)] font-semibold leading-[1.15] text-[#171C20]">
              {product.name}
            </h1>

            <p className="mt-4 text-[15px] leading-[1.65] text-[#4E5A61]">
              {product.summary}
            </p>

            {/* Price & Currency Row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-[#E3E8EA] py-5">
              <div>
                <div
                  data-testid="pdp-price-display"
                  className="font-mono text-[20px] font-medium tabular-nums text-[#171C20]"
                >
                  {priceDisplay.formatted}
                </div>
                <p className="mt-1 text-[12px] text-[#6C7880]">
                  {priceDisplay.kind === 'request'
                    ? 'Quoted according to order volume and OEM requirements'
                    : priceDisplay.isDemo
                      ? 'DEMO sample unit reference · Non-binding estimate'
                      : 'Indicative ex-factory unit reference'}
                </p>
              </div>
              <CurrencySwitcher />
            </div>

            {/* Variation Selector */}
            {product.variants.length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                  Configuration / Length
                </p>
                <div
                  role="radiogroup"
                  aria-label="Select instrument configuration"
                  className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  {product.variants.map((variant) => {
                    const active = variant.id === selectedVariant?.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`flex flex-col rounded-[6px] border px-3.5 py-2.5 text-left transition-colors ${
                          active
                            ? 'border-[#162C35] bg-[#F4F6F7]'
                            : 'border-[#E3E8EA] bg-white hover:border-[#A8B5B9]'
                        }`}
                      >
                        <span className="text-[13px] font-medium text-[#171C20]">
                          {variant.label}
                        </span>
                        <span className="mt-0.5 font-mono text-[11px] tabular-nums text-[#6C7880]">
                          {variant.sku}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & Primary Actions */}
            <div className="mt-7 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex h-12 items-center rounded-[6px] border border-[#E3E8EA] bg-white sm:w-36">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => commitQuantity(quantity - 1)}
                    className="btn-press inline-flex h-full w-11 items-center justify-center text-[#4E5A61] hover:text-[#171C20] disabled:opacity-35"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <label htmlFor="pdp-quantity-input" className="sr-only">
                    Quantity
                  </label>
                  <input
                    id="pdp-quantity-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={qtyInput}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^\d]/g, '');
                      setQtyInput(digits);
                      const parsed = parseInt(digits, 10);
                      if (!Number.isNaN(parsed) && parsed >= 1) {
                        setQuantity(Math.min(100000, parsed));
                      }
                    }}
                    onBlur={() => commitQuantity(parseInt(qtyInput, 10) || 1)}
                    className="h-full w-full min-w-0 bg-transparent text-center font-mono text-[14px] tabular-nums text-[#171C20] focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => commitQuantity(quantity + 1)}
                    className="btn-press inline-flex h-full w-11 items-center justify-center text-[#4E5A61] hover:text-[#171C20]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToQuote}
                  className={`btn-press inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[6px] px-6 text-[14px] font-medium text-white ${
                    addedFeedback
                      ? 'bg-[#0F2027]'
                      : 'bg-[#162C35] hover:bg-[#0F2027]'
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={2.25} />
                      <span>Added to Quotation List</span>
                    </>
                  ) : (
                    <span>Add to Quote</span>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <Link
                  to={`/contact?interest=${directInquiryQuery}`}
                  className="editorial-link text-[13px] font-medium text-[#162C35]"
                >
                  <span>Direct Inquiry for This Instrument</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                {product.specPdfUrl && isSafeHref(product.specPdfUrl) && (
                  <a
                    href={product.specPdfUrl}
                    download
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#4E5A61] hover:text-[#171C20]"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Download Specification PDF</span>
                  </a>
                )}
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div className="mt-10 border-t border-[#E3E8EA] pt-8">
              <h2 className="text-[12px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                Technical Specifications
              </h2>
              <dl className="mt-4 divide-y divide-[#E3E8EA] border-y border-[#E3E8EA]">
                <div className="grid grid-cols-12 gap-3 py-3 text-[13px]">
                  <dt className="col-span-5 text-[#6C7880]">Reference SKU</dt>
                  <dd className="col-span-7 font-mono tabular-nums text-[#171C20]">
                    {activeSku}
                  </dd>
                </div>
                <div className="grid grid-cols-12 gap-3 py-3 text-[13px]">
                  <dt className="col-span-5 text-[#6C7880]">Material</dt>
                  <dd className="col-span-7 text-[#171C20]">{product.material}</dd>
                </div>
                <div className="grid grid-cols-12 gap-3 py-3 text-[13px]">
                  <dt className="col-span-5 text-[#6C7880]">Surface Finish</dt>
                  <dd className="col-span-7 text-[#171C20]">{product.finish}</dd>
                </div>
                <div className="grid grid-cols-12 gap-3 py-3 text-[13px]">
                  <dt className="col-span-5 text-[#6C7880]">Dimensions</dt>
                  <dd className="col-span-7 font-mono tabular-nums text-[#171C20]">
                    {selectedVariant?.lengthMm
                      ? `${selectedVariant.lengthMm} mm`
                      : product.lengthLabel}
                  </dd>
                </div>
                {product.reusability && (
                  <div className="grid grid-cols-12 gap-3 py-3 text-[13px]">
                    <dt className="col-span-5 text-[#6C7880]">Reusability</dt>
                    <dd className="col-span-7 text-[#171C20]">
                      {product.reusability}
                    </dd>
                  </div>
                )}
                {product.specifications.map((spec) => (
                  <div
                    key={spec.label}
                    className="grid grid-cols-12 gap-3 py-3 text-[13px]"
                  >
                    <dt className="col-span-5 text-[#6C7880]">{spec.label}</dt>
                    <dd className="col-span-7 text-[#171C20]">{spec.value}</dd>
                  </div>
                ))}
              </dl>
              {product.sterilizationNote && (
                <p className="mt-4 text-[12px] leading-relaxed text-[#6C7880]">
                  Reprocessing note: {product.sterilizationNote}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Related Instruments */}
        {related.length > 0 && (
          <section className="mt-20 border-t border-[#E3E8EA] pt-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-[22px] font-semibold text-[#171C20]">
                Related Instruments
              </h2>
              <Link
                to="/products"
                className="editorial-link text-[13px] font-medium text-[#162C35]"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, idx) => (
                <Reveal key={item.id} delay={idx * 0.08}>
                  <ProductCard product={item} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Accessible Animated Zoomable Close-Up Lightbox */}
      <AnimatePresence>
        {lightboxOpen && activeImage && (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={`Enlarged view of ${product.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#171C20]/80 p-3 backdrop-blur-xs sm:p-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setLightboxOpen(false);
                setLightboxZoomed(false);
                inspectTriggerRef.current?.focus();
              }
            }}
          >
            <m.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 6 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[8px] bg-white p-3 shadow-2xl sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[#171C20]">
                    {product.name}
                  </p>
                  <p className="font-mono text-[12px] text-[#6C7880]">{activeSku}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLightboxZoomed((z) => !z)}
                    aria-label={lightboxZoomed ? 'Reset zoom' : 'Zoom in on instrument'}
                    aria-pressed={lightboxZoomed}
                    className="btn-press inline-flex h-11 items-center gap-1.5 rounded-[6px] border border-[#E3E8EA] px-3 text-[12px] font-medium text-[#171C20] hover:border-[#162C35] sm:h-10"
                  >
                    {lightboxZoomed ? (
                      <>
                        <ZoomOut className="h-4 w-4" />
                        <span>1×</span>
                      </>
                    ) : (
                      <>
                        <ZoomIn className="h-4 w-4" />
                        <span>1.75×</span>
                      </>
                    )}
                  </button>
                  <button
                    ref={lightboxCloseRef}
                    type="button"
                    onClick={() => {
                      setLightboxOpen(false);
                      setLightboxZoomed(false);
                      inspectTriggerRef.current?.focus();
                    }}
                    aria-label="Close enlarged image"
                    className="btn-press inline-flex h-11 w-11 items-center justify-center rounded-[6px] text-[#171C20] hover:bg-[#F4F6F7] sm:h-10 sm:w-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-auto rounded-[4px] bg-[#F4F6F7]">
                <picture className="block">
                  {lightboxAsset && (
                    <source type="image/webp" srcSet={lightboxAsset.webpLarge} />
                  )}
                  <img
                    src={activeImage.src}
                    alt={activeImage.alt}
                    width={lightboxAsset?.width ?? 1200}
                    height={lightboxAsset?.height ?? 896}
                    referrerPolicy="no-referrer"
                    onClick={() => setLightboxZoomed((z) => !z)}
                    className={`mx-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      lightboxZoomed
                        ? 'max-w-none w-[175%] cursor-zoom-out'
                        : 'max-h-[72vh] w-full cursor-zoom-in object-contain'
                    }`}
                  />
                </picture>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

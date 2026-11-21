import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { m, useReducedMotion } from 'motion/react';
import { CurrencySwitcher } from '../components/CurrencySwitcher';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { StudioImage } from '../components/StudioImage';
import { siteConfig } from '../config/site';
import { categories } from '../data/categories';
import { getFeaturedProducts } from '../data/products';
import { usePageSeo } from '../lib/seo';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function HomePage() {
  const prefersReduced = useReducedMotion();
  const featuredProducts = useMemo(() => getFeaturedProducts().slice(0, 6), []);

  const orgJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.brand.fullName,
      description: siteConfig.seo.defaultDescription,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Sialkot',
        addressCountry: 'PK',
      },
    }),
    [],
  );

  usePageSeo({
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    canonicalPath: '/',
    jsonLd: orgJsonLd,
  });

  const heroEnter = (delay: number) =>
    prefersReduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.48, delay, ease: EASE_EXPO },
        };

  return (
    <div>
      {/* SECTION 2 — HERO */}
      <section className="border-b border-[#E3E8EA] bg-white">
        <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-6 sm:px-8 sm:pb-20 sm:pt-12 lg:px-12 lg:pb-24 lg:pt-14">
          <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left 42%: Staggered Concise Editorial Typography & Actions */}
            <div className="lg:col-span-5">
              <m.p
                {...heroEnter(0)}
                className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]"
              >
                PRECISION MANUFACTURING · SIALKOT
              </m.p>

              <m.h1
                {...heroEnter(0.06)}
                className="mt-4 text-[clamp(2.15rem,7vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-[#171C20] sm:mt-5"
              >
                Precision in
                <br />
                Every Detail.
              </m.h1>

              <m.p
                {...heroEnter(0.12)}
                className="mt-5 max-w-[40ch] text-[15px] leading-[1.6] text-[#4E5A61] sm:mt-6 sm:text-[17px]"
              >
                Surgical and dental instruments, manufactured for professionals
                worldwide.
              </m.p>

              <m.div
                {...heroEnter(0.18)}
                className="mt-7 flex flex-col items-stretch gap-3.5 sm:mt-9 sm:flex-row sm:items-center sm:gap-7"
              >
                <Link
                  to="/products"
                  className="btn-press inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-[6px] bg-[#162C35] px-6 text-[14px] font-medium text-white hover:bg-[#0F2027] sm:w-auto"
                >
                  Explore Instruments
                </Link>
                <Link
                  to="/manufacturing"
                  className="editorial-link inline-flex min-h-[44px] items-center justify-center whitespace-nowrap text-[14px] font-medium text-[#171C20] hover:text-[#162C35] sm:justify-start"
                >
                  <span>Manufacturing Capabilities</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </m.div>
            </div>

            {/* Right 58%: Signature Studio Surgical Instrument Photography */}
            <m.div
              initial={prefersReduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.56, delay: 0.08, ease: EASE_EXPO }}
              className="lg:col-span-7"
            >
              <div className="overflow-hidden rounded-[8px] border border-[#E3E8EA] bg-[#F4F6F7]">
                <m.div
                  initial={prefersReduced ? false : { scale: 1.035 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.08, ease: EASE_EXPO }}
                >
                  <StudioImage
                    src={siteConfig.media.heroImage}
                    alt={siteConfig.media.heroImageAlt}
                    aspectClass="aspect-[4/3]"
                    sizes="(min-width: 1024px) 58vw, 94vw"
                    priority
                    fallbackLabel="AUREN Precision Surgical Instruments"
                  />
                </m.div>
              </div>
            </m.div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — CATEGORY EXPLORATION */}
      <section className="bg-white py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          <Reveal>
            <div className="flex flex-col gap-3 border-b border-[#E3E8EA] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-tight text-[#171C20]">
                Explore Our Instruments
              </h2>
              <Link
                to="/products"
                className="editorial-link inline-flex min-h-[44px] self-start items-center whitespace-nowrap text-[14px] font-medium text-[#162C35] sm:min-h-0 sm:self-auto"
              >
                <span>View All Products</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </div>
          </Reveal>

          {/* Intentional Asymmetric Swiss Editorial Grid: 2 lead cards + 4 discipline tiles */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-12 lg:gap-7">
            {categories.map((category, idx) => {
              const isLead = idx < 2;
              return (
                <Reveal
                  key={category.slug}
                  delay={Math.min(idx * 0.07, 0.35)}
                  className={
                    isLead
                      ? 'sm:col-span-1 lg:col-span-6'
                      : 'sm:col-span-1 lg:col-span-3'
                  }
                >
                  <Link
                    to={`/categories/${category.slug}`}
                    className="group block overflow-hidden rounded-[6px] border border-[#E3E8EA] bg-white transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#A8B5B9] hover:shadow-[0_10px_28px_rgba(23,28,32,0.05)]"
                  >
                    <StudioImage
                      src={category.image}
                      alt={category.imageAlt}
                      aspectClass="aspect-[4/3]"
                      sizes={
                        isLead
                          ? '(min-width: 1024px) 46vw, (min-width: 640px) 48vw, 94vw'
                          : '(min-width: 1024px) 23vw, (min-width: 640px) 48vw, 94vw'
                      }
                      hoverZoom
                      fallbackLabel={category.name}
                    />
                    <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
                      <span className="text-[15px] font-medium text-[#171C20] transition-colors group-hover:text-[#162C35]">
                        {category.name}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-[#6C7880] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-[#162C35]"
                        strokeWidth={1.75}
                      />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURED PRODUCTS */}
      <section className="border-y border-[#E3E8EA] bg-[#F4F6F7] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          <Reveal>
            <div className="flex flex-col gap-4 border-b border-[#E3E8EA] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-tight text-[#171C20]">
                  Selected Instruments
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <CurrencySwitcher />
                <Link
                  to="/products"
                  className="editorial-link inline-flex min-h-[44px] items-center whitespace-nowrap text-[14px] font-medium text-[#162C35] sm:min-h-0"
                >
                  <span>Full Catalog</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
            {featuredProducts.map((product, idx) => (
              <Reveal key={product.id} delay={(idx % 3) * 0.08}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          {siteConfig.pricing.isDemoPricing && (
            <p className="mt-8 text-[12px] leading-relaxed text-[#6C7880]">
              {siteConfig.pricing.currencyNote}
            </p>
          )}
        </div>
      </section>

      {/* SECTION 5 — MANUFACTURING FEATURE */}
      <section className="bg-white py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-7" y={20} duration={0.62}>
              <div className="group overflow-hidden rounded-[8px] border border-[#E3E8EA] bg-[#F4F6F7]">
                <StudioImage
                  src={siteConfig.media.manufacturingHeroImage}
                  alt={siteConfig.media.manufacturingHeroAlt}
                  aspectClass="aspect-[4/3]"
                  sizes="(min-width: 1024px) 56vw, 94vw"
                  hoverZoom
                  fallbackLabel="Precision Instrument Finishing"
                />
              </div>
              {siteConfig.media.isProvisionalPhotography && (
                <p className="mt-2.5 text-[11px] leading-relaxed text-[#6C7880]">
                  Representative studio imagery for white-label demonstration — replace
                  with verified facility photography prior to launch.
                </p>
              )}
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-5">
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
                MANUFACTURING
              </p>
              <h2 className="mt-4 text-[clamp(1.7rem,2.8vw,2.5rem)] font-semibold leading-[1.12] text-[#171C20]">
                Built with Purpose.
              </h2>
              <p className="mt-5 max-w-[42ch] text-[15px] leading-[1.65] text-[#4E5A61] sm:text-[16px]">
                Precision manufacturing, consistent finishing, and production
                tailored to your requirements.
              </p>
              <div className="mt-8">
                <Link
                  to="/manufacturing"
                  className="btn-press group inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-[6px] border border-[#162C35] bg-white px-5 text-[14px] font-medium text-[#162C35] hover:bg-[#162C35] hover:text-white sm:h-11"
                >
                  <span>Our Capabilities</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 6 — OEM / PRIVATE LABEL */}
      {siteConfig.oem.offered && (
        <section className="border-t border-[#E3E8EA] bg-[#F4F6F7] py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
                    OEM & PRIVATE LABEL
                  </p>
                  <h2 className="mt-3 text-[clamp(1.45rem,2.4vw,2.1rem)] font-semibold leading-tight text-[#171C20]">
                    {siteConfig.oem.headline}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#4E5A61]">
                    {siteConfig.oem.summary}
                  </p>
                </div>
                <Link
                  to="/contact?interest=OEM%20%2F%20Private%20Label"
                  className="editorial-link inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap text-[14px] font-medium text-[#162C35] sm:min-h-0"
                >
                  <span>Discuss a Project</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* SECTION 7 — FINAL CTA */}
      <section className="bg-[#162C35] py-16 text-white sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-xl">
                <h2 className="text-[clamp(1.7rem,3vw,2.65rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-white">
                  Let&apos;s Build Something Precise.
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed tracking-[0.01em] text-[#D2DCDE] sm:text-[16px]">
                  Tell us what you need. We&apos;ll help you find the right
                  instruments.
                </p>
              </div>
              <Link
                to="/quote"
                className="btn-press inline-flex h-12 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-[6px] bg-white px-6 text-[14px] font-medium text-[#162C35] hover:bg-[#F4F6F7] sm:w-auto"
              >
                Request a Quotation
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

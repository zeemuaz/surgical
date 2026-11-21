import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Reveal } from '../components/Reveal';
import { StudioImage } from '../components/StudioImage';
import { siteConfig } from '../config/site';
import { usePageSeo } from '../lib/seo';

export function AboutPage() {
  const { brand, certifications } = siteConfig;

  usePageSeo({
    title: `About ${brand.fullName}`,
    description: `Manufacturer profile for ${brand.fullName}, surgical and dental instrument production in ${brand.location}.`,
    canonicalPath: '/about',
  });

  return (
    <div className="bg-white pb-20 pt-6 sm:pb-24 sm:pt-8 lg:pt-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        />

        <div className="grid grid-cols-1 gap-12 border-b border-[#E3E8EA] pb-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
              ABOUT THE MANUFACTURER
            </p>
            <h1 className="mt-4 text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-[1.1] text-[#171C20]">
              {brand.fullName}
            </h1>
            <p className="mt-5 max-w-[54ch] text-[16px] leading-[1.7] text-[#4E5A61]">
              Based in {brand.location}, {brand.fullName} focuses on stainless-steel
              surgical and dental instruments engineered for clinical
              distributors, hospital procurement groups, and OEM partners.
            </p>
            {brand.foundingYear !== null && (
              <p className="mt-4 text-[15px] text-[#171C20]">
                Established in {brand.foundingYear} in {brand.location}.
              </p>
            )}
            {brand.isDemoBrand && (
              <p className="mt-5 rounded-[6px] border border-[#E3E8EA] bg-[#F4F6F7] p-4 text-[13px] leading-relaxed text-[#4E5A61]">
                Demonstration profile notice: AUREN Instruments is a white-label
                working demonstration name. Update company history, founding
                year, verified address, and quality documentation inside{' '}
                <code className="font-mono text-[12px] text-[#171C20]">
                  src/config/site.ts
                </code>
                .
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-6">
            <div className="overflow-hidden rounded-[6px] border border-[#E3E8EA]">
              <StudioImage
                src={siteConfig.media.manufacturingHeroImage}
                alt={siteConfig.media.manufacturingHeroAlt}
                aspectClass="aspect-[4/3]"
                sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 94vw"
                priority
              />
            </div>
            <div className="overflow-hidden rounded-[6px] border border-[#E3E8EA]">
              <StudioImage
                src={siteConfig.media.aboutSecondaryImage}
                alt={siteConfig.media.aboutSecondaryAlt}
                aspectClass="aspect-[4/3]"
                sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 94vw"
              />
            </div>
          </div>
        </div>

        {/* Company Fact Grid */}
        <Reveal>
          <section className="py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="border-t border-[#E3E8EA] pt-5">
              <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                Location
              </p>
              <p className="mt-2.5 text-[16px] font-medium text-[#171C20]">
                {brand.location}
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#4E5A61]">
                Positioned within Pakistan&apos;s primary surgical metalwork cluster
                for direct export fulfillment.
              </p>
            </div>

            <div className="border-t border-[#E3E8EA] pt-5">
              <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                Commercial Focus
              </p>
              <p className="mt-2.5 text-[16px] font-medium text-[#171C20]">
                B2B Supply & OEM Production
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#4E5A61]">
                Structured for international importers, hospital tenders,
                regional distributors, and private-label medical brands.
              </p>
            </div>

            <div className="border-t border-[#E3E8EA] pt-5">
              <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                Quality Documentation
              </p>
              {certifications.length > 0 ? (
                <ul className="mt-2.5 space-y-2 text-[14px] text-[#171C20]">
                  {certifications.map((cert) => (
                    <li key={cert.certificateNumber}>
                      <span className="font-medium">{cert.name}</span> —{' '}
                      <span className="font-mono text-[12px] text-[#4E5A61]">
                        {cert.certificateNumber}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="mt-2.5 text-[16px] font-medium text-[#171C20]">
                    Available Upon Verification
                  </p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#4E5A61]">
                    Verified quality-management and regulatory certificates are
                    published here only after client documentation is provided.
                  </p>
                </>
              )}
            </div>
          </div>

            <div className="mt-14 flex flex-wrap items-center gap-6 border-t border-[#E3E8EA] pt-10">
              <Link
                to="/products"
                className="btn-press group inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#162C35] px-6 text-[14px] font-medium text-white hover:bg-[#0F2027] sm:h-11 sm:w-auto"
              >
                <span>Explore Instruments</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/contact"
                className="editorial-link text-[14px] font-medium text-[#162C35]"
              >
                Contact Export Desk
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}

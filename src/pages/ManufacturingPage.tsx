import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Reveal } from '../components/Reveal';
import { StudioImage } from '../components/StudioImage';
import { siteConfig } from '../config/site';
import { manufacturingStages } from '../data/manufacturing';
import { usePageSeo } from '../lib/seo';

export function ManufacturingPage() {
  const activeStages = manufacturingStages.filter((stage) => stage.enabled);

  usePageSeo({
    title: 'Manufacturing & OEM Capabilities',
    description:
      'Precision surgical and dental instrument production workflow, finishing discipline, and OEM private-label manufacturing in Sialkot, Pakistan.',
    canonicalPath: '/manufacturing',
  });

  return (
    <div className="bg-white pb-20 pt-6 sm:pb-24 sm:pt-8 lg:pt-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: 'Manufacturing' }]}
        />

        {/* Editorial Hero */}
        <div className="grid grid-cols-1 items-end gap-10 border-b border-[#E3E8EA] pb-14 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
              MANUFACTURING & OEM
            </p>
            <h1 className="mt-4 text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-[1.1] text-[#171C20]">
              Built with Purpose.
            </h1>
            <p className="mt-5 max-w-[44ch] text-[16px] leading-[1.65] text-[#4E5A61]">
              Structured instrument production from material preparation to
              dimensional inspection, tailored to institutional tenders and
              private-label brand specifications.
            </p>
            <div className="mt-8">
              <Link
                to="/contact?interest=Manufacturing%20%2F%20OEM%20Inquiry"
                className="btn-press group inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#162C35] px-6 text-[14px] font-medium text-white hover:bg-[#0F2027] sm:w-auto"
              >
                <span>Discuss Manufacturing Requirements</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-[8px] border border-[#E3E8EA] bg-[#F4F6F7]">
              <StudioImage
                src={siteConfig.media.manufacturingHeroImage}
                alt={siteConfig.media.manufacturingHeroAlt}
                aspectClass="aspect-[4/3]"
                sizes="(min-width: 1024px) 56vw, 94vw"
                priority
              />
            </div>
            {siteConfig.media.isProvisionalPhotography && (
              <p className="mt-2.5 text-[12px] text-[#6C7880]">
                Provisional demonstration photography. Replace with verified
                in-house workshop photography in{' '}
                <code className="font-mono text-[11px]">src/config/site.ts</code>.
              </p>
            )}
          </div>
        </div>

        {/* Production Disciplines */}
        {activeStages.length > 0 && (
          <section className="py-16 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
                PRODUCTION WORKFLOW
              </p>
              <h2 className="mt-3 text-[clamp(1.5rem,2.4vw,2.1rem)] font-semibold text-[#171C20]">
                Controlled Process Stages
              </h2>
              {siteConfig.brand.isDemoBrand && (
                <p className="mt-3 text-[13px] text-[#6C7880]">
                  Demonstration capability overview — enable or edit only the
                  processes performed directly by the manufacturer.
                </p>
              )}
            </div>

            <div className="mt-10 divide-y divide-[#E3E8EA] border-y border-[#E3E8EA]">
              {activeStages.map((stage) => (
                <Reveal key={stage.index}>
                  <div className="grid grid-cols-1 gap-6 py-9 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-4">
                      <span className="font-mono text-[12px] tabular-nums text-[#6C7880]">
                        {stage.index}.
                      </span>
                      <h3 className="mt-2 text-[18px] font-semibold text-[#171C20]">
                        {stage.title}
                      </h3>
                    </div>
                    <div className="lg:col-span-8">
                      <p className="text-[15px] leading-relaxed text-[#171C20]">
                        {stage.summary}
                      </p>
                      <ul className="mt-4 space-y-2 text-[14px] text-[#4E5A61]">
                        {stage.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2.5">
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#162C35]"
                            />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* OEM & Private Label */}
        {siteConfig.oem.offered && (
          <Reveal>
            <section className="rounded-[8px] border border-[#E3E8EA] bg-[#F4F6F7] p-6 sm:p-10 lg:p-12">
              <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
                    OEM & PRIVATE LABEL
                  </p>
                  <h2 className="mt-3 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold text-[#171C20]">
                    {siteConfig.oem.headline}
                  </h2>
                  <p className="mt-4 text-[15px] leading-relaxed text-[#4E5A61]">
                    {siteConfig.oem.summary}
                  </p>
                </div>
                <div className="lg:col-span-7">
                  <ul className="divide-y divide-[#E3E8EA] border-y border-[#E3E8EA]">
                    {siteConfig.oem.services.map((service, idx) => (
                      <li
                        key={service}
                        className="flex items-baseline gap-4 py-4 text-[14px] text-[#171C20]"
                      >
                        <span className="font-mono text-[11px] tabular-nums text-[#6C7880]">
                          0{idx + 1}
                        </span>
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 flex flex-wrap items-center gap-5 sm:gap-6">
                    <Link
                      to="/contact?interest=OEM%20%2F%20Private%20Label"
                      className="btn-press group inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#162C35] px-5 text-[14px] font-medium text-white hover:bg-[#0F2027] sm:h-11 sm:w-auto"
                    >
                      <span>Discuss a Project</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      to="/products"
                      className="editorial-link text-[14px] font-medium text-[#162C35]"
                    >
                      Review Reference Patterns
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>
        )}
      </div>
    </div>
  );
}

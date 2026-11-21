import { Breadcrumbs } from '../components/Breadcrumbs';
import { siteConfig } from '../config/site';
import { usePageSeo } from '../lib/seo';

export function TermsPage() {
  usePageSeo({
    title: 'Terms & Inquiry Conditions',
    description: `Commercial inquiry terms and non-binding quotation conditions for ${siteConfig.brand.fullName}.`,
    canonicalPath: '/terms',
  });

  return (
    <div className="bg-white pb-24 pt-8 lg:pt-12">
      <div className="mx-auto max-w-[920px] px-5 sm:px-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Terms & Inquiry Conditions' },
          ]}
        />

        <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
          LEGAL
        </p>
        <h1 className="mt-3 text-[clamp(1.85rem,3vw,2.5rem)] font-semibold text-[#171C20]">
          Terms & Inquiry Conditions
        </h1>

        <div className="mt-8 space-y-8 border-t border-[#E3E8EA] pt-8 text-[15px] leading-[1.7] text-[#4E5A61]">
          <section>
            <h2 className="text-[17px] font-semibold text-[#171C20]">
              1. Non-Binding Catalog & Quotation Requests
            </h2>
            <p className="mt-2.5">
              Product listings, dimensions, and any indicative or demonstration
              unit figures displayed on this website are provided for
              procurement reference only. Submitting a quotation list or contact
              form constitutes a request for quotation (RFQ) and does not create
              a binding purchase order, contract of sale, or payment obligation.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[#171C20]">
              2. Confirmed Proforma Quotations
            </h2>
            <p className="mt-2.5">
              Final unit pricing, minimum order quantities (MOQ), Incoterms
              (e.g. EXW, FOB, CIF), freight, lead times, and OEM marking terms
              become valid only when issued in a written proforma invoice or
              formal quotation signed by {siteConfig.brand.fullName}.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[#171C20]">
              3. Intended Professional Use & Reprocessing
            </h2>
            <p className="mt-2.5">
              Reusable surgical and dental instruments are supplied non-sterile
              unless explicitly contracted otherwise. Buyers and clinical
              institutions are responsible for verifying local regulatory
              import compliance and performing validated cleaning, inspection,
              and sterilization prior to clinical use.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[#171C20]">
              4. Demonstration Notice
            </h2>
            <p className="mt-2.5">
              Where demonstration data flags are active, sample pricing,
              product specifications, and placeholder contact details serve to
              illustrate platform functionality and should be replaced with
              verified manufacturer records before commercial deployment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

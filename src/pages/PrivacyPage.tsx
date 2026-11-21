import { Breadcrumbs } from '../components/Breadcrumbs';
import { siteConfig } from '../config/site';
import { usePageSeo } from '../lib/seo';

export function PrivacyPage() {
  usePageSeo({
    title: 'Privacy Policy',
    description: `Privacy policy governing business inquiry and quotation data submitted to ${siteConfig.brand.fullName}.`,
    canonicalPath: '/privacy',
  });

  return (
    <div className="bg-white pb-24 pt-8 lg:pt-12">
      <div className="mx-auto max-w-[920px] px-5 sm:px-8">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]}
        />

        <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
          LEGAL
        </p>
        <h1 className="mt-3 text-[clamp(1.85rem,3vw,2.5rem)] font-semibold text-[#171C20]">
          Privacy Policy
        </h1>

        <div className="mt-8 space-y-8 border-t border-[#E3E8EA] pt-8 text-[15px] leading-[1.7] text-[#4E5A61]">
          <section>
            <h2 className="text-[17px] font-semibold text-[#171C20]">
              1. Information Collected
            </h2>
            <p className="mt-2.5">
              When you submit a quotation request (RFQ) or contact inquiry to{' '}
              {siteConfig.brand.fullName}, we collect only the business contact
              details and product specifications you provide — including your
              name, business email address, company or institution name,
              country, telephone/WhatsApp number, and requested SKUs or notes.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[#171C20]">
              2. Browser Local Storage
            </h2>
            <p className="mt-2.5">
              Your saved quotation list and selected display currency (USD or
              PKR) are stored locally in your browser&apos;s{' '}
              <code className="font-mono text-[13px] text-[#171C20]">
                localStorage
              </code>{' '}
              solely so your selections remain available across page reloads. No
              third-party advertising trackers are used.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[#171C20]">
              3. Use of Inquiry Information
            </h2>
            <p className="mt-2.5">
              Submitted inquiry data is used strictly to prepare product
              quotations, answer technical or OEM specification questions, and
              coordinate commercial communication. We do not sell or rent buyer
              contact details to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[#171C20]">
              4. Data Deletion & Contact
            </h2>
            <p className="mt-2.5">
              You may request correction or deletion of previously submitted
              business inquiry records at any time by contacting our desk via
              the configured email on our Contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

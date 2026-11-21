import React, { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { siteConfig } from '../config/site';
import { contactInquirySchema, isSafeHref } from '../lib/inquiry-validation';
import { usePageSeo } from '../lib/seo';

interface ContactSubmitResponse {
  ok: boolean;
  referenceId?: string;
  deliveredByEmail?: boolean;
  mode?: 'resend' | 'development_preview';
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const INTEREST_PRESETS = [
  'General Surgery Instruments',
  'Dental Instruments',
  'Orthopedic Instruments',
  'ENT & Diagnostic Instruments',
  'Hospital Procedure Sets',
  'OEM / Private Label Manufacturing',
  'PDF Catalog Request',
];

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const initialInterest = searchParams.get('interest') ?? '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('');
  const [productInterest, setProductInterest] = useState(initialInterest);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] =
    useState<ContactSubmitResponse | null>(null);
  const resultBannerRef = useRef<HTMLDivElement>(null);

  usePageSeo({
    title: 'Contact & Inquiries',
    description:
      'Contact AUREN Instruments in Sialkot, Pakistan for export quotations, OEM manufacturing inquiries, and institutional procurement support.',
    canonicalPath: '/contact',
  });

  const { contact, brand } = siteConfig;
  const whatsappHref = contact.whatsappNumber
    ? `https://wa.me/${contact.whatsappNumber.replace(/[^\d]/g, '')}`
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitResult(null);

    const parsed = contactInquirySchema.safeParse({
      name,
      email,
      company,
      country,
      productInterest,
      message,
      website,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || 'form');
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      setFormError('Please review the highlighted fields before sending.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/inquiries/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json: ContactSubmitResponse = await response.json();

      if (!response.ok || !json.ok) {
        if (json.fieldErrors) setFieldErrors(json.fieldErrors);
        setFormError(json.error || 'Unable to submit your inquiry right now.');
        return;
      }

      setSubmitResult(json);
      setName('');
      setEmail('');
      setCompany('');
      setCountry('');
      setMessage('');
      window.requestAnimationFrame(() => {
        resultBannerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      });
    } catch {
      setFormError('Network error while submitting your inquiry. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white pb-20 pt-6 sm:pb-24 sm:pt-8 lg:pt-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Minimalist Contact Details */}
          <div className="lg:col-span-5">
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
              CONTACT & EXPORT DESK
            </p>
            <h1 className="mt-4 text-[clamp(2rem,3.2vw,2.85rem)] font-semibold leading-[1.1] text-[#171C20]">
              Direct Inquiry.
            </h1>
            <p className="mt-4 max-w-[42ch] text-[15px] leading-[1.65] text-[#4E5A61]">
              Reach our quotation and OEM team for product specifications,
              distributor pricing, sample evaluations, or custom manufacturing.
            </p>

            <dl className="mt-10 divide-y divide-[#E3E8EA] border-y border-[#E3E8EA]">
              <div className="py-4">
                <dt className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                  Location
                </dt>
                <dd className="mt-1.5 text-[15px] text-[#171C20]">
                  {brand.location}
                </dd>
                {contact.streetAddress && (
                  <dd className="mt-1 text-[13px] text-[#4E5A61]">
                    {contact.streetAddress}
                  </dd>
                )}
                {contact.mapUrl && isSafeHref(contact.mapUrl) && (
                  <dd className="mt-2">
                    <a
                      href={contact.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#162C35] hover:underline"
                    >
                      <span>Open Facility Map</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </dd>
                )}
              </div>

              {contact.email && isSafeHref(`mailto:${contact.email}`) && (
                <div className="py-4">
                  <dt className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                    Email {contact.isDemoContact ? '· Demo' : ''}
                  </dt>
                  <dd className="mt-1.5 text-[15px]">
                    <a
                      href={`mailto:${contact.email}`}
                      className="editorial-link text-[#171C20] hover:text-[#162C35]"
                    >
                      {contact.email}
                    </a>
                  </dd>
                </div>
              )}

              {contact.phone && isSafeHref(`tel:${contact.phone}`) && (
                <div className="py-4">
                  <dt className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                    Telephone {contact.isDemoContact ? '· Demo' : ''}
                  </dt>
                  <dd className="mt-1.5 font-mono text-[14px] tabular-nums text-[#171C20]">
                    <a
                      href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
                      className="hover:text-[#162C35]"
                    >
                      {contact.phone}
                    </a>
                  </dd>
                </div>
              )}

              {whatsappHref && isSafeHref(whatsappHref) && (
                <div className="py-4">
                  <dt className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                    WhatsApp
                  </dt>
                  <dd className="mt-1.5 text-[14px]">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-[#162C35] hover:underline"
                    >
                      <span>Start WhatsApp Conversation</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </dd>
                </div>
              )}

              <div className="py-4">
                <dt className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                  Business Hours
                </dt>
                <dd className="mt-1.5 text-[14px] text-[#4E5A61]">
                  {contact.businessHours}
                </dd>
              </div>
            </dl>
          </div>

          {/* Right: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-[6px] border border-[#E3E8EA] bg-white p-6 sm:p-9">
              <h2 className="text-[20px] font-semibold text-[#171C20]">
                Send an Inquiry
              </h2>
              <p className="mt-1.5 text-[13px] text-[#4E5A61]">
                Looking to price multiple specific SKUs? Use the{' '}
                <Link
                  to="/quote"
                  className="font-medium text-[#162C35] underline underline-offset-4"
                >
                  Quotation List
                </Link>{' '}
                to build an itemized RFQ.
              </p>

              {submitResult && (
                <div
                  ref={resultBannerRef}
                  role="status"
                  data-testid="contact-submit-result"
                  className="mt-5 rounded-[6px] border border-[#162C35]/25 bg-[#F4F6F7] p-5"
                >
                  <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#162C35]">
                    {submitResult.deliveredByEmail
                      ? 'INQUIRY RECEIVED'
                      : 'DEVELOPMENT PREVIEW RECORDED — EMAIL NOT CONFIGURED'}
                  </p>
                  <p className="mt-1.5 font-mono text-[13px] font-medium text-[#171C20]">
                    Reference: {submitResult.referenceId}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#4E5A61]">
                    {submitResult.message}
                  </p>
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="mt-5 rounded-[5px] border border-[#8A2C2C]/30 bg-[#FDF5F5] px-4 py-3 text-[13px] text-[#7A2323]"
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-[13px] font-medium text-[#171C20]"
                    >
                      Name <span className="text-[#6C7880]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-invalid={Boolean(fieldErrors.name)}
                      className="mt-1.5 h-11 w-full rounded-[6px] border border-[#E3E8EA] px-3.5 text-[14px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-[12px] text-[#8A2C2C]">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-[13px] font-medium text-[#171C20]"
                    >
                      Business Email <span className="text-[#6C7880]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(fieldErrors.email)}
                      className="mt-1.5 h-11 w-full rounded-[6px] border border-[#E3E8EA] px-3.5 text-[14px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-[12px] text-[#8A2C2C]">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-company"
                      className="block text-[13px] font-medium text-[#171C20]"
                    >
                      Company / Institution <span className="text-[#6C7880]">*</span>
                    </label>
                    <input
                      id="contact-company"
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      aria-invalid={Boolean(fieldErrors.company)}
                      className="mt-1.5 h-11 w-full rounded-[6px] border border-[#E3E8EA] px-3.5 text-[14px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
                    />
                    {fieldErrors.company && (
                      <p className="mt-1 text-[12px] text-[#8A2C2C]">
                        {fieldErrors.company}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-country"
                      className="block text-[13px] font-medium text-[#171C20]"
                    >
                      Country <span className="text-[#6C7880]">*</span>
                    </label>
                    <input
                      id="contact-country"
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      aria-invalid={Boolean(fieldErrors.country)}
                      className="mt-1.5 h-11 w-full rounded-[6px] border border-[#E3E8EA] px-3.5 text-[14px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
                    />
                    {fieldErrors.country && (
                      <p className="mt-1 text-[12px] text-[#8A2C2C]">
                        {fieldErrors.country}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-interest"
                    className="block text-[13px] font-medium text-[#171C20]"
                  >
                    Product Interest <span className="text-[#6C7880]">*</span>
                  </label>
                  <input
                    id="contact-interest"
                    type="text"
                    list="contact-interest-options"
                    required
                    value={productInterest}
                    onChange={(e) => setProductInterest(e.target.value)}
                    placeholder="Select a discipline or specify SKU / OEM project"
                    aria-invalid={Boolean(fieldErrors.productInterest)}
                    className="mt-1.5 h-11 w-full rounded-[6px] border border-[#E3E8EA] px-3.5 text-[14px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
                  />
                  <datalist id="contact-interest-options">
                    {INTEREST_PRESETS.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                  {fieldErrors.productInterest && (
                    <p className="mt-1 text-[12px] text-[#8A2C2C]">
                      {fieldErrors.productInterest}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-[13px] font-medium text-[#171C20]"
                  >
                    Message <span className="text-[#6C7880]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share required patterns, estimated order volume, target finish, or private-label packaging needs..."
                    aria-invalid={Boolean(fieldErrors.message)}
                    className="mt-1.5 w-full rounded-[6px] border border-[#E3E8EA] p-3.5 text-[14px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
                  />
                  {fieldErrors.message && (
                    <p className="mt-1 text-[12px] text-[#8A2C2C]">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-press inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#162C35] px-7 text-[14px] font-medium text-white hover:bg-[#0F2027] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {submitting && (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    )}
                    <span>{submitting ? 'Sending Inquiry...' : 'Send Inquiry'}</span>
                  </button>
                  <p className="text-[12px] text-[#6C7880]">
                    Protected under our{' '}
                    <Link to="/privacy" className="underline hover:text-[#171C20]">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

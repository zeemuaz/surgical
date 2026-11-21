import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Download,
  ExternalLink,
  Loader2,
  Minus,
  Plus,
  Printer,
  Trash2,
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CurrencySwitcher } from '../components/CurrencySwitcher';
import { StudioImage } from '../components/StudioImage';
import { siteConfig } from '../config/site';
import { useQuote } from '../context/QuoteContext';
import {
  buildQuoteCsv,
  calculateQuoteSummary,
  formatCurrency,
  getAmountForCurrency,
} from '../lib/catalog-utils';
import {
  buildWhatsAppQuoteUrl,
  isSafeHref,
  quoteInquirySchema,
} from '../lib/inquiry-validation';
import { usePageSeo } from '../lib/seo';

interface QuoteSubmitResponse {
  ok: boolean;
  referenceId?: string;
  receivedAt?: string;
  deliveredByEmail?: boolean;
  mode?: 'resend' | 'development_preview';
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  itemCount?: number;
  totalUnits?: number;
}

export function QuotePage() {
  const {
    items,
    currency,
    updateQuantity,
    removeItem,
    clearQuote,
  } = useQuote();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<QuoteSubmitResponse | null>(
    null,
  );
  const resultBannerRef = useRef<HTMLDivElement>(null);

  usePageSeo({
    title: 'Request Quotation',
    description:
      'Review your selected surgical and dental instruments, export a specification CSV, and request a formal B2B export quotation.',
    canonicalPath: '/quote',
  });

  const summary = useMemo(
    () =>
      calculateQuoteSummary(
        items,
        currency,
        siteConfig.pricing.showSamplePrices,
      ),
    [items, currency],
  );

  const whatsappUrl = useMemo(
    () =>
      buildWhatsAppQuoteUrl(
        siteConfig.contact.whatsappNumber,
        siteConfig.brand.fullName,
        items,
        currency,
        message,
      ),
    [items, currency, message],
  );

  const handleExportCsv = () => {
    const csv = buildQuoteCsv(items, currency, siteConfig.pricing.showSamplePrices);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auren-quotation-list-${currency.toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitResult(null);

    const payload = {
      name,
      email,
      company,
      country,
      phone,
      currency,
      message,
      website,
      items: items.map((item) => ({
        sku: item.sku,
        productName: item.productName,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
      })),
    };

    const parsed = quoteInquirySchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || 'form');
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      setFormError('Please correct the highlighted fields to submit your quotation request.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/inquiries/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json: QuoteSubmitResponse = await response.json();

      if (!response.ok || !json.ok) {
        if (json.fieldErrors) setFieldErrors(json.fieldErrors);
        setFormError(
          json.error || 'Unable to process your quotation request right now.',
        );
        return;
      }

      setSubmitResult(json);
      window.requestAnimationFrame(() => {
        resultBannerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      });
    } catch {
      setFormError(
        'Network error while submitting the quotation request. Please retry or export your list as CSV.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white pb-20 pt-6 sm:pb-24 sm:pt-8 lg:pt-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: 'Quotation List' }]}
        />

        <div className="flex flex-col gap-5 border-b border-[#E3E8EA] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
              REQUEST FOR QUOTATION (RFQ)
            </p>
            <h1 className="mt-3 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-tight text-[#171C20]">
              Quotation List
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#4E5A61]">
              Review selected instruments and quantities to request a formal
              proforma quotation with lead times, OEM options, and freight terms.
            </p>
          </div>
          <div className="no-print flex flex-wrap items-center gap-3">
            <CurrencySwitcher />
            {items.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex h-10 items-center gap-1.5 rounded-[6px] border border-[#E3E8EA] bg-white px-3.5 text-[13px] font-medium text-[#171C20] hover:border-[#162C35]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex h-10 items-center gap-1.5 rounded-[6px] border border-[#E3E8EA] bg-white px-3.5 text-[13px] font-medium text-[#171C20] hover:border-[#162C35]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / PDF</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Submission Result Banner */}
        {submitResult && (
          <div
            ref={resultBannerRef}
            role="status"
            data-testid="quote-submit-result"
            className="mt-8 rounded-[6px] border border-[#162C35]/25 bg-[#F4F6F7] p-5 sm:p-6"
          >
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#162C35]">
              {submitResult.deliveredByEmail
                ? 'QUOTATION REQUEST TRANSMITTED'
                : 'DEVELOPMENT PREVIEW RECORDED — EMAIL NOT CONFIGURED'}
            </p>
            <h2 className="mt-2 text-[19px] font-semibold text-[#171C20]">
              Reference {submitResult.referenceId}
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#4E5A61]">
              {submitResult.message}
            </p>
            {!submitResult.deliveredByEmail && (
              <p className="mt-3 text-[13px] text-[#4E5A61]">
                To enable live email dispatch in production, set{' '}
                <code className="font-mono text-[12px] text-[#171C20]">
                  RESEND_API_KEY
                </code>{' '}
                and{' '}
                <code className="font-mono text-[12px] text-[#171C20]">
                  INQUIRY_RECIPIENT_EMAIL
                </code>{' '}
                in your server environment variables. No payment or binding order
                has been placed.
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-[#162C35] px-4 text-[13px] font-medium text-white hover:bg-[#0F2027]"
              >
                <Download className="h-4 w-4" />
                <span>Download Quote CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  clearQuote();
                  setSubmitResult(null);
                }}
                className="text-[13px] font-medium text-[#4E5A61] underline underline-offset-4 hover:text-[#171C20]"
              >
                Clear saved list
              </button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-10 rounded-[6px] border border-[#E3E8EA] bg-[#F4F6F7] px-6 py-16 text-center">
            <h2 className="text-[19px] font-semibold text-[#171C20]">
              Your quotation list is currently empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-[#4E5A61]">
              Browse our instrument catalog to add SKUs, select lengths or tip
              configurations, and compile an itemized B2B quotation inquiry.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#162C35] px-6 text-[14px] font-medium text-white hover:bg-[#0F2027]"
              >
                <span>Explore Instruments</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-11 items-center rounded-[6px] border border-[#E3E8EA] bg-white px-6 text-[14px] font-medium text-[#171C20] hover:border-[#A8B5B9]"
              >
                General Inquiry
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left: Saved Instruments List */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between border-b border-[#E3E8EA] pb-3">
                <h2 className="text-[14px] font-semibold text-[#171C20]">
                  Selected Instruments ({summary.lineCount})
                </h2>
                <button
                  type="button"
                  onClick={clearQuote}
                  className="no-print text-[12px] text-[#6C7880] hover:text-[#171C20] hover:underline"
                >
                  Remove all
                </button>
              </div>

              <ul className="divide-y divide-[#E3E8EA] border-b border-[#E3E8EA]">
                {items.map((item) => {
                  const unitAmount = siteConfig.pricing.showSamplePrices
                    ? getAmountForCurrency(item.unitPrice, currency)
                    : null;
                  const lineTotal =
                    unitAmount !== null ? unitAmount * item.quantity : null;

                  return (
                    <li
                      key={item.key}
                      className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <Link
                          to={`/products/${item.productSlug}`}
                          className="w-20 shrink-0 overflow-hidden rounded-[4px] border border-[#E3E8EA]"
                        >
                          <StudioImage
                            src={item.image}
                            alt={item.productName}
                            aspectClass="aspect-[4/3]"
                            sizes="80px"
                          />
                        </Link>
                        <div className="min-w-0">
                          <span className="font-mono text-[11px] tabular-nums text-[#6C7880]">
                            {item.sku}
                          </span>
                          <h3 className="mt-0.5 text-[15px] font-semibold text-[#171C20]">
                            <Link
                              to={`/products/${item.productSlug}`}
                              className="hover:text-[#162C35]"
                            >
                              {item.productName}
                            </Link>
                          </h3>
                          {item.variantLabel && (
                            <p className="mt-0.5 text-[13px] text-[#4E5A61]">
                              {item.variantLabel}
                            </p>
                          )}
                          <p className="mt-1 font-mono text-[12px] tabular-nums text-[#4E5A61]">
                            {unitAmount !== null
                              ? `${formatCurrency(unitAmount, currency)} / unit${item.isDemo ? ' (DEMO)' : ''}`
                              : 'Request pricing'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:flex-nowrap sm:justify-end sm:gap-4">
                        <div className="no-print flex h-11 items-center rounded-[5px] border border-[#E3E8EA] bg-white sm:h-10">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${item.productName}`}
                            onClick={() =>
                              updateQuantity(item.key, item.quantity - 1)
                            }
                            className="btn-press inline-flex h-full w-10 items-center justify-center text-[#4E5A61] hover:text-[#171C20] sm:w-9"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <label
                            htmlFor={`qty-${item.key}`}
                            className="sr-only"
                          >
                            Quantity for {item.productName}
                          </label>
                          <input
                            id={`qty-${item.key}`}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={100000}
                            value={item.quantity}
                            onChange={(e) => {
                              const parsed = parseInt(e.target.value, 10);
                              if (!Number.isNaN(parsed) && parsed >= 1) {
                                updateQuantity(item.key, parsed);
                              }
                            }}
                            className="h-full w-12 bg-transparent text-center font-mono text-[13px] tabular-nums text-[#171C20] focus:outline-none sm:w-14"
                          />
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${item.productName}`}
                            onClick={() =>
                              updateQuantity(item.key, item.quantity + 1)
                            }
                            className="btn-press inline-flex h-full w-10 items-center justify-center text-[#4E5A61] hover:text-[#171C20] sm:w-9"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="min-w-[76px] text-right font-mono text-[13px] font-medium tabular-nums text-[#171C20] sm:w-28">
                            {lineTotal !== null
                              ? formatCurrency(lineTotal, currency)
                              : 'Quoted'}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            aria-label={`Remove ${item.productName} from quotation list`}
                            className="btn-press no-print inline-flex h-11 w-11 items-center justify-center rounded-[5px] text-[#6C7880] hover:bg-[#F4F6F7] hover:text-[#171C20] sm:h-9 sm:w-9"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Non-binding Summary Box */}
              <div className="mt-6 rounded-[6px] border border-[#E3E8EA] bg-[#F4F6F7] p-5">
                <div className="flex items-center justify-between text-[13px] text-[#4E5A61]">
                  <span>Total Line Items / Units</span>
                  <span className="font-mono tabular-nums text-[#171C20]">
                    {summary.lineCount} lines · {summary.totalUnits} units
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between border-t border-[#E3E8EA] pt-3">
                  <span className="text-[14px] font-medium text-[#171C20]">
                    Non-Binding Estimate ({currency})
                  </span>
                  <span className="font-mono text-[18px] font-semibold tabular-nums text-[#171C20]">
                    {summary.estimatedTotal !== null
                      ? formatCurrency(summary.estimatedTotal, currency)
                      : 'Quoted on review'}
                  </span>
                </div>
                <p className="mt-2.5 text-[12px] leading-relaxed text-[#6C7880]">
                  {summary.unpricedLineCount > 0
                    ? `${summary.unpricedLineCount} ${summary.unpricedLineCount === 1 ? 'item requires' : 'items require'} custom pricing and ${summary.unpricedLineCount === 1 ? 'is' : 'are'} excluded from the subtotal above. `
                    : ''}
                  This summary is a non-binding estimate excluding freight,
                  insurance, customs duties, and custom OEM tooling. Formal
                  pricing is issued on proforma review.
                  {summary.containsDemoPricing
                    ? ' Sample DEMO pricing is active.'
                    : ''}
                </p>
              </div>
            </div>

            {/* Right: RFQ Submission Form */}
            <div className="no-print lg:col-span-5">
              <div className="rounded-[6px] border border-[#E3E8EA] bg-white p-6 sm:p-7">
                <h2 className="text-[18px] font-semibold text-[#171C20]">
                  Submit Quotation Request
                </h2>
                <p className="mt-1.5 text-[13px] text-[#4E5A61]">
                  Provide your procurement contact details. No payment is
                  collected online.
                </p>

                {formError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-[5px] border border-[#8A2C2C]/30 bg-[#FDF5F5] px-4 py-3 text-[13px] text-[#7A2323]"
                  >
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
                  {/* Anti-spam honeypot field */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="quote-website">Website</label>
                    <input
                      id="quote-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quote-name"
                      className="block text-[13px] font-medium text-[#171C20]"
                    >
                      Contact Name <span className="text-[#6C7880]">*</span>
                    </label>
                    <input
                      id="quote-name"
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
                      htmlFor="quote-email"
                      className="block text-[13px] font-medium text-[#171C20]"
                    >
                      Business Email <span className="text-[#6C7880]">*</span>
                    </label>
                    <input
                      id="quote-email"
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="quote-company"
                        className="block text-[13px] font-medium text-[#171C20]"
                      >
                        Company / Hospital <span className="text-[#6C7880]">*</span>
                      </label>
                      <input
                        id="quote-company"
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
                        htmlFor="quote-country"
                        className="block text-[13px] font-medium text-[#171C20]"
                      >
                        Country <span className="text-[#6C7880]">*</span>
                      </label>
                      <input
                        id="quote-country"
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
                      htmlFor="quote-phone"
                      className="block text-[13px] font-medium text-[#171C20]"
                    >
                      Phone / WhatsApp <span className="text-[#6C7880]">*</span>
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+49 / +92 ..."
                      aria-invalid={Boolean(fieldErrors.phone)}
                      className="mt-1.5 h-11 w-full rounded-[6px] border border-[#E3E8EA] px-3.5 text-[14px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-[12px] text-[#8A2C2C]">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quote-message"
                      className="block text-[13px] font-medium text-[#171C20]"
                    >
                      Specifications, Marking, or Delivery Notes (Optional)
                    </label>
                    <textarea
                      id="quote-message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Target Incoterms (FOB / CIF), private-label laser etching, packaging format..."
                      className="mt-1.5 w-full rounded-[6px] border border-[#E3E8EA] p-3 text-[14px] text-[#171C20] focus:border-[#162C35] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-press inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#162C35] px-6 text-[14px] font-medium text-white hover:bg-[#0F2027] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting && (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    )}
                    <span>
                      {submitting
                        ? 'Submitting Quotation Request...'
                        : 'Request Formal Quotation'}
                    </span>
                  </button>

                  {whatsappUrl && isSafeHref(whatsappUrl) && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[6px] border border-[#E3E8EA] bg-white px-4 text-[13px] font-medium text-[#171C20] hover:border-[#162C35]"
                    >
                      <span>Open Formatted WhatsApp Inquiry</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <p className="text-[12px] leading-relaxed text-[#6C7880]">
                    By submitting this request you agree to our{' '}
                    <Link to="/privacy" className="underline hover:text-[#171C20]">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link to="/terms" className="underline hover:text-[#171C20]">
                      Inquiry Conditions
                    </Link>
                    .
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

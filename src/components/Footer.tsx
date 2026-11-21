import { Link } from 'react-router-dom';
import { siteConfig } from '../config/site';
import { isSafeHref } from '../lib/url-safety';

export function Footer() {
  const year = new Date().getFullYear();
  const { brand, contact } = siteConfig;

  const whatsappHref = contact.whatsappNumber
    ? `https://wa.me/${contact.whatsappNumber.replace(/[^\d]/g, '')}`
    : null;

  return (
    <footer className="border-t border-[#E3E8EA] bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          {/* Left: Brand Identity */}
          <div className="md:col-span-4">
            <Link
              to="/"
              className="inline-block text-[18px] font-semibold tracking-[0.22em] text-[#171C20]"
            >
              {brand.wordmark}
            </Link>
            <p className="mt-3 text-[14px] text-[#4E5A61]">
              Precision Surgical Manufacturing
            </p>
            <p className="mt-1 text-[14px] text-[#6C7880]">{brand.location}</p>
            {brand.isDemoBrand && (
              <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-[#6C7880]">
                Demonstration storefront configuration. Replace brand, catalog,
                and contact settings in centralized configuration before launch.
              </p>
            )}
          </div>

          {/* Middle: Primary Navigation */}
          <nav
            aria-label="Footer navigation"
            className="md:col-span-4 md:justify-self-center"
          >
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
              Navigation
            </p>
            <ul className="mt-4 space-y-2.5">
              {siteConfig.navigation.footer.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="editorial-link text-[14px] text-[#171C20] transition-colors hover:text-[#162C35]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/quote"
                  className="editorial-link text-[14px] text-[#171C20] transition-colors hover:text-[#162C35]"
                >
                  Quotation List
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right: Configurable Contact */}
          <div className="md:col-span-4 md:justify-self-end">
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
              Direct Contact
              {contact.isDemoContact ? ' · Demo' : ''}
            </p>
            <ul className="mt-4 space-y-2.5 text-[14px] text-[#171C20]">
              {contact.email && isSafeHref(`mailto:${contact.email}`) && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="editorial-link text-[#171C20] hover:text-[#162C35]"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && isSafeHref(`tel:${contact.phone}`) && (
                <li>
                  <a
                    href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
                    className="editorial-link font-mono text-[13px] tabular-nums text-[#4E5A61] hover:text-[#171C20]"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {whatsappHref && isSafeHref(whatsappHref) && (
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="editorial-link text-[#4E5A61] hover:text-[#171C20]"
                  >
                    WhatsApp Desk
                  </a>
                </li>
              )}
              {contact.streetAddress && (
                <li className="text-[13px] text-[#6C7880]">
                  {contact.streetAddress}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#E3E8EA] pt-6 text-[13px] text-[#6C7880] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>
              © {year} {brand.fullName}
            </span>
            <Link to="/privacy" className="hover:text-[#171C20]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#171C20]">
              Terms & Inquiry Conditions
            </Link>
          </div>
          <p className="text-[13px] text-[#6C7880]">Made in Sialkot, Pakistan.</p>
        </div>
      </div>
    </footer>
  );
}

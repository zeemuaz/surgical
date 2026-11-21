import type { SiteConfig } from '../types/catalog';

/**
 * Centralized White-Label Site Configuration
 * ---------------------------------------------------------------------------
 * Replace values in this single file to adapt the storefront for an actual
 * surgical or dental instrument manufacturer in Sialkot or elsewhere.
 *
 * Honesty & Verification Rules:
 * - `isDemoBrand`, `isDemoPricing`, and `isDemoContact` control clear,
 *   unobtrusive DEMO labels so sample values are never presented as verified
 *   client truths.
 * - Leave `foundingYear`, `whatsappNumber`, `streetAddress`, `mapUrl`, and
 *   `certifications` null/empty until verified client documentation exists.
 */
export const siteConfig: SiteConfig = {
  brand: {
    wordmark: 'AUREN',
    fullName: 'AUREN Instruments',
    descriptor: 'Surgical & Dental Instrument Manufacturing',
    location: 'Sialkot, Pakistan',
    country: 'Pakistan',
    foundingYear: null,
    isDemoBrand: true,
  },
  pricing: {
    showSamplePrices: true,
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'PKR'],
    isDemoPricing: true,
    currencyNote:
      'Sample unit values shown in USD and PKR are static demonstration figures for catalog preview and do not reflect live exchange rates or binding export quotations.',
  },
  oem: {
    offered: true,
    headline: 'Your Specifications. Our Craft.',
    summary:
      'OEM manufacturing, private-label laser marking, and specification-matched production runs structured for international distributors and medical brands.',
    services: [
      'Private-label laser etching and pattern numbering',
      'Custom instrument sets assembled to hospital tender lists',
      'Material and surface finish specification matching',
      'Export-ready individual pouch and tray packaging options',
    ],
  },
  contact: {
    email: 'inquiries@auren-demo.example',
    phone: '+92 (0) 52 000 0000',
    whatsappNumber: null, // Configure digits with country code (e.g. "923001234567") to enable direct WhatsApp RFQ links
    streetAddress: null, // Add verified factory street address only when confirmed by the client
    mapUrl: null, // Add verified https://maps.google.com/... URL once facility address is confirmed
    businessHours: 'Monday – Saturday, 09:00 – 18:00 PKT (UTC+5)',
    isDemoContact: true,
  },
  // Populate strictly with verified certificates held by the manufacturer.
  certifications: [],
  navigation: {
    header: [
      { label: 'Products', to: '/products', hasCategoryMenu: true },
      { label: 'Manufacturing', to: '/manufacturing' },
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
    footer: [
      { label: 'Products', to: '/products' },
      { label: 'Manufacturing', to: '/manufacturing' },
      { label: 'About', to: '/about' },
      { label: 'Catalog', to: '/catalog' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  media: {
    heroImage: '/src/assets/images/hero_surgical_editorial_1795254584538.jpg',
    heroImageAlt:
      'Brushed stainless-steel Metzenbaum dissecting scissors, Adson tissue forceps, and Kelly hemostatic clamp arranged on a pearl-gray clinical surface',
    manufacturingHeroImage:
      '/src/assets/images/manufacturing_precision_craft_1795254586098.jpg',
    manufacturingHeroAlt:
      'Precision finishing and dimensional inspection of surgical stainless-steel clamps on a steel metrology bench with vernier caliper and loupe',
    aboutSecondaryImage:
      '/src/assets/images/cat_instrument_sets_1795254592195.jpg',
    aboutSecondaryAlt:
      'Perforated stainless-steel surgical sterilization tray containing aligned hemostatic forceps, scissors, and tissue forceps',
    isProvisionalPhotography: true,
  },
  seo: {
    defaultTitle: 'AUREN Instruments — Surgical & Dental Instrument Manufacturing',
    titleTemplate: '%s | AUREN Instruments',
    defaultDescription:
      'Precision surgical and dental instruments manufactured in Sialkot, Pakistan for international distributors, hospital procurement teams, and OEM private-label partners.',
    locale: 'en_US',
  },
};

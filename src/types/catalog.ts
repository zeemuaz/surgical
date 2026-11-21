export type CurrencyCode = 'USD' | 'PKR';

export interface MoneyAmounts {
  /** Static figure per currency — never implied as a live FX conversion. */
  USD?: number;
  PKR?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  label: string;
  lengthMm?: number;
  tipStyle?: string;
  finish?: string;
  /** Optional variant-specific unit price. Null/undefined falls back to parent or Request Pricing. */
  price?: MoneyAmounts | null;
}

export interface ProductImage {
  src: string;
  alt: string;
  caption?: string;
  isProvisional?: boolean;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  categorySlug: string;
  shortSpec: string;
  summary: string;
  material: string;
  finish: string;
  lengthLabel: string;
  reusability?: string;
  sterilizationNote?: string;
  /**
   * Direct unit price if product has uniform pricing.
   * Leave null/undefined to derive "From" pricing from variants or display "Request pricing".
   */
  price: MoneyAmounts | null;
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  images: ProductImage[];
  /** Only populate when a real specification PDF exists in /public/specs/. */
  specPdfUrl?: string | null;
  featured: boolean;
  isDemo: boolean;
}

export interface Category {
  slug: string;
  name: string;
  shortDescription: string;
  image: string;
  imageAlt: string;
  featuredOrder: number;
  isDemo: boolean;
}

export interface CatalogDocument {
  id: string;
  title: string;
  discipline: string;
  fileSize: string;
  pageCount?: number;
  updatedYear?: string;
  pdfUrl: string;
  coverImage?: string;
}

export interface ManufacturingStage {
  index: string;
  title: string;
  summary: string;
  details: string[];
  enabled: boolean;
  isDemoContent: boolean;
}

export interface CertificationRecord {
  name: string;
  issuer: string;
  certificateNumber: string;
  validUntil?: string;
  documentUrl?: string;
}

export interface QuoteItem {
  key: string;
  productId: string;
  productSlug: string;
  productName: string;
  sku: string;
  categorySlug: string;
  variantId?: string;
  variantLabel?: string;
  image: string;
  quantity: number;
  unitPrice: MoneyAmounts | null;
  isDemo: boolean;
}

export interface SiteConfig {
  brand: {
    wordmark: string;
    fullName: string;
    descriptor: string;
    location: string;
    country: string;
    /** Leave null to hide founding-year statements until verified by the manufacturer. */
    foundingYear: number | null;
    isDemoBrand: boolean;
  };
  pricing: {
    showSamplePrices: boolean;
    defaultCurrency: CurrencyCode;
    supportedCurrencies: CurrencyCode[];
    isDemoPricing: boolean;
    currencyNote: string;
  };
  oem: {
    offered: boolean;
    headline: string;
    summary: string;
    services: string[];
  };
  contact: {
    /** Set real verified values before production launch. */
    email: string | null;
    phone: string | null;
    /** Digits only with country code, e.g. "923001234567". Leave null when unconfigured. */
    whatsappNumber: string | null;
    streetAddress: string | null;
    /** Only provide a verified Google Maps URL when an actual facility address is configured. */
    mapUrl: string | null;
    businessHours: string;
    isDemoContact: boolean;
  };
  certifications: CertificationRecord[];
  navigation: {
    header: Array<{ label: string; to: string; hasCategoryMenu?: boolean }>;
    footer: Array<{ label: string; to: string }>;
  };
  media: {
    heroImage: string;
    heroImageAlt: string;
    manufacturingHeroImage: string;
    manufacturingHeroAlt: string;
    aboutSecondaryImage: string;
    aboutSecondaryAlt: string;
    isProvisionalPhotography: boolean;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    locale: string;
  };
}

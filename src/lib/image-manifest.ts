export interface ResponsiveImageAsset {
  /** Intrinsic pixel width of the master image */
  width: number;
  /** Intrinsic pixel height of the master image */
  height: number;
  /** Responsive WebP srcset (600w for cards/mobile, 1200w for hero/retina) */
  webpSrcSet: string;
  /** Largest WebP source (useful for preload links) */
  webpLarge: string;
  /** Compact WebP source for thumbnails and mobile cards */
  webpSmall: string;
}

const OPTIMIZED_LOCAL_IMAGES: ReadonlySet<string> = new Set([
  '/src/assets/images/hero_surgical_editorial_1795254584538.jpg',
  '/src/assets/images/cat_general_surgery_1795254590012.jpg',
  '/src/assets/images/cat_dental_instruments_1795254588695.jpg',
  '/src/assets/images/cat_orthopedic_instruments_1795254583662.jpg',
  '/src/assets/images/cat_ent_instruments_1795254585109.jpg',
  '/src/assets/images/cat_diagnostic_instruments_1795254584566.jpg',
  '/src/assets/images/cat_instrument_sets_1795254592195.jpg',
  '/src/assets/images/product_needle_holder_1795254588102.jpg',
  '/src/assets/images/product_retractor_scalpel_1795254591748.jpg',
  '/src/assets/images/manufacturing_precision_craft_1795254586098.jpg',
]);

/**
 * Resolves pre-generated responsive WebP variants for bundled local studio photography.
 * Returns null for external URLs or custom client images added later so <img> safely
 * renders the provided src directly without broken variant requests.
 */
export function getResponsiveImageAsset(src: string): ResponsiveImageAsset | null {
  if (!src || !OPTIMIZED_LOCAL_IMAGES.has(src)) {
    return null;
  }

  const base = src.slice(0, -'.jpg'.length);
  const webpSmall = `${base}-600.webp`;
  const webpLarge = `${base}-1200.webp`;

  return {
    width: 1200,
    height: 896,
    webpSmall,
    webpLarge,
    webpSrcSet: `${webpSmall} 600w, ${webpLarge} 1200w`,
  };
}

export const HERO_PRELOAD_WEBP_600 =
  '/src/assets/images/hero_surgical_editorial_1795254584538-600.webp';
export const HERO_PRELOAD_WEBP_1200 =
  '/src/assets/images/hero_surgical_editorial_1795254584538-1200.webp';

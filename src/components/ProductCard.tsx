import { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus } from 'lucide-react';
import { siteConfig } from '../config/site';
import { useQuote } from '../context/QuoteContext';
import { resolveProductPriceDisplay } from '../lib/catalog-utils';
import type { Product } from '../types/catalog';
import { StudioImage } from './StudioImage';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  priority = false,
}: ProductCardProps) {
  const { currency, addToQuote } = useQuote();
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const priceDisplay = resolveProductPriceDisplay(
    product,
    currency,
    siteConfig.pricing.showSamplePrices,
  );

  const handleQuickAdd = () => {
    addToQuote(product, { variant: product.variants[0] ?? null, quantity: 1 });
    setJustAdded(true);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setJustAdded(false);
      timerRef.current = null;
    }, 1500);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[6px] border border-[#E3E8EA] bg-white transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#A8B5B9] hover:bg-[#FCFDFD] hover:shadow-[0_10px_28px_rgba(23,28,32,0.05)]">
      <Link
        to={`/products/${product.slug}`}
        className="block focus-visible:outline-offset-[-2px]"
      >
        <StudioImage
          src={product.images[0]?.src ?? ''}
          alt={product.images[0]?.alt ?? product.name}
          aspectClass="aspect-[4/3]"
          sizes="(min-width: 1280px) 380px, (min-width: 640px) 46vw, 94vw"
          priority={priority}
          hoverZoom
          fallbackLabel={product.name}
        />
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-mono text-[11px] tracking-[0.06em] tabular-nums text-[#6C7880]">
            {product.sku}
          </span>
          {product.variants.length > 1 && (
            <span className="shrink-0 text-[11px] text-[#6C7880]">
              {product.variants.length} variations
            </span>
          )}
        </div>

        <h3 className="mt-2 text-[15px] font-semibold leading-snug text-[#171C20] sm:text-[16px]">
          <Link
            to={`/products/${product.slug}`}
            className="editorial-link !inline text-[#171C20] transition-colors group-hover:text-[#162C35]"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mb-5 mt-1.5 text-[13px] leading-relaxed text-[#4E5A61]">
          {product.shortSpec}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#E3E8EA] pt-4">
          <div className="min-w-0">
            <div className="truncate font-mono text-[13px] font-medium tabular-nums text-[#171C20]">
              {priceDisplay.formatted}
            </div>
            {priceDisplay.kind !== 'request' && priceDisplay.isDemo && (
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.12em] uppercase text-[#6C7880]">
                DEMO · Non-binding
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to quotation list`}
            className={`btn-press inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[5px] border px-3.5 text-[12px] font-medium sm:h-9 sm:px-3 ${
              justAdded
                ? 'border-[#162C35] bg-[#162C35] text-white'
                : 'border-[#E3E8EA] bg-white text-[#171C20] hover:border-[#162C35] hover:bg-[#162C35] hover:text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                <span>Quote</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});

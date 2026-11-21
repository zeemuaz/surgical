import { siteConfig } from '../config/site';
import { useQuote } from '../context/QuoteContext';
import type { CurrencyCode } from '../types/catalog';

interface CurrencySwitcherProps {
  className?: string;
}

export function CurrencySwitcher({ className = '' }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useQuote();

  return (
    <div
      role="group"
      aria-label="Select display currency"
      className={`inline-flex items-center rounded-[5px] border border-[#E3E8EA] bg-[#F4F6F7] p-0.5 ${className}`}
    >
      {siteConfig.pricing.supportedCurrencies.map((code: CurrencyCode) => {
        const active = currency === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => setCurrency(code)}
            className={`btn-press h-8 whitespace-nowrap rounded-[4px] px-3 font-mono text-[11px] font-medium sm:h-7 sm:px-2.5 ${
              active
                ? 'bg-white text-[#171C20] shadow-[0_1px_3px_rgba(23,28,32,0.08)]'
                : 'text-[#4E5A61] hover:text-[#171C20]'
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

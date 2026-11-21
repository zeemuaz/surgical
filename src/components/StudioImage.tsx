import { useEffect, useState } from 'react';
import { getResponsiveImageAsset } from '../lib/image-manifest';

interface StudioImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  /** Responsive sizes hint for WebP srcset selection */
  sizes?: string;
  priority?: boolean;
  hoverZoom?: boolean;
  /** Gentle settle-in scale transition on hero/feature imagery */
  subtleReveal?: boolean;
  fallbackLabel?: string;
}

export function StudioImage({
  src,
  alt,
  className = '',
  aspectClass = 'aspect-[4/3]',
  sizes = '(min-width: 1280px) 420px, (min-width: 640px) 48vw, 94vw',
  priority = false,
  hoverZoom = false,
  subtleReveal = false,
  fallbackLabel,
}: StudioImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(priority);

  useEffect(() => {
    setFailed(false);
    setLoaded(priority);
  }, [src, priority]);

  const responsive = getResponsiveImageAsset(src);

  const imageClasses = [
    'h-full w-full object-cover will-change-transform',
    hoverZoom
      ? 'transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]'
      : subtleReveal
        ? 'transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]'
        : 'transition-opacity duration-300 ease-out',
    !priority && !loaded ? 'opacity-0' : 'opacity-100',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`relative overflow-hidden bg-[#F4F6F7] ${aspectClass} ${className}`}
    >
      {!failed && src ? (
        <picture className="block h-full w-full">
          {responsive && (
            <source
              type="image/webp"
              srcSet={responsive.webpSrcSet}
              sizes={sizes}
            />
          )}
          <img
            src={src}
            alt={alt}
            width={responsive?.width ?? 1200}
            height={responsive?.height ?? 896}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding={priority ? 'sync' : 'async'}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={imageClasses}
          />
        </picture>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center border border-[#E3E8EA] bg-[#F4F6F7] px-6 text-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="mb-3 h-8 w-8 text-[#A8B5B9]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          >
            <line x1="8" y1="40" x2="40" y2="8" />
            <circle cx="14" cy="34" r="4" />
            <circle cx="34" cy="14" r="4" />
          </svg>
          <span className="text-xs font-medium text-[#4E5A61]">
            {fallbackLabel || alt}
          </span>
        </div>
      )}
    </div>
  );
}

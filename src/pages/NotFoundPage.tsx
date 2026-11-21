import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageSeo } from '../lib/seo';

export function NotFoundPage() {
  usePageSeo({
    title: 'Page Not Found',
    description: 'The requested page or instrument reference could not be located.',
  });

  return (
    <div className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-xl">
          <p className="font-mono text-[12px] tracking-[0.14em] text-[#6C7880]">
            ERROR 404
          </p>
          <h1 className="mt-3 text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-tight text-[#171C20]">
            Page Not Found.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#4E5A61]">
            The instrument reference or page you requested is unavailable or has
            moved. Search the catalog or return to the homepage.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to="/products"
              className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#162C35] px-6 text-[14px] font-medium text-white hover:bg-[#0F2027]"
            >
              <span>Browse Instruments</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="editorial-link text-[14px] font-medium text-[#171C20]"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

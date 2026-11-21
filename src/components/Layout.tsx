import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import { useQuote } from '../context/QuoteContext';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { toast, dismissToast } = useQuote();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#171C20]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[6px] focus:bg-[#162C35] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        <div key={pathname} className="page-enter">
          {children}
        </div>
      </main>

      <Footer />

      {/* Quiet, non-intrusive animated quotation feedback toast */}
      <AnimatePresence>
        {toast && (
          <m.div
            key={toast.id}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="no-print fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-[6px] border border-white/10 bg-[#171C20] px-4 py-3 text-[13px] text-white shadow-[0_14px_34px_rgba(23,28,32,0.22)] sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-sm"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-[#A8B5B9]"
                strokeWidth={1.75}
              />
              <p className="leading-snug">{toast.message}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/quote"
                onClick={dismissToast}
                className="whitespace-nowrap font-medium text-[#D2DCDE] underline underline-offset-4 transition-colors hover:text-white"
              >
                View List
              </Link>
              <button
                type="button"
                onClick={dismissToast}
                aria-label="Dismiss notification"
                className="inline-flex h-8 w-8 items-center justify-center rounded text-[#A8B5B9] transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

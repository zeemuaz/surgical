import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { QuoteProvider } from './context/QuoteContext';
import { HomePage } from './pages/HomePage';

// Route-level code splitting: keep homepage bundle lean (excludes zod, secondary pages, etc.)
const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);
const CategoryPage = lazy(() =>
  import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })),
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({
    default: m.ProductDetailPage,
  })),
);
const ManufacturingPage = lazy(() =>
  import('./pages/ManufacturingPage').then((m) => ({
    default: m.ManufacturingPage,
  })),
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const QuotePage = lazy(() =>
  import('./pages/QuotePage').then((m) => ({ default: m.QuotePage })),
);
const CatalogPage = lazy(() =>
  import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage })),
);
const PrivacyPage = lazy(() =>
  import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function RouteFallback() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading section"
      className="mx-auto min-h-[60vh] max-w-[1440px] px-5 pt-12 sm:px-8 lg:px-12"
    />
  );
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <QuoteProvider>
          <BrowserRouter>
            <Layout>
              <ErrorBoundary>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route
                      path="/products/:slug"
                      element={<ProductDetailPage />}
                    />
                    <Route
                      path="/categories/:slug"
                      element={<CategoryPage />}
                    />
                    <Route
                      path="/manufacturing"
                      element={<ManufacturingPage />}
                    />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/quote" element={<QuotePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Layout>
          </BrowserRouter>
        </QuoteProvider>
      </LazyMotion>
    </MotionConfig>
  );
}

export default App;

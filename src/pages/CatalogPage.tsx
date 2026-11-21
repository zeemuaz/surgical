import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, FileText } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { StudioImage } from '../components/StudioImage';
import { catalogDocuments } from '../data/catalogs';
import { isSafeHref } from '../lib/url-safety';
import { usePageSeo } from '../lib/seo';

export function CatalogPage() {
  const [selectedDiscipline, setSelectedDiscipline] = useState('');

  usePageSeo({
    title: 'Digital Catalogs & PDF Library',
    description:
      'Access downloadable surgical and dental instrument PDF catalogs or request discipline-specific product documentation.',
    canonicalPath: '/catalog',
  });

  const disciplines = useMemo(
    () =>
      Array.from(new Set(catalogDocuments.map((doc) => doc.discipline))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [],
  );

  const visibleDocs = useMemo(
    () =>
      selectedDiscipline
        ? catalogDocuments.filter((d) => d.discipline === selectedDiscipline)
        : catalogDocuments,
    [selectedDiscipline],
  );

  return (
    <div className="bg-white pb-24 pt-8 lg:pt-12">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: 'Digital Catalog' }]}
        />

        <div className="border-b border-[#E3E8EA] pb-8">
          <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
            DOCUMENTATION LIBRARY
          </p>
          <h1 className="mt-3 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-tight text-[#171C20]">
            Digital Catalogs
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#4E5A61]">
            Downloadable PDF catalogs organized by clinical discipline for
            offline procurement review and tender specification matching.
          </p>
        </div>

        {catalogDocuments.length === 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="rounded-[6px] border border-[#E3E8EA] bg-[#F4F6F7] p-8 sm:p-10 lg:col-span-8">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#E3E8EA] bg-white text-[#162C35]">
                <FileText className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="mt-5 text-[20px] font-semibold text-[#171C20]">
                Official PDF Catalogs Not Yet Published
              </h2>
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#4E5A61]">
                No verified manufacturer PDF brochures have been attached to
                this demonstration configuration. Rather than distributing
                placeholder PDFs, you can browse the live online catalog,
                compile a quotation list with CSV export, or request a
                discipline-specific PDF package directly.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#162C35] px-5 text-[14px] font-medium text-white hover:bg-[#0F2027]"
                >
                  <span>Browse Online Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact?interest=PDF%20Catalog%20Request"
                  className="inline-flex h-11 items-center rounded-[6px] border border-[#E3E8EA] bg-white px-5 text-[14px] font-medium text-[#171C20] hover:border-[#162C35]"
                >
                  Request Discipline PDF
                </Link>
              </div>
            </div>

            <div className="rounded-[6px] border border-[#E3E8EA] bg-white p-6 sm:p-8 lg:col-span-4">
              <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#6C7880]">
                For Site Administrators
              </p>
              <h3 className="mt-2.5 text-[16px] font-semibold text-[#171C20]">
                Adding Real Catalog PDFs
              </h3>
              <ol className="mt-4 space-y-3 text-[13px] leading-relaxed text-[#4E5A61]">
                <li>
                  1. Place verified PDF files inside{' '}
                  <code className="font-mono text-[12px] text-[#171C20]">
                    public/catalogs/
                  </code>
                  .
                </li>
                <li>
                  2. Register each title, discipline, file size, and path in{' '}
                  <code className="font-mono text-[12px] text-[#171C20]">
                    src/data/catalogs.ts
                  </code>
                  .
                </li>
                <li>
                  3. Rebuild to publish immediate download cards and discipline
                  filters.
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            {disciplines.length > 1 && (
              <div className="mb-8 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDiscipline('')}
                  className={`h-9 rounded-[5px] border px-3.5 text-[13px] font-medium transition-colors ${
                    selectedDiscipline === ''
                      ? 'border-[#162C35] bg-[#162C35] text-white'
                      : 'border-[#E3E8EA] bg-white text-[#4E5A61] hover:text-[#171C20]'
                  }`}
                >
                  All Disciplines
                </button>
                {disciplines.map((disc) => (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => setSelectedDiscipline(disc)}
                    className={`h-9 rounded-[5px] border px-3.5 text-[13px] font-medium transition-colors ${
                      selectedDiscipline === disc
                        ? 'border-[#162C35] bg-[#162C35] text-white'
                        : 'border-[#E3E8EA] bg-white text-[#4E5A61] hover:text-[#171C20]'
                    }`}
                  >
                    {disc}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleDocs.map((doc) => (
                <article
                  key={doc.id}
                  className="flex flex-col overflow-hidden rounded-[6px] border border-[#E3E8EA] bg-white"
                >
                  {doc.coverImage && (
                    <StudioImage
                      src={doc.coverImage}
                      alt={doc.title}
                      aspectClass="aspect-[4/3]"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="text-[12px] text-[#6C7880]">
                      <span>{doc.discipline}</span>
                      {doc.fileSize && (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono tabular-nums">
                            {doc.fileSize}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="mt-2 text-[17px] font-semibold text-[#171C20]">
                      {doc.title}
                    </h2>
                    <div className="mt-auto pt-5">
                      {isSafeHref(doc.pdfUrl) && (
                        <a
                          href={doc.pdfUrl}
                          download
                          className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-[#162C35] px-4 text-[13px] font-medium text-white hover:bg-[#0F2027]"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download PDF</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

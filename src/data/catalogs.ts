import type { CatalogDocument } from '../types/catalog';

/**
 * Digital Catalog Library
 * ---------------------------------------------------------------------------
 * Intentionally empty in demonstration mode so no fabricated PDF brochures or
 * unverified certificates are presented as official manufacturer documents.
 *
 * To publish real PDF catalogs:
 * 1. Place verified PDF files in `/public/catalogs/` (e.g. `general-surgery-2026.pdf`).
 * 2. Add matching entries to the array below with exact file size and path.
 *
 * Example entry:
 * {
 *   id: 'cat-general-surgery-2026',
 *   title: 'General Surgery Instruments Catalog',
 *   discipline: 'General Surgery',
 *   fileSize: '8.4 MB',
 *   pageCount: 142,
 *   updatedYear: '2026',
 *   pdfUrl: '/catalogs/general-surgery-2026.pdf',
 *   coverImage: '/src/assets/images/cat_general_surgery_1795254590012.jpg',
 * }
 */
export const catalogDocuments: CatalogDocument[] = [];

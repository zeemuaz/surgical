import { z } from 'zod';

// ---------------------------------------------------------------------------
// Safe Catalog Import Validation (JSON & CSV) — Server / Importer only
// Kept separate from catalog-utils.ts so client catalog pages never bundle zod.
// ---------------------------------------------------------------------------

export const catalogImportRowSchema = z.object({
  sku: z.string().trim().min(2).max(64),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  name: z.string().trim().min(2).max(160),
  categorySlug: z.string().trim().min(2).max(80),
  shortSpec: z.string().trim().min(2).max(180),
  summary: z.string().trim().min(5).max(800),
  material: z.string().trim().min(2).max(100),
  finish: z.string().trim().min(2).max(100),
  lengthLabel: z.string().trim().min(1).max(80),
  priceUsd: z.number().nonnegative().nullable().optional(),
  pricePkr: z.number().nonnegative().nullable().optional(),
  featured: z.boolean().optional().default(false),
});

export type CatalogImportRow = z.infer<typeof catalogImportRowSchema>;

export interface CatalogImportResult {
  valid: boolean;
  rows: CatalogImportRow[];
  errors: string[];
}

export function validateCatalogImportRows(
  rawRows: unknown[],
  allowedCategorySlugs?: string[],
): CatalogImportResult {
  const errors: string[] = [];
  const rows: CatalogImportRow[] = [];
  const seenSkus = new Set<string>();
  const seenSlugs = new Set<string>();

  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    return {
      valid: false,
      rows: [],
      errors: ['Import payload must contain at least one product row.'],
    };
  }

  rawRows.forEach((raw, idx) => {
    const parsed = catalogImportRowSchema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'row'}: ${issue.message}`)
        .join('; ');
      errors.push(`Row ${idx + 1}: ${issues}`);
      return;
    }

    const row = parsed.data;
    const skuKey = row.sku.toUpperCase();
    if (seenSkus.has(skuKey)) {
      errors.push(`Row ${idx + 1}: Duplicate SKU "${row.sku}".`);
      return;
    }
    seenSkus.add(skuKey);

    if (seenSlugs.has(row.slug)) {
      errors.push(`Row ${idx + 1}: Duplicate slug "${row.slug}".`);
      return;
    }
    seenSlugs.add(row.slug);

    if (allowedCategorySlugs && !allowedCategorySlugs.includes(row.categorySlug)) {
      errors.push(
        `Row ${idx + 1}: Unknown categorySlug "${row.categorySlug}". Expected one of: ${allowedCategorySlugs.join(', ')}.`,
      );
      return;
    }

    rows.push(row);
  });

  return {
    valid: errors.length === 0,
    rows,
    errors,
  };
}

export function parseCsvToRecords(csvText: string): Record<string, string>[] {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        cells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] ?? '';
    });
    return record;
  });
}

export function parseAndValidateCatalogCsv(
  csvText: string,
  allowedCategorySlugs?: string[],
): CatalogImportResult {
  const records = parseCsvToRecords(csvText);
  if (records.length === 0) {
    return {
      valid: false,
      rows: [],
      errors: ['CSV must contain a header row and at least one data row.'],
    };
  }

  const normalized = records.map((rec) => ({
    sku: rec.sku ?? '',
    slug: rec.slug ?? '',
    name: rec.name ?? '',
    categorySlug: rec.categorySlug ?? '',
    shortSpec: rec.shortSpec ?? '',
    summary: rec.summary ?? '',
    material: rec.material ?? '',
    finish: rec.finish ?? '',
    lengthLabel: rec.lengthLabel ?? '',
    priceUsd:
      rec.priceUsd !== undefined && rec.priceUsd !== ''
        ? Number(rec.priceUsd)
        : null,
    pricePkr:
      rec.pricePkr !== undefined && rec.pricePkr !== ''
        ? Number(rec.pricePkr)
        : null,
    featured: rec.featured?.toLowerCase() === 'true',
  }));

  return validateCatalogImportRows(normalized, allowedCategorySlugs);
}

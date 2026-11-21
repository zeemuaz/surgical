/**
 * Validates that dynamic external or internal links use only safe protocols.
 * Kept in a zero-dependency module so layout/footer and read-only pages never
 * pull heavy form validation libraries into the initial JavaScript bundle.
 */
export function isSafeHref(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) return true;
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === 'https:' ||
      parsed.protocol === 'mailto:' ||
      parsed.protocol === 'tel:'
    );
  } catch {
    return false;
  }
}

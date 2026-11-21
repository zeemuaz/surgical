import { z } from 'zod';
import type { CurrencyCode, QuoteItem } from '../types/catalog';

export const quoteLineItemPayloadSchema = z.object({
  sku: z.string().trim().min(1).max(64),
  productName: z.string().trim().min(1).max(160),
  variantLabel: z.string().trim().max(120).optional(),
  quantity: z.number().int().min(1).max(100000),
});

export const quoteInquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(120, 'Name is too long.'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid business email address.')
    .max(160),
  company: z
    .string()
    .trim()
    .min(2, 'Please enter your company or institution name.')
    .max(160),
  country: z
    .string()
    .trim()
    .min(2, 'Please enter your destination country.')
    .max(100),
  phone: z
    .string()
    .trim()
    .min(6, 'Please enter a valid phone or WhatsApp number.')
    .max(40),
  currency: z.enum(['USD', 'PKR']).default('USD'),
  message: z.string().trim().max(2000, 'Message cannot exceed 2000 characters.').optional().default(''),
  items: z
    .array(quoteLineItemPayloadSchema)
    .min(1, 'Add at least one instrument to request a quotation.')
    .max(100),
  /** Anti-spam honeypot field — must remain empty for legitimate users. */
  website: z.string().max(0, 'Spam verification failed.').optional().default(''),
});

export type QuoteInquiryPayload = z.infer<typeof quoteInquirySchema>;

export const contactInquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(120),
  email: z
    .string()
    .trim()
    .email('Please enter a valid business email address.')
    .max(160),
  company: z
    .string()
    .trim()
    .min(2, 'Please enter your company or hospital name.')
    .max(160),
  country: z
    .string()
    .trim()
    .min(2, 'Please enter your country.')
    .max(100),
  productInterest: z
    .string()
    .trim()
    .min(2, 'Please select or specify your product interest.')
    .max(160),
  message: z
    .string()
    .trim()
    .min(10, 'Please include a brief summary of your requirements (at least 10 characters).')
    .max(2500),
  /** Anti-spam honeypot field — must remain empty for legitimate users. */
  website: z.string().max(0, 'Spam verification failed.').optional().default(''),
});

export type ContactInquiryPayload = z.infer<typeof contactInquirySchema>;

export { isSafeHref } from './url-safety.ts';

/**
 * Formats an optional WhatsApp RFQ inquiry link ONLY when a real numeric
 * phone number has been configured in siteConfig.
 */
export function buildWhatsAppQuoteUrl(
  whatsappNumber: string | null | undefined,
  brandName: string,
  items: QuoteItem[],
  currency: CurrencyCode,
  notes?: string,
): string | null {
  if (!whatsappNumber) return null;
  const digits = whatsappNumber.replace(/[^\d]/g, '');
  if (digits.length < 8 || digits.length > 15) return null;

  const lines: string[] = [
    `Quotation Request — ${brandName}`,
    `Preferred Currency: ${currency}`,
    '',
  ];

  if (items.length > 0) {
    lines.push('Requested Instruments:');
    items.forEach((item, index) => {
      const variantText = item.variantLabel ? ` (${item.variantLabel})` : '';
      lines.push(
        `${index + 1}. ${item.productName}${variantText} | SKU: ${item.sku} | Qty: ${item.quantity}`,
      );
    });
  }

  if (notes?.trim()) {
    lines.push('', `Notes: ${notes.trim()}`);
  }

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${digits}?text=${text}`;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppQuoteUrl,
  contactInquirySchema,
  isSafeHref,
  quoteInquirySchema,
} from './inquiry-validation';

test('quoteInquirySchema validates legitimate payloads and rejects invalid or honeypot payloads', () => {
  const valid = quoteInquirySchema.safeParse({
    name: 'Dr. H. Weber',
    email: 'procurement@clinic.example',
    company: 'Alpine Medical Supply GmbH',
    country: 'Germany',
    phone: '+49 7461 555019',
    currency: 'USD',
    message: 'Please provide FOB Sialkot pricing for 200 units.',
    items: [
      {
        sku: 'AUR-GS-102-160',
        productName: 'Mayo-Hegar Needle Holder (TC)',
        variantLabel: '160 mm',
        quantity: 200,
      },
    ],
    website: '',
  });
  assert.equal(valid.success, true);

  const botSubmission = quoteInquirySchema.safeParse({
    name: 'Spam Bot',
    email: 'bot@spam.example',
    company: 'Spam Corp',
    country: 'Nowhere',
    phone: '+1 555 0000',
    currency: 'USD',
    items: [{ sku: 'AUR-GS-101', productName: 'Test', quantity: 1 }],
    website: 'https://spam.example',
  });
  assert.equal(botSubmission.success, false);

  const emptyItems = quoteInquirySchema.safeParse({
    name: 'Valid Buyer',
    email: 'buyer@hospital.example',
    company: 'Hospital',
    country: 'UK',
    phone: '+44 20 7946 0000',
    items: [],
  });
  assert.equal(emptyItems.success, false);
});

test('contactInquirySchema enforces required fields and email format', () => {
  const invalid = contactInquirySchema.safeParse({
    name: 'A',
    email: 'not-an-email',
    company: '',
    country: '',
    productInterest: '',
    message: 'short',
  });
  assert.equal(invalid.success, false);

  const ok = contactInquirySchema.safeParse({
    name: 'Tariq Mahmood',
    email: 'tariq@meddist.example',
    company: 'MedDist Logistics',
    country: 'United Arab Emirates',
    productInterest: 'OEM / Private Label Manufacturing',
    message: 'We are sourcing private-label general surgery sets for Q3 distribution.',
  });
  assert.equal(ok.success, true);
});

test('isSafeHref allows https/mailto/tel/relative paths and blocks javascript: or data:', () => {
  assert.equal(isSafeHref('https://maps.google.com/?q=Sialkot'), true);
  assert.equal(isSafeHref('mailto:sales@example.com'), true);
  assert.equal(isSafeHref('tel:+92521234567'), true);
  assert.equal(isSafeHref('/products'), true);
  assert.equal(isSafeHref('javascript:alert(1)'), false);
  assert.equal(isSafeHref('data:text/html,<script>alert(1)</script>'), false);
});

test('buildWhatsAppQuoteUrl returns null when unconfigured and formats cleanly when configured', () => {
  assert.equal(buildWhatsAppQuoteUrl(null, 'AUREN Instruments', [], 'USD'), null);
  const url = buildWhatsAppQuoteUrl(
    '+92 300 1234567',
    'AUREN Instruments',
    [
      {
        key: 'p1',
        productId: 'p1',
        productSlug: 'test',
        productName: 'Metzenbaum Scissors',
        sku: 'AUR-GS-101-145C',
        categorySlug: 'general-surgery',
        variantLabel: '145 mm · Curved',
        image: '/img.jpg',
        quantity: 25,
        unitPrice: null,
        isDemo: true,
      },
    ],
    'USD',
  );
  assert.ok(url?.startsWith('https://wa.me/923001234567?text='));
  assert.ok(url?.includes('AUR-GS-101-145C'));
});

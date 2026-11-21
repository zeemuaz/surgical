import test from 'node:test';
import assert from 'node:assert/strict';
import { getResponsiveImageAsset } from './image-manifest';

test('getResponsiveImageAsset returns responsive WebP variants for bundled studio photography', () => {
  const asset = getResponsiveImageAsset(
    '/src/assets/images/hero_surgical_editorial_1795254584538.jpg',
  );
  assert.ok(asset);
  assert.equal(asset.width, 1200);
  assert.equal(asset.height, 896);
  assert.equal(
    asset.webpSmall,
    '/src/assets/images/hero_surgical_editorial_1795254584538-600.webp',
  );
  assert.equal(
    asset.webpLarge,
    '/src/assets/images/hero_surgical_editorial_1795254584538-1200.webp',
  );
  assert.match(asset.webpSrcSet, /600w/);
  assert.match(asset.webpSrcSet, /1200w/);
});

test('getResponsiveImageAsset safely returns null for external or custom images', () => {
  assert.equal(getResponsiveImageAsset('https://example.com/custom.jpg'), null);
  assert.equal(getResponsiveImageAsset('/images/client-uploaded.png'), null);
  assert.equal(getResponsiveImageAsset(''), null);
});

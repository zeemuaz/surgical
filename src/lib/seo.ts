import { useEffect } from 'react';
import { siteConfig } from '../config/site';

interface PageSeoOptions {
  title: string;
  description?: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown> | null;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function usePageSeo({
  title,
  description,
  canonicalPath,
  jsonLd,
}: PageSeoOptions): void {
  useEffect(() => {
    const resolvedTitle =
      title === siteConfig.seo.defaultTitle
        ? title
        : siteConfig.seo.titleTemplate.replace('%s', title);
    const resolvedDescription = description || siteConfig.seo.defaultDescription;

    document.title = resolvedTitle;
    upsertMeta('name', 'description', resolvedDescription);
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', resolvedDescription);
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', resolvedDescription);

    if (typeof window !== 'undefined') {
      const canonicalUrl = `${window.location.origin}${canonicalPath ?? window.location.pathname}`;
      upsertMeta('property', 'og:url', canonicalUrl);
      upsertCanonical(canonicalUrl);
    }

    const scriptId = 'auren-structured-data';
    const existingScript = document.getElementById(scriptId);
    if (jsonLd) {
      const scriptEl =
        existingScript ??
        Object.assign(document.createElement('script'), {
          id: scriptId,
          type: 'application/ld+json',
        });
      // Escape "<" to prevent premature script tag termination.
      scriptEl.textContent = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
      if (!existingScript) {
        document.head.appendChild(scriptEl);
      }
    } else if (existingScript) {
      existingScript.remove();
    }
  }, [title, description, canonicalPath, jsonLd]);
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'StockScope';
const DEFAULT_DESCRIPTION = 'StockScope helps investors analyze Indian and US stocks with live prices, interactive charts, company profiles, and personalized watchlists.';
const DEFAULT_IMAGE = '/logo.png';
const DEFAULT_SITE_URL = (typeof window !== 'undefined' && window.location.origin) || import.meta.env.VITE_SITE_URL || 'https://www.stockscope.app';

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '') || '/';
}

function buildCanonicalUrl(pathname = '/', origin = DEFAULT_SITE_URL) {
  const normalizedPath = normalizePath(pathname);
  return `${origin}${normalizedPath}`;
}

function buildPageTitle(title) {
  if (!title) {
    return DEFAULT_TITLE;
  }

  if (title.includes('StockScope')) {
    return title;
  }

  return `${title} | StockScope`;
}

function ensureMetaTag(attributeName, attributeValue, content) {
  if (typeof document === 'undefined') {
    return;
  }

  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function ensureLinkTag(relValue, href) {
  if (typeof document === 'undefined') {
    return;
  }

  let element = document.querySelector(`link[rel="${relValue}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', relValue);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function setJsonLd(jsonLd) {
  if (typeof document === 'undefined') {
    return;
  }

  let element = document.querySelector('script[data-seo-jsonld]');
  if (!element) {
    element = document.createElement('script');
    element.setAttribute('type', 'application/ld+json');
    element.setAttribute('data-seo-jsonld', 'true');
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(jsonLd);
}

function removeJsonLd() {
  if (typeof document === 'undefined') {
    return;
  }

  const element = document.querySelector('script[data-seo-jsonld]');
  if (element) {
    element.remove();
  }
}

function applySeoMetadata({ title, description, path, image, type = 'website', noIndex = false, jsonLd }) {
  if (typeof document === 'undefined') {
    return;
  }

  const pageTitle = buildPageTitle(title);
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const origin = (typeof window !== 'undefined' && window.location.origin) || DEFAULT_SITE_URL;
  const canonicalUrl = buildCanonicalUrl(path || '/', origin);
  const resolvedImage = image ? (image.startsWith('http') ? image : `${origin}${image}`) : `${origin}${DEFAULT_IMAGE}`;

  document.title = pageTitle;
  document.documentElement.setAttribute('lang', 'en');

  ensureMetaTag('name', 'description', pageDescription);
  ensureMetaTag('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
  ensureMetaTag('property', 'og:title', pageTitle);
  ensureMetaTag('property', 'og:description', pageDescription);
  ensureMetaTag('property', 'og:image', resolvedImage);
  ensureMetaTag('property', 'og:url', canonicalUrl);
  ensureMetaTag('property', 'og:type', type);
  ensureMetaTag('property', 'og:site_name', 'StockScope');
  ensureMetaTag('name', 'twitter:card', 'summary_large_image');
  ensureMetaTag('name', 'twitter:title', pageTitle);
  ensureMetaTag('name', 'twitter:description', pageDescription);
  ensureMetaTag('name', 'twitter:image', resolvedImage);
  ensureMetaTag('name', 'theme-color', '#0f172a');

  ensureLinkTag('canonical', canonicalUrl);
  ensureLinkTag('icon', '/favicon.png');
  ensureLinkTag('shortcut icon', '/favicon.png');
  ensureLinkTag('apple-touch-icon', '/logo.png');

  if (jsonLd) {
    setJsonLd(jsonLd);
  } else {
    removeJsonLd();
  }
}

function SeoHead({ title, description, path, image, type = 'website', noIndex = false, jsonLd }) {
  const location = useLocation();

  useEffect(() => {
    applySeoMetadata({
      title,
      description,
      path: path || location.pathname,
      image,
      type,
      noIndex,
      jsonLd,
    });
  }, [title, description, path, image, type, noIndex, jsonLd, location.pathname]);

  return null;
}

export default SeoHead;

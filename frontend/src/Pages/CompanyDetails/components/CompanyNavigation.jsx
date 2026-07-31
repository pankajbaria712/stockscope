import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, BarChart2, TrendingUp, TrendingDown, DollarSign, Newspaper, Calendar, Calculator, AlertTriangle, Sparkles, Star, Share2 } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'chart', label: 'Chart', icon: Sparkles },
  { id: 'technical', label: 'Technical', icon: TrendingUp },
  { id: 'financials', label: 'Financials', icon: DollarSign },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'calculator', label: 'Calculator', icon: Calculator },
  { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
  { id: 'ai-insights', label: 'AI Insights', icon: ArrowUpRight },
];

export default function CompanyNavigation() {
  const [active, setActive] = useState('overview');
  const navRef = useRef(null);
  const observerRef = useRef(null);
  const [sticky, setSticky] = useState(false);

  // Smooth scroll with offset so sticky nav doesn't cover titles
  const scrollToId = useCallback((id) => {
    const el = document.getElementById(id);
    const nav = navRef.current;
    if (!el) return;
    const topOffset = (document.querySelector('.app-navbar')?.offsetHeight || 0) + (nav?.offsetHeight || 56) + 8;
    const target = el.getBoundingClientRect().top + window.scrollY - topOffset;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const sections = TABS.map((t) => document.getElementById(t.id)).filter(Boolean);
    if (!sections.length) return undefined;

    const navElem = navRef.current;
    const topBar = document.querySelector('.app-navbar');
    const topBarHeight = topBar?.offsetHeight || 0;

    // Observer to set active tab
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, { root: null, rootMargin: `-${(navElem?.offsetHeight || 72) + topBarHeight}px 0px -40% 0px`, threshold: 0.1 });

    sections.forEach((s) => io.observe(s));
    observerRef.current = io;

    // Observe header bottom to toggle sticky state
    const header = document.querySelector('.cd-header');
    if (header && navElem) {
      const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => setSticky(!e.isIntersecting));
      }, { root: null, threshold: 0 });
      headerObserver.observe(header);
      return () => { headerObserver.disconnect(); io.disconnect(); };
    }

    return () => { io.disconnect(); };
  }, []);

  // keyboard navigation
  const onKey = useCallback((e) => {
    const idx = TABS.findIndex((t) => t.id === active);
    if (e.key === 'ArrowRight') {
      const next = TABS[(idx + 1) % TABS.length];
      scrollToId(next.id);
    } else if (e.key === 'ArrowLeft') {
      const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
      scrollToId(prev.id);
    }
  }, [active, scrollToId]);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  // Actions
  const onAddWatch = () => {
    const symbol = document.location.pathname.split('/').pop();
    if (window.__ssAddToWatchlist) window.__ssAddToWatchlist(symbol);
    else alert('Add to Watchlist: feature not hooked (placeholder)');
  };

  const onShare = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  const indicatorStyle = useMemo(() => {
    const idx = TABS.findIndex((t) => t.id === active);
    return { '--active-index': idx };
  }, [active]);

  return (
    <nav
      ref={navRef}
      className={`ss-sticky-nav ${sticky ? 'ss-sticky-nav--fixed' : ''}`}
      style={indicatorStyle}
      role="navigation"
      aria-label="Company sections navigation"
    >
      <div className="ss-sticky-inner">
        <div className="ss-tabs" role="tablist">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={t.id}
                className={`ss-tab ${isActive ? 'ss-tab--active' : ''}`}
                onClick={() => scrollToId(t.id)}
              >
                <Icon size={14} className="ss-tab-icon" />
                <span className="ss-tab-label">{t.label}</span>
              </button>
            );
          })}
          <div className="ss-active-indicator" aria-hidden />
        </div>

        <div className="ss-actions">
          <button className="ss-action" onClick={onAddWatch} aria-label="Add to watchlist"><Star size={16} /></button>
          <button className="ss-action" onClick={onShare} aria-label="Share"><Share2 size={16} /></button>
        </div>
      </div>
    </nav>
  );
}

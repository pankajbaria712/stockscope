import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';
import { getCompanyDetails } from '../../../Services/stockService';

function formatPrice(value, currency = 'USD') {
  if (value == null) return 'N/A';

  const safeCurrency = String(currency || 'USD').toUpperCase();
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  });

  return formatter.format(value);
}

function formatCompactCurrency(value, currency = 'USD') {
  if (value == null) return 'N/A';

  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'N/A';

  if (amount >= 1e12) return `${formatPrice(amount / 1e12, currency)}T`;
  if (amount >= 1e9) return `${formatPrice(amount / 1e9, currency)}B`;
  if (amount >= 1e6) return `${formatPrice(amount / 1e6, currency)}M`;
  return formatPrice(amount, currency);
}

function formatPercent(value) {
  if (value == null) return 'N/A';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'N/A';
  return `${amount >= 0 ? '+' : ''}${amount.toFixed(2)}%`;
}

function formatVolume(value) {
  if (value == null) return 'N/A';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'N/A';
  return amount.toLocaleString('en-US');
}

function formatBeta(value) {
  if (value == null) return 'N/A';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'N/A';
  return amount.toFixed(2);
}

function deriveMarketCapCategory(marketCap) {
  const amount = Number(marketCap);
  if (!Number.isFinite(amount)) return null;
  if (amount >= 2e12) return 'Large Cap';
  if (amount >= 2e11) return 'Mid Cap';
  return 'Small Cap';
}

export default function CompanyHeader() {
  const { symbol } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    setLogoError(false);

    const fetchCompany = async () => {
      try {
        const response = await getCompanyDetails(symbol);
        if (!mounted) return;
        setCompany(response?.data || null);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err?.message || 'Unable to load company header');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCompany();

    return () => {
      mounted = false;
    };
  }, [symbol]);

  const logoUrl = company?.logo || '';
  const companyName = company?.name || symbol || 'Company';
  const exchange = company?.exchange || null;
  const country = company?.country || null;
  const marketCapCategory = company?.marketCapCategory || deriveMarketCapCategory(company?.marketCap);
  const indexMembership = company?.indexMembership || null;
  const sector = company?.sector || null;
  const industry = company?.industry || null;
  const currentPrice = company?.currentPrice ?? null;
  const marketCap = company?.marketCap ?? null;
  const fiftyTwoWeekHigh = company?.fiftyTwoWeekHigh ?? null;
  const fiftyTwoWeekLow = company?.fiftyTwoWeekLow ?? null;
  const currency = company?.currency || 'USD';

  const badges = useMemo(() => {
    return [
      exchange,
      country,
      marketCapCategory,
      indexMembership,
      sector,
      industry,
    ].filter(Boolean);
  }, [country, exchange, industry, indexMembership, marketCapCategory, sector]);

  const stats = useMemo(() => [
    { label: 'Current Price', value: formatPrice(currentPrice, currency) },
    { label: 'Market Cap', value: formatCompactCurrency(marketCap, currency) },
    { label: '52W High', value: formatPrice(fiftyTwoWeekHigh, currency) },
    { label: '52W Low', value: formatPrice(fiftyTwoWeekLow, currency) },
  ], [currency, currentPrice, fiftyTwoWeekHigh, fiftyTwoWeekLow, marketCap]);

  if (loading) {
    return (
      <section className="company-header-shell company-header-shell--loading" aria-live="polite">
        <div className="company-header-skeleton" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="company-header-shell" role="alert">
        <h2 className="company-header-title">Unable to load company</h2>
        <p className="company-header-subtitle">{error}</p>
      </section>
    );
  }

  return (
    <header className="company-header-shell">
      <div className="company-header-shell__grid">
        <div className="company-header-main">
          <div className="company-logo-shell">
            {logoUrl && !logoError ? (
              <img
                src={logoUrl}
                alt={`${companyName} logo`}
                className="company-logo-image"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="company-logo-fallback">{String(companyName).slice(0, 1).toUpperCase()}</div>
            )}
          </div>

          <div className="company-identity">
            <div className="company-identity-top">
              <div>
                <p className="company-header-eyebrow">
                  <Sparkles size={14} /> Company Profile
                </p>
                <h1 className="company-header-title">{companyName}</h1>
              </div>
              <div className="company-header-pill">
                <TrendingUp size={14} /> Live
              </div>
            </div>

            <div className="company-header-meta">
              <span>{symbol || 'N/A'}</span>
              {exchange ? <span>• {exchange}</span> : null}
              {country ? <span>• {country}</span> : null}
            </div>

            <div className="company-header-badges">
              {badges.map((badge) => (
                <span key={badge} className="company-badge">
                  {badge}
                </span>
              ))}
            </div>

          </div>
        </div>

        <div className="company-stat-grid" aria-label="Company statistics">
          {stats.map((stat) => (
            <div key={stat.label} className="company-stat-card">
              <span className="company-stat-card__label">{stat.label}</span>
              <strong className="company-stat-card__value">{stat.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, BarChart3, Building2, CircleDollarSign, Globe2, Landmark, Users } from 'lucide-react';
import { getCompanyHubData } from '../../../Services/stockService';

function formatCurrency(value, currency = 'USD') {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  const safeCurrency = String(currency || 'USD').toUpperCase();
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'N/A';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: amount >= 1e9 ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString('en-US')}`;
  }
}

function formatCompactCurrency(value, currency = 'USD') {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'N/A';

  if (amount >= 1e12) return `${formatCurrency(amount / 1e12, currency)}T`;
  if (amount >= 1e9) return `${formatCurrency(amount / 1e9, currency)}B`;
  if (amount >= 1e6) return `${formatCurrency(amount / 1e6, currency)}M`;
  return formatCurrency(amount, currency);
}

function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'N/A';
  return `${amount >= 0 ? '+' : ''}${amount.toFixed(2)}%`;
}

function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'N/A';
  return amount.toLocaleString('en-US');
}

export default function BusinessFundamentals() {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const fetchData = async () => {
      try {
        const response = await getCompanyHubData(symbol);
        if (!mounted) return;
        setData(response?.data || null);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err?.message || 'Unable to load fundamentals');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [symbol]);

  const overview = data?.overview || null;
  const financials = data?.financials?.metrics || [];
  const fallbackCurrency = overview?.currency || 'USD';

  const quickFacts = useMemo(() => [
    { label: 'CEO', value: overview?.ceo && overview.ceo !== 'N/A' ? overview.ceo : 'N/A', icon: BadgeCheck },
    { label: 'Headquarters', value: overview?.headquarters && overview.headquarters !== 'N/A' ? overview.headquarters : 'N/A', icon: Building2 },
    { label: 'Employees', value: overview?.employees && overview.employees !== 'N/A' ? formatNumber(overview.employees) : 'N/A', icon: Users },
    { label: 'Website', value: overview?.website ? <a href={overview.website} target="_blank" rel="noreferrer">Visit site</a> : 'N/A', icon: Globe2 },
    { label: 'Exchange', value: overview?.exchange && overview.exchange !== 'N/A' ? overview.exchange : 'N/A', icon: Landmark },
    { label: 'Sector', value: overview?.sector && overview.sector !== 'N/A' ? overview.sector : 'N/A', icon: BarChart3 },
  ], [overview]);

  const metricCards = useMemo(() => [
    { label: 'Market Cap', value: formatCompactCurrency(overview?.marketCap, fallbackCurrency) },
    { label: 'Enterprise Value', value: formatCompactCurrency(overview?.enterpriseValue, fallbackCurrency) },
    { label: 'P/E Ratio', value: overview?.peRatio != null ? overview.peRatio.toFixed(2) : 'N/A' },
    { label: 'Forward P/E', value: overview?.forwardPe != null ? overview.forwardPe.toFixed(2) : 'N/A' },
    { label: 'EPS', value: overview?.eps != null ? overview.eps.toFixed(2) : 'N/A' },
    { label: 'Dividend Yield', value: overview?.dividendYield != null ? formatPercent(overview.dividendYield) : 'N/A' },
    { label: 'Beta', value: overview?.beta != null ? Number(overview.beta).toFixed(2) : 'N/A' },
    { label: 'Book Value', value: formatCurrency(overview?.bookValue, fallbackCurrency) },
  ], [fallbackCurrency, overview]);

  const financialCards = useMemo(() => [
    { label: 'Revenue', value: formatCompactCurrency(overview?.revenue, fallbackCurrency) },
    { label: 'Net Income', value: formatCompactCurrency(overview?.netIncome, fallbackCurrency) },
    { label: 'Profit Margin', value: overview?.profitMargin != null ? formatPercent(overview.profitMargin) : 'N/A' },
    { label: 'Debt / Equity', value: overview?.debtToEquity != null ? Number(overview.debtToEquity).toFixed(2) : 'N/A' },
    { label: 'ROE', value: overview?.roe != null ? formatPercent(overview.roe) : 'N/A' },
    { label: 'ROCE', value: overview?.roce != null ? formatPercent(overview.roce) : 'N/A' },
    { label: 'Cash Flow', value: formatCompactCurrency(overview?.cashFlow, fallbackCurrency) },
    { label: 'Shares Outstanding', value: overview?.sharesOutstanding != null ? formatNumber(overview.sharesOutstanding) : 'N/A' },
  ], [fallbackCurrency, overview]);

  const description = overview?.description || 'Company details are currently being prepared.';

  if (loading) {
    return (
      <section className="fundamentals-panel" aria-live="polite">
        <div className="fundamentals-skeleton" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="fundamentals-panel">
        <div className="fundamentals-error">{error}</div>
      </section>
    );
  }

  return (
    <section className="fundamentals-panel">
      <div className="fundamentals-panel__header">
        <div>
          <p className="eyebrow">Business fundamentals and company information</p>
          <h2>{overview?.companyName || symbol || 'Company fundamentals'}</h2>
        </div>
        <div className="fundamentals-pill">
          <CircleDollarSign size={16} /> Live data from backend
        </div>
      </div>

      <div className="fundamentals-grid">
        <article className="fundamentals-card fundamentals-card--wide">
          <div className="fundamentals-card__header">
            <h3>Company overview</h3>
            <span>Profile</span>
          </div>
          <p className="fundamentals-description">{description}</p>
          <div className="fundamentals-facts-grid">
            {quickFacts.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="fundamentals-fact">
                  <div className="fundamentals-fact__icon">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="fundamentals-card">
          <div className="fundamentals-card__header">
            <h3>Key valuation metrics</h3>
            <span>Snapshot</span>
          </div>
          <div className="fundamentals-metric-list">
            {metricCards.map((item) => (
              <div key={item.label} className="fundamentals-metric-item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="fundamentals-card">
          <div className="fundamentals-card__header">
            <h3>Financial snapshot</h3>
            <span>Performance</span>
          </div>
          <div className="fundamentals-metric-list">
            {financialCards.map((item) => (
              <div key={item.label} className="fundamentals-metric-item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

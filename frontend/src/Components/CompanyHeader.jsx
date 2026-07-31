import { memo, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Share2,
  Star,
  Globe,
  Layers,
  TrendingDown,
  TrendingUp,
  Clock3,
} from 'lucide-react';
import LiveValue from './LiveValue';

function formatCurrency(value, currency = 'USD') {
  if (value === null || value === undefined) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return String(value);
  }
}

function formatCompactCurrency(value, currency = 'USD') {
  if (value === null || value === undefined) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return String(value);
  }
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return '—';
  }

  return new Intl.NumberFormat('en-IN').format(value);
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return '—';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function getMarketLiveState(marketState) {
  const state = String(marketState || '').toUpperCase();
  return ['REGULAR', 'OPEN', 'PRE', 'PREPRE', 'POST'].includes(state);
}

function CompanyHeader({ details, quote, isWatchlisted, onToggleWatchlist, onOpenChart }) {
  const [copyStatus, setCopyStatus] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const companyName = details?.name || 'Unknown company';
  const symbol = details?.symbol || '—';
  const exchange = details?.exchange || 'Unknown exchange';
  const industry = details?.industry || 'N/A';
  const sector = details?.sector || 'N/A';
  const currency = details?.currency || quote?.currency || 'USD';
  const marketState = quote?.marketState || 'CLOSED';
  const isMarketLive = getMarketLiveState(marketState);
  const statusLabel = isMarketLive ? 'LIVE' : 'CLOSED';
  const lastUpdated = quote?.lastUpdated ? new Date(quote.lastUpdated) : new Date();
  const lastUpdatedLabel = quote?.lastUpdated ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A';
  const priceChange = quote?.change;
  const percentChange = quote?.changePercent;
  const pricePositive = priceChange > 0;

  const marketCap = details?.marketCap ?? null;
  const peRatio = quote?.peRatio ?? null;
  const fiftyTwoWeekHigh = quote?.fiftyTwoWeekHigh ?? null;
  const fiftyTwoWeekLow = quote?.fiftyTwoWeekLow ?? null;
  const averageVolume = quote?.averageVolume ?? null;

  const stats = useMemo(
    () => [
      {
        title: 'Market cap',
        value: marketCap,
        label: formatCompactCurrency(marketCap, currency),
        icon: BarChart3,
      },
      {
        title: 'P/E ratio',
        value: peRatio,
        label: peRatio != null ? peRatio.toFixed(2) : 'N/A',
        icon: Layers,
      },
      {
        title: 'EPS',
        value: quote?.eps ?? details?.eps,
        label: quote?.eps != null ? quote.eps.toFixed(2) : 'N/A',
        icon: ArrowUpRight,
      },
      {
        title: '52 week high',
        value: fiftyTwoWeekHigh,
        label: formatCurrency(fiftyTwoWeekHigh, currency),
        icon: TrendingUp,
      },
      {
        title: '52 week low',
        value: fiftyTwoWeekLow,
        label: formatCurrency(fiftyTwoWeekLow, currency),
        icon: TrendingDown,
      },
      {
        title: 'Volume',
        value: quote?.volume,
        label: quote?.volume != null ? formatNumber(quote.volume) : 'N/A',
        icon: Globe,
      },
      {
        title: 'Industry',
        value: industry,
        label: industry,
        icon: Globe,
      },
      {
        title: 'Sector',
        value: sector,
        label: sector,
        icon: Globe,
      },
    ],
    [averageVolume, currency, details?.eps, exchange, fiftyTwoWeekHigh, fiftyTwoWeekLow, industry, marketCap, peRatio, quote?.volume, sector]
  );

  const handleShare = async () => {
    const sharePayload = {
      title: `${companyName} (${symbol})`,
      text: `View ${companyName} stock details on StockScope.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus('Link copied');
      window.setTimeout(() => setCopyStatus(''), 2000);
    } catch (error) {
      setCopyStatus('Unable to share');
      window.setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const logoText = companyName ? companyName.charAt(0).toUpperCase() : 'S';

  // Helper: derive cap size
  const capSize = useMemo(() => {
    const m = marketCap;
    if (!m || !Number.isFinite(Number(m))) return 'N/A';
    const n = Number(m);
    if (n >= 1e9) return 'Large Cap';
    if (n >= 2e8) return 'Mid Cap';
    return 'Small Cap';
  }, [marketCap]);

  const website = details?.website || details?.websiteUrl || details?.url || details?.homepage || details?.webpage;

  const quickStatsOrder = [
    { key: 'marketCap', label: 'Market Cap', value: marketCap, kind: 'currency', icon: BarChart3 },
    { key: 'open', label: 'Open', value: quote?.open ?? quote?.previous_open, kind: 'currency', icon: ArrowUpRight },
    { key: 'previousClose', label: 'Previous Close', value: quote?.previousClose ?? quote?.previous_close, kind: 'currency', icon: ArrowUpRight },
    { key: 'dayHigh', label: 'Day High', value: quote?.high, kind: 'currency', icon: TrendingUp },
    { key: 'dayLow', label: 'Day Low', value: quote?.low, kind: 'currency', icon: TrendingDown },
    { key: '52High', label: '52W High', value: fiftyTwoWeekHigh, kind: 'currency', icon: TrendingUp },
    { key: '52Low', label: '52W Low', value: fiftyTwoWeekLow, kind: 'currency', icon: TrendingDown },
    { key: 'volume', label: 'Volume', value: quote?.volume, kind: 'number', icon: BarChart3 },
    { key: 'avgVolume', label: 'Avg Volume', value: quote?.averageVolume, kind: 'number', icon: BarChart3 },
    { key: 'pe', label: 'P/E', value: peRatio, kind: 'number', icon: Layers },
    { key: 'eps', label: 'EPS', value: quote?.eps ?? details?.eps, kind: 'number', icon: ArrowUpRight },
    { key: 'beta', label: 'Beta', value: details?.beta ?? quote?.beta, kind: 'number', icon: Globe },
    { key: 'dividendYield', label: 'Dividend Yield', value: details?.dividendYield ?? details?.dividend_yield ?? null, kind: 'percent', icon: Globe },
  ];

  return (
    <div className="company-header company-header--premium">
      <div className="company-header-grid">
        <div className="company-header-left">
          <div className="company-logo-shell company-logo-shell--large">
            {details?.logo ? (
              <img
                src={details.logo}
                alt={`${companyName} logo`}
                className="company-logo-image"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="company-logo-fallback">{logoText}</span>
            )}
          </div>

          <div className="company-identity">
            <div className="company-identity-line">
              <h1 className="company-header-title">{companyName}</h1>
              <div className="company-status-inline">
                <span className={isMarketLive ? 'market-badge market-badge--live' : 'market-badge market-badge--closed'}>
                  <span className={isMarketLive ? 'market-dot' : 'market-dot--closed'} />
                  {statusLabel}
                </span>
                <small className="company-status-time">{isMarketLive ? 'Updated' : 'Last updated'} {lastUpdatedLabel}</small>
              </div>
            </div>

            <div className="company-meta">
              <div className="company-symbol">{symbol}</div>
              <div className="company-exchange">{exchange} · {details?.country || details?.countryCode || '—'} · {currency}</div>
            </div>

            <div className="company-badges">
              <span className="company-badge">{sector || 'Unknown sector'}</span>
              <span className="company-badge">{industry || 'Unknown industry'}</span>
              <span className="company-badge">{capSize}</span>
              {details?.fno ? <span className="company-badge">F&O</span> : null}
              {details?.esg ? <span className="company-badge">ESG</span> : null}
            </div>

            <div className="company-actions-row">
              {website ? (
                <a className="primary-button" href={website} target="_blank" rel="noreferrer">Website</a>
              ) : (
                <button type="button" className="ghost-button" disabled>Website</button>
              )}

              <button type="button" className={`ghost-button ${isWatchlisted ? 'watchlist-active' : ''}`} onClick={onToggleWatchlist}>
                <Star size={16} /> {isWatchlisted ? 'Saved' : 'Add to Watchlist'}
              </button>

              <button type="button" className="ghost-button" onClick={handleShare}>
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="company-header-center">
          <div className="price-panel-card">
            <div className="price-main">
              <div className="price-value">
                <LiveValue
                  value={quote?.currentPrice}
                  format={(value) => formatCurrency(value, currency)}
                  showIcon
                  positive={pricePositive}
                />
              </div>
              <div className="price-delta">
                <LiveValue
                  value={priceChange}
                  format={(value) => (value !== null && value !== undefined ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}` : '—')}
                  showIcon
                  positive={pricePositive}
                />
                <LiveValue
                  value={percentChange}
                  format={formatPercent}
                  showIcon
                  positive={pricePositive}
                />
              </div>
            </div>
            <div className="price-meta">
              <div className="market-status">
                <span className={`market-badge ${isMarketLive ? 'market-badge--live' : 'market-badge--closed'}`}>
                  <span className={`market-dot ${isMarketLive ? '' : 'market-dot--closed'}`} />
                  <span>{statusLabel}</span>
                </span>
                <span className="market-updated">{lastUpdatedLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="company-header-right">
          <div className="quick-stats-grid">
            {quickStatsOrder.map((stat) => {
              const Icon = stat.icon;
              let label = 'N/A';
              if (stat.kind === 'currency') label = stat.value != null ? formatCurrency(stat.value, currency) : 'N/A';
              else if (stat.kind === 'percent') label = stat.value != null ? `${stat.value >= 0 ? '+' : ''}${Number(stat.value).toFixed(2)}%` : 'N/A';
              else if (stat.kind === 'number') label = stat.value != null ? formatNumber(stat.value) : 'N/A';
              else label = stat.value != null ? String(stat.value) : 'N/A';

              return (
                <div key={stat.key} className="stat-card stat-card--compact">
                  <div className="stat-card__icon"><Icon size={16} /></div>
                  <div className="stat-card__body">
                    <span className="stat-card__label">{stat.label}</span>
                    <strong className="stat-card__value">{label}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="company-description">
        <p className={descriptionExpanded ? 'company-description__text expanded' : 'company-description__text'}>{details?.description || 'No company description is available yet.'}</p>
        {details?.description ? (
          <button type="button" className="ghost-button company-description-toggle" onClick={() => setDescriptionExpanded((value) => !value)}>
            {descriptionExpanded ? 'Read less' : 'Read more'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default memo(CompanyHeader);

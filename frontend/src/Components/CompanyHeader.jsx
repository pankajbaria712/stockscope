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
        title: 'Open',
        value: quote?.open,
        label: quote?.open != null ? formatCurrency(quote.open, currency) : 'N/A',
        icon: ArrowUpRight,
      },
      {
        title: 'Previous close',
        value: quote?.previousClose,
        label: quote?.previousClose != null ? formatCurrency(quote.previousClose, currency) : 'N/A',
        icon: Clock3,
      },
      {
        title: 'Volume',
        value: quote?.volume,
        label: quote?.volume != null ? formatNumber(quote.volume) : 'N/A',
        icon: Globe,
      },
      {
        title: 'Average volume',
        value: averageVolume,
        label: averageVolume != null ? formatNumber(averageVolume) : 'N/A',
        icon: Globe,
      },
    ],
    [averageVolume, currency, fiftyTwoWeekHigh, fiftyTwoWeekLow, marketCap, peRatio, quote?.open, quote?.previousClose, quote?.volume]
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

  return (
    <div className="company-header">
      <div className="company-header-top">
        <div className="company-header-main">
          <div className="company-logo-shell">
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

          <div className="company-header-info">
            <div>
              <p className="section-eyebrow">Company overview</p>
              <h2 className="company-header-title">{companyName}</h2>
            </div>
            <div className="company-header-subtitle">
              <span>{symbol}</span>
              <span>•</span>
              <span>{exchange}</span>
            </div>
            <div className="company-header-subtitle">
              <span>{industry}</span>
              <span>•</span>
              <span>{sector}</span>
            </div>
          </div>
        </div>

        <div className="company-header-actions">
          <button type="button" className={`primary-button company-header__button ${isWatchlisted ? 'watchlist-active' : ''}`} onClick={onToggleWatchlist}>
            <Star size={16} />
            {isWatchlisted ? 'Saved' : 'Add to Watchlist'}
          </button>
          <button type="button" className="secondary-button company-header__button" onClick={handleShare}>
            <Share2 size={16} />
            Share
          </button>
            <button type="button" className="secondary-button company-header__button" onClick={onOpenChart}>
              <ArrowUpRight size={16} />
              Open full chart
            </button>
              format={(value) => formatCurrency(value, currency)}
              showIcon
              positive={pricePositive}
            />
          </strong>
        </div>
        <div className="company-price-card">
          <span>Today's change</span>
          <strong>
            <LiveValue
              value={priceChange}
              format={(value) => (value !== null && value !== undefined ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}` : '—')}
              showIcon
              positive={pricePositive}
            />
          </strong>
        </div>
        <div className="company-price-card">
          <span>Percentage change</span>
          <strong>
            <LiveValue
              value={percentChange}
              format={formatPercent}
              showIcon
              positive={pricePositive}
            />
          </strong>
        </div>
        <div className="company-price-card">
          <span>Market status</span>
          <div className={`market-badge ${isMarketLive ? 'market-badge--live' : 'market-badge--closed'}`}>
            <span className={`market-dot ${isMarketLive ? '' : 'market-dot--closed'}`} />
            <span>{statusLabel}</span>
          </div>
          <p className="live-timer">
            {isMarketLive ? 'Updated' : 'Last updated'} {lastUpdatedLabel}
          </p>
        </div>
      </div>

      <div className="company-description">
        <p className={descriptionExpanded ? 'company-description__text expanded' : 'company-description__text'}>{details?.description || 'No company description is available yet.'}</p>
        {details?.description ? (
          <button type="button" className="ghost-button company-description-toggle" onClick={() => setDescriptionExpanded((value) => !value)}>
            {descriptionExpanded ? 'Collapse' : 'Read more'}
          </button>
        ) : null}
      </div>

      <div className="company-quickstats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="stat-card">
              <div className="stat-card__icon">
                <Icon size={16} />
              </div>
              <span className="stat-card__label">{item.title}</span>
              <strong className="stat-card__value">{item.label}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CompanyHeader);

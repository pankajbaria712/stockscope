import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, TrendingUp } from 'lucide-react';
import { getCompanyHubData } from '../../../Services/stockService';
import '../styles/companyDetails.css';

function formatMetricValue(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return 'N/A';
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatVolumeValue(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return 'N/A';
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return 'N/A';
  }

  if (amount >= 1e9) {
    return `${(amount / 1e9).toFixed(2)}B`;
  }

  if (amount >= 1e6) {
    return `${(amount / 1e6).toFixed(2)}M`;
  }

  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount);
}

function getSignalTone(signal) {
  if (!signal) {
    return 'neutral';
  }

  if (['Strong Buy', 'Buy'].includes(signal)) {
    return 'positive';
  }

  if (['Strong Sell', 'Sell'].includes(signal)) {
    return 'negative';
  }

  return 'neutral';
}

function getIndicatorTone(tone) {
  if (tone === 'positive') {
    return 'positive';
  }

  if (tone === 'negative') {
    return 'negative';
  }

  return 'neutral';
}

export default function TechnicalAnalysis() {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const fetchTechnicalAnalysis = async () => {
      try {
        const response = await getCompanyHubData(symbol);
        if (!mounted) {
          return;
        }

        setData(response?.data || null);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(err?.response?.data?.message || err?.message || 'Unable to load technical analysis.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTechnicalAnalysis();

    return () => {
      mounted = false;
    };
  }, [symbol]);

  const technical = data?.technical || null;
  const indicators = useMemo(() => technical?.indicators || [], [technical]);
  const movingAverages = useMemo(() => technical?.movingAverages || [], [technical]);
  const priceLevels = technical?.priceLevels || {};
  const overallSignal = technical?.overallSignal || 'Hold';
  const signalTone = getSignalTone(overallSignal);

  if (loading) {
    return (
      <section className="technical-analysis-panel" aria-live="polite">
        <div className="technical-analysis-skeleton" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="technical-analysis-panel">
        <div className="technical-analysis-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="technical-analysis-panel">
      <div className="technical-analysis-panel__header">
        <div>
          <p className="eyebrow">Technical Analysis</p>
          <h2>Analyze the stock using commonly used technical indicators.</h2>
        </div>
        <div className={`technical-signal-badge technical-signal-badge--${signalTone}`}>
          <TrendingUp size={16} />
          {overallSignal}
        </div>
      </div>

      <div className="technical-summary-grid">
        <article className={`technical-signal-card technical-signal-card--${signalTone}`}>
          <div className="technical-signal-card__icon">
            <Activity size={18} />
          </div>
          <div>
            <p className="technical-signal-card__eyebrow">Overall signal</p>
            <h3>{overallSignal}</h3>
            <p>{technical?.summary || 'Technical indicators are being evaluated from the latest available price history.'}</p>
          </div>
        </article>

        <article className="technical-price-levels-card">
          <div className="technical-card__header">
            <h3>Price levels</h3>
            <span>Support and resistance</span>
          </div>
          <div className="technical-price-levels-grid">
            {[
              ['Support 1', priceLevels.support1],
              ['Support 2', priceLevels.support2],
              ['Resistance 1', priceLevels.resistance1],
              ['Resistance 2', priceLevels.resistance2],
            ].map(([label, value]) => (
              <div key={label} className="technical-price-level-item">
                <span>{label}</span>
                <strong>{value == null ? 'N/A' : formatMetricValue(value)}</strong>
              </div>
            ))}
            <div className="technical-price-level-item technical-price-level-item--accent">
              <span>Current Price</span>
              <strong>{priceLevels.currentPrice == null ? 'N/A' : formatMetricValue(priceLevels.currentPrice)}</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="technical-indicator-grid">
        {indicators.map((indicator) => (
          <article key={indicator.key} className={`technical-indicator-card technical-indicator-card--${getIndicatorTone(indicator.tone)}`}>
            <div className="technical-indicator-card__top">
              <div>
                <p className="technical-indicator-card__label">{indicator.label}</p>
                <h3>{indicator.displayValue || 'N/A'}</h3>
              </div>
              <span className="technical-indicator-badge">{indicator.status || 'Neutral'}</span>
            </div>
            <p className="technical-indicator-card__description">{indicator.description || 'Indicator data is currently unavailable.'}</p>
          </article>
        ))}
      </div>

      <article className="technical-moving-averages-card">
        <div className="technical-card__header">
          <h3>Moving averages</h3>
          <span>Trend signals</span>
        </div>

        <div className="technical-table-shell">
          <table className="technical-moving-averages-table">
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Value</th>
                <th>Signal</th>
              </tr>
            </thead>
            <tbody>
              {movingAverages.map((item) => (
                <tr key={item.indicator}>
                  <td>{item.indicator}</td>
                  <td>{item.value == null ? 'N/A' : formatMetricValue(item.value)}</td>
                  <td>
                    <span className={`technical-signal-pill technical-signal-pill--${getSignalTone(item.signal)}`}>
                      {item.signal || 'Hold'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

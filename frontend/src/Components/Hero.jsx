import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, ShieldCheck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroChart from './charts/HeroChart';
import LiveValue from './LiveValue';
import LiveTimer from './LiveTimer';
import LiveStatus from './LiveStatus';

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return '—';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return '—';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function Hero({ loading, error, heroData, lastRefreshedAt, isUpdating }) {
  const nifty = heroData?.nifty || null;
  const sensex = heroData?.sensex || null;
  const bankNifty = heroData?.bankNifty || null;
  const marketStatus = nifty?.marketStatus || 'Market Closed';
  const lastUpdateTime = new Date(lastRefreshedAt || heroData?.lastUpdated || Date.now());

  return (
    <section className="hero-section">
      <div className="hero-section__content">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-copy"
        >
          <p className="hero-eyebrow">Trusted market intelligence</p>
          <h1>Research Smarter.<br />Invest Better.</h1>
          <p className="hero-description">
            Search thousands of publicly listed companies, analyze market trends, compare businesses, and make confident investment decisions from one modern platform.
          </p>
          <div className="hero-actions">
            <Link to="/search" className="primary-button hero-button">
              Explore Market
              <ArrowRight size={16} />
            </Link>
            <Link to="/compare" className="secondary-button hero-button">
              <Play size={16} />
              Search Companies
            </Link>
          </div>

          <div className="hero-highlights">
            <div className="pill">Live market coverage</div>
            <div className="pill">Beginner-friendly insights</div>
            <div className="pill">Secure research workspace</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="hero-visual"
        >
          <div className="hero-dashboard">
            <div className="glass-card hero-card hero-card--main">
              <div className="hero-card__header">
                <div>
                  <p className="metric-label">NIFTY 50</p>
                  <h3>
                    <LiveValue
                      value={loading ? null : nifty?.currentPrice}
                      format={formatCurrency}
                      showIcon
                      positive={nifty?.changePercent >= 0}
                      className="hero-price"
                    />
                  </h3>
                </div>
                <div className="positive-chip">
                  <TrendingUp size={16} />
                  <LiveValue
                    value={loading ? null : nifty?.changePercent}
                    format={(value) => formatPercent(value)}
                    className="hero-percent"
                    positive={nifty?.changePercent >= 0}
                  />
                </div>
              </div>
              <div className="chart-placeholder h-[180px] md:h-[220px] rounded-[1rem] overflow-hidden">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading chart…</div>
                ) : (
                  <HeroChart data={heroData?.chart} />
                )}
              </div>
            </div>

            <div className="glass-card hero-card hero-card--side">
              <div className="hero-card__header">
                <div>
                  <p className="metric-label">Market status</p>
                  <h4>{loading ? 'Loading…' : marketStatus}</h4>
                </div>
                <ShieldCheck size={18} className="hero-icon" />
              </div>
              <p className="hero-card__text">
                {loading
                  ? 'Fetching the latest NSE and BSE market snapshot.'
                  : `SENSEX ${formatCurrency(sensex?.currentPrice)}, BANK NIFTY ${formatCurrency(bankNifty?.currentPrice)}.`}
              </p>
            </div>

            <div className="glass-card hero-card hero-card--floating">
              <BarChart3 size={18} className="hero-icon" />
              <div>
                <p className="metric-label">Latest update</p>
                <h4>{loading ? 'Updating…' : lastUpdateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h4>
                <LiveTimer timestamp={lastRefreshedAt || heroData?.lastUpdated} />
                <LiveStatus updating={isUpdating} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default memo(Hero);

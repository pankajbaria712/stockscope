import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import SectionHeading from './UI/SectionHeading';
import LiveValue from './LiveValue';

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

function MarketOverview({ loading, marketData = [] }) {
  const markets = loading
    ? Array.from({ length: 4 }).map((_, index) => ({ id: index }))
    : marketData;

  return (
    <section className="section-block">
      <SectionHeading
        eyebrow="Market overview"
        title="Leading market signals, curated with clarity"
        description="Monitor the pulse of major indices and stay grounded in real-time momentum."
      />

      <div className="market-grid">
        {markets.map((market, index) => {
          const isPlaceholder = loading || !market?.name;
          const positive = market?.change >= 0;

          return (
            <motion.article
              key={market?.name || market.id || index}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="market-card"
              whileHover={{ y: -6, scale: 1.01 }}
            >
              <div className="market-card__top">
                <p>{isPlaceholder ? 'Loading…' : market.name}</p>
                {isPlaceholder ? (
                  <div className="market-icon market-icon--up" />
                ) : positive ? (
                  <TrendingUp className="market-icon market-icon--up" />
                ) : (
                  <TrendingDown className="market-icon market-icon--down" />
                )}
              </div>
              <h3>
                {isPlaceholder ? '—' : (
                  <LiveValue
                    value={market.currentPrice}
                    format={formatCurrency}
                    showIcon
                    positive={market.change >= 0}
                    className="market-current-price"
                  />
                )}
              </h3>
              <span className={positive ? 'market-change market-change--up' : 'market-change market-change--down'}>
                {isPlaceholder ? '—' : (
                  <LiveValue
                    value={market.changePercent}
                    format={formatPercent}
                    showIcon
                    positive={market.change >= 0}
                    className="market-change-text"
                  />
                )}
              </span>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default memo(MarketOverview);

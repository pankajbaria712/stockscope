import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from './UI/SectionHeading';

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

function TrendingStocks({ loading, stocks = [] }) {
  const stockList = loading
    ? Array.from({ length: 5 }).map((_, index) => ({ id: index }))
    : stocks;

  return (
    <section className="section-block">
      <SectionHeading
        eyebrow="Trending stocks"
        title="Momentum you can act on"
        description="Discover notable movers, compare themes, and move from insight to decision quickly."
      />

      <div className="stock-grid">
        {stockList.map((stock, index) => {
          const isPlaceholder = loading || !stock?.symbol;
          const positive = stock?.change >= 0;
          const accent = stock?.positive ? 'linear-gradient(135deg, #22D3EE, #0EA5E9)' : 'linear-gradient(135deg, #f59e0b, #ef4444)';

          return (
            <motion.article
              key={stock?.symbol || stock.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="stock-card"
            >
              <div className="stock-card__top">
                <div className="stock-pill" style={{ background: accent }} />
                <div>
                  <h3>{isPlaceholder ? 'Loading stock' : stock.name}</h3>
                  <p>{isPlaceholder ? '—' : stock.symbol}</p>
                </div>
              </div>
              <div className="stock-chart" aria-hidden="true" />
              <div className="stock-card__footer">
                <div>
                  <p className="metric-label">Price</p>
                  <strong>{isPlaceholder ? '—' : formatCurrency(stock.currentPrice)}</strong>
                </div>
                <div className={positive ? 'market-change market-change--up' : 'market-change market-change--down'}>
                  {isPlaceholder ? '—' : formatPercent(stock.changePercent)}
                </div>
              </div>
              <Link to={isPlaceholder ? '/search' : `/company/${stock.symbol}`} className="text-link">
                <Sparkles size={15} />
                View Details
                <ArrowUpRight size={15} />
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default TrendingStocks;

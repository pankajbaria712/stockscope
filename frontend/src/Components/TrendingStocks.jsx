import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from './UI/SectionHeading';

const stocks = [
  { name: 'Apple', symbol: 'AAPL', price: '$214.32', change: '+2.16%', accent: 'linear-gradient(135deg, #22D3EE, #0EA5E9)' },
  { name: 'Microsoft', symbol: 'MSFT', price: '$426.18', change: '+1.06%', accent: 'linear-gradient(135deg, #10B981, #059669)' },
  { name: 'Tesla', symbol: 'TSLA', price: '$255.87', change: '-0.81%', accent: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
  { name: 'NVIDIA', symbol: 'NVDA', price: '$124.33', change: '+3.12%', accent: 'linear-gradient(135deg, #818CF8, #4F46E5)' },
  { name: 'Amazon', symbol: 'AMZN', price: '$182.64', change: '+0.74%', accent: 'linear-gradient(135deg, #34D399, #10B981)' },
];

function TrendingStocks() {
  return (
    <section className="section-block">
      <SectionHeading
        eyebrow="Trending stocks"
        title="Momentum you can act on"
        description="Discover notable movers, compare themes, and move from insight to decision quickly."
      />

      <div className="stock-grid">
        {stocks.map((stock, index) => (
          <motion.article
            key={stock.symbol}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="stock-card"
          >
            <div className="stock-card__top">
              <div className="stock-pill" style={{ background: stock.accent }} />
              <div>
                <h3>{stock.name}</h3>
                <p>{stock.symbol}</p>
              </div>
            </div>
            <div className="stock-chart" aria-hidden="true" />
            <div className="stock-card__footer">
              <div>
                <p className="metric-label">Price</p>
                <strong>{stock.price}</strong>
              </div>
              <div className={stock.change.startsWith('-') ? 'market-change market-change--down' : 'market-change market-change--up'}>
                {stock.change}
              </div>
            </div>
            <Link to={`/company/${stock.symbol}`} className="text-link">
              <Sparkles size={15} />
              View Details
              <ArrowUpRight size={15} />
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default TrendingStocks;

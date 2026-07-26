import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import SectionHeading from './UI/SectionHeading';

const markets = [
  { name: 'S&P 500', value: '5,743.21', change: '+0.72%', positive: true },
  { name: 'NASDAQ', value: '18,234.08', change: '+1.14%', positive: true },
  { name: 'NIFTY 50', value: '24,890.40', change: '-0.38%', positive: false },
  { name: 'SENSEX', value: '81,741.22', change: '+0.51%', positive: true },
];

function MarketOverview() {
  return (
    <section className="section-block">
      <SectionHeading
        eyebrow="Market overview"
        title="Leading market signals, curated with clarity"
        description="Monitor the pulse of major indices and stay grounded in real-time momentum."
      />

      <div className="market-grid">
        {markets.map((market, index) => (
          <motion.article
            key={market.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="market-card"
            whileHover={{ y: -6, scale: 1.01 }}
          >
            <div className="market-card__top">
              <p>{market.name}</p>
              {market.positive ? <TrendingUp className="market-icon market-icon--up" /> : <TrendingDown className="market-icon market-icon--down" />}
            </div>
            <h3>{market.value}</h3>
            <span className={market.positive ? 'market-change market-change--up' : 'market-change market-change--down'}>
              {market.change}
            </span>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default MarketOverview;

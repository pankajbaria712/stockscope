import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageShell from '../Components/PageShell';

const values = [
  {
    title: 'Clarity first',
    description: 'We turn noisy market data into clear, useful information so investors can focus on what matters.',
  },
  {
    title: 'Built for momentum',
    description: 'Real-time insights and watchlist tracking make it easier to react quickly without losing context.',
  },
  {
    title: 'Trusted experience',
    description: 'Every interaction is designed to feel secure, polished, and dependable from sign-in to portfolio review.',
  },
];

const stats = [
  { label: 'Live market coverage', value: '24/7' },
  { label: 'Fast navigation', value: 'Instant' },
  { label: 'Investor focus', value: '100%' },
];

function AboutPage() {
  return (
    <PageShell
      title="About"
      heading="About StockScope"
      description="Learn more about the purpose, principles, and product vision behind StockScope."
      badge="Story"
    >
      <div className="about-page">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="info-card about-hero">
          <div className="about-hero__intro">
            <div>
              <p className="page-badge">Mission</p>
              <h2>Make modern investing feel calm, clear, and actionable.</h2>
              <p>
                StockScope brings together company discovery, market insights, and portfolio tracking in one refined workspace.
                Whether you are researching a new opportunity or checking your watchlist, the experience is designed to stay elegant and useful.
              </p>
            </div>
            <div className="about-hero__highlights">
              <span className="about-chip"><TrendingUp size={14} /> Live market awareness</span>
              <span className="about-chip"><ShieldCheck size={14} /> Secure account experience</span>
              <span className="about-chip"><Sparkles size={14} /> Premium product feel</span>
            </div>
          </div>
        </motion.section>

        <div className="about-grid">
          <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="info-card about-card">
            <div className="about-card__icon">
              <BarChart3 size={18} />
            </div>
            <h3>Why StockScope exists</h3>
            <p>
              The platform was built to help people stay close to the market without getting buried in cluttered dashboards or fragmented tools.
            </p>
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="info-card about-card">
            <div className="about-card__icon">
              <ShieldCheck size={18} />
            </div>
            <h3>What makes it different</h3>
            <p>
              StockScope combines strong product design, responsive interactions, and dependable stock data into a focused experience for modern investors.
            </p>
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }} className="info-card about-card">
            <div className="about-card__icon">
              <Sparkles size={18} />
            </div>
            <h3>Built for your routine</h3>
            <p>
              From discovering companies to following your watchlist, StockScope supports a smooth everyday workflow for people who care about markets.
            </p>
          </motion.article>
        </div>

        <div className="about-grid about-grid--values">
          {values.map((item, index) => (
            <motion.article key={item.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + index * 0.04 }} className="info-card about-card about-card--soft">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </motion.article>
          ))}
        </div>

        <div className="about-stats">
          {stats.map((item) => (
            <div key={item.label} className="info-card about-stat-card">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="info-card about-cta">
          <h3>Ready to explore the market?</h3>
          <p>Jump into the platform and start building your watchlist with the same polished experience that powers the rest of StockScope.</p>
          <Link to="/search" className="primary-button about-cta__button">
            Discover companies
            <ArrowRight size={16} />
          </Link>
        </motion.section>
      </div>
    </PageShell>
  );
}

export default AboutPage;

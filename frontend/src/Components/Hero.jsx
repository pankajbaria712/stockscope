import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, ShieldCheck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

function Hero() {
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
                  <p className="metric-label">Portfolio health</p>
                  <h3>$184.2K</h3>
                </div>
                <div className="positive-chip">
                  <TrendingUp size={16} />
                  +8.24%
                </div>
              </div>
              <div className="chart-placeholder" />
            </div>

            <div className="glass-card hero-card hero-card--side">
              <div className="hero-card__header">
                <div>
                  <p className="metric-label">Watchlist</p>
                  <h4>NVDA</h4>
                </div>
                <ShieldCheck size={18} className="hero-icon" />
              </div>
              <p className="hero-card__text">Momentum remains strong with above-average volume.</p>
            </div>

            <div className="glass-card hero-card hero-card--floating">
              <BarChart3 size={18} className="hero-icon" />
              <div>
                <p className="metric-label">Compare</p>
                <h4>AAPL vs MSFT</h4>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function CTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="cta-section"
    >
      <div className="cta-section__content">
        <p className="hero-eyebrow">Start your journey</p>
        <h2>Start Your Investment Research Journey Today</h2>
        <p>Build trust in your decisions with an elegant research workspace designed to feel premium from day one.</p>
        <div className="hero-actions">
          <Link to="/register" className="primary-button hero-button">
            Create Free Account
            <ArrowRight size={16} />
          </Link>
          <Link to="/search" className="secondary-button hero-button">
            Explore Companies
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

export default CTA;

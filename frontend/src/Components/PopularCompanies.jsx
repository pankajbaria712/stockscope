import { motion } from 'framer-motion';
import { BookmarkPlus } from 'lucide-react';
import SectionHeading from './UI/SectionHeading';

function formatMarketCap(value) {
  if (value === null || value === undefined) {
    return '—';
  }

  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value);
}

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

function PopularCompanies({ loading, companies = [] }) {
  const companyCards = loading
    ? Array.from({ length: 4 }).map((_, index) => ({ id: index }))
    : companies;

  return (
    <section className="section-block">
      <SectionHeading
        eyebrow="Popular companies"
        title="Build research habits around the names that matter"
        description="Follow industry leaders and keep promising opportunities in your radar."
      />

      <div className="company-grid">
        {companyCards.map((company, index) => {
          const isPlaceholder = loading || !company?.name;
          const logo = isPlaceholder ? '•' : company.name.charAt(0);

          return (
            <motion.article
              key={company?.symbol || company?.name || company.id || index}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="company-card"
            >
              <div className="company-card__top">
                <div className="company-logo">{logo}</div>
                <button className="ghost-button" type="button" aria-label={isPlaceholder ? 'Loading' : `Save ${company.name} to watchlist`}>
                  <BookmarkPlus size={16} />
                </button>
              </div>
              <h3>{isPlaceholder ? 'Loading company' : company.name}</h3>
              <p className="company-meta">{isPlaceholder ? 'Loading industry' : company.industry || 'Industry data unavailable'}</p>
              <div className="company-details">
                <div>
                  <span>Market cap</span>
                  <strong>{isPlaceholder ? '—' : formatMarketCap(company.marketCap)}</strong>
                </div>
                <div>
                  <span>Price</span>
                  <strong>{isPlaceholder ? '—' : formatCurrency(company.currentPrice)}</strong>
                </div>
              </div>
              <p className="company-description">{isPlaceholder ? 'Fetching company insights from premium market sources.' : company.description}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default PopularCompanies;

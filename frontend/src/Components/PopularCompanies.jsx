import { motion } from 'framer-motion';
import { BookmarkPlus } from 'lucide-react';
import SectionHeading from './UI/SectionHeading';

const companies = [
  { name: 'Alphabet', industry: 'Technology', marketCap: '$2.1T', country: 'United States', description: 'Cloud, AI, and advertising platforms with expanding global reach.' },
  { name: 'JPMorgan Chase', industry: 'Banking', marketCap: '$700B', country: 'United States', description: 'Leading financial institution with deep market and consumer banking coverage.' },
  { name: 'Samsung', industry: 'Electronics', marketCap: '$420B', country: 'South Korea', description: 'Innovative hardware and semiconductor leader across global markets.' },
  { name: 'Toyota', industry: 'Automotive', marketCap: '$260B', country: 'Japan', description: 'Global mobility company balancing innovation and stable capital returns.' },
];

function PopularCompanies() {
  return (
    <section className="section-block">
      <SectionHeading
        eyebrow="Popular companies"
        title="Build research habits around the names that matter"
        description="Follow industry leaders and keep promising opportunities in your radar."
      />

      <div className="company-grid">
        {companies.map((company, index) => (
          <motion.article
            key={company.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            whileHover={{ y: -5, scale: 1.01 }}
            className="company-card"
          >
            <div className="company-card__top">
              <div className="company-logo">{company.name.charAt(0)}</div>
              <button className="ghost-button" type="button" aria-label={`Save ${company.name} to watchlist`}>
                <BookmarkPlus size={16} />
              </button>
            </div>
            <h3>{company.name}</h3>
            <p className="company-meta">{company.industry}</p>
            <div className="company-details">
              <div>
                <span>Market cap</span>
                <strong>{company.marketCap}</strong>
              </div>
              <div>
                <span>Country</span>
                <strong>{company.country}</strong>
              </div>
            </div>
            <p className="company-description">{company.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default PopularCompanies;

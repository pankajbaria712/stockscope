import { motion } from 'framer-motion';
import { Search, GitCompareArrows, ListChecks, ChartLine, Sparkles, BookOpen } from 'lucide-react';
import SectionHeading from './UI/SectionHeading';

const featureItems = [
  { title: 'Lightning Fast Search', description: 'Find companies instantly with curated filters and intelligent organization.', icon: Search },
  { title: 'Company Comparison', description: 'Evaluate side-by-side performance, metrics, and narrative context.', icon: GitCompareArrows },
  { title: 'Watchlists', description: 'Save and revisit companies with a calm, focused workspace.', icon: ListChecks },
  { title: 'Historical Charts', description: 'Trace trends and spot patterns with polished visual storytelling.', icon: ChartLine },
  { title: 'Market Insights', description: 'Understand top movers and core signals without overwhelming noise.', icon: Sparkles },
  { title: 'Beginner Friendly', description: 'A smooth learning path for first-time investors and experienced traders alike.', icon: BookOpen },
];

function Features() {
  return (
    <section className="section-block">
      <SectionHeading
        eyebrow="Why choose StockScope"
        title="A premium experience built for modern research"
        description="Thoughtful product design and confidence-building workflows make the difference."
        align="center"
      />

      <div className="feature-grid">
        {featureItems.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="feature-card"
            >
              <div className="feature-icon">
                <Icon size={20} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default Features;

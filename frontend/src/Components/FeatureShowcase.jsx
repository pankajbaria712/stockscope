import { motion } from 'framer-motion';
import { SearchCheck, Microscope, BarChart3, ListChecks } from 'lucide-react';

const showcases = [
  {
    title: 'Powerful search',
    description: 'Search companies by name, symbol, sector, and market context with a carefully designed experience.',
    icon: SearchCheck,
  },
  {
    title: 'Company analysis',
    description: 'Review essential company context, performance patterns, and healthy research signals.',
    icon: Microscope,
  },
  {
    title: 'Interactive charts',
    description: 'Visualize trends, compare views, and interact with polished chart states.',
    icon: BarChart3,
  },
  {
    title: 'Personal watchlist',
    description: 'Create a calm, personal workspace for the names you want to track more closely.',
    icon: ListChecks,
  },
];

function FeatureShowcase() {
  return (
    <section className="section-block showcase-section">
      <div className="showcase-grid">
        {showcases.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -18 : 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="showcase-card"
            >
              <div className="showcase-icon">
                <Icon size={20} />
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default FeatureShowcase;

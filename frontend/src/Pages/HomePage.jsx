import Navbar from '../Components/Navbar';
import Hero from '../Components/Hero';
import MarketOverview from '../Components/MarketOverview';
import TrendingStocks from '../Components/TrendingStocks';
import PopularCompanies from '../Components/PopularCompanies';
import Features from '../Components/Features';
import FeatureShowcase from '../Components/FeatureShowcase';
import CTA from '../Components/CTA';
import Footer from '../Components/Footer';

function HomePage() {
  return (
    <>
      <Navbar />
      <main className="landing-page">
        <Hero />
        <MarketOverview />
        <TrendingStocks />
        <PopularCompanies />
        <Features />
        <FeatureShowcase />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

export default HomePage;

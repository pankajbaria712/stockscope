import Hero from '../Components/Hero';
import MarketOverview from '../Components/MarketOverview';
import PopularCompanies from '../Components/PopularCompanies';
import TrendingStocks from '../Components/TrendingStocks';
import Footer from '../Components/Footer';
import { useHomepageData } from '../Hooks/useHomepageData';

function HomePage() {
  const {
    loading,
    error,
    heroData,
    marketOverviewData,
    trendingStocksData,
    popularCompaniesData,
    lastRefreshedAt,
    isUpdating,
  } = useHomepageData();

  return (
    <>
      <Hero loading={loading} error={error} heroData={heroData} lastRefreshedAt={lastRefreshedAt} isUpdating={isUpdating} />
      <MarketOverview loading={loading} marketData={marketOverviewData} />
      <PopularCompanies loading={loading} companies={popularCompaniesData} />
      <TrendingStocks loading={loading} stocks={trendingStocksData} />
      <Footer />
    </>
  );
}

export default HomePage;

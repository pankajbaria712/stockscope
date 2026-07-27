import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from '../Components/PageShell';
import Loader from '../Components/Loader';
import StockChart from '../Components/charts/StockChart';
import { getCompanyDetails, getStockChart, getStockQuote } from '../Services/stockService';

const RANGE_OPTIONS = [
  { label: '1D', value: '1D', range: '1D' },
  { label: '5D', value: '5D', range: '5D' },
  { label: '1M', value: '1M', range: '1M' },
  { label: '3M', value: '3M', range: '3M' },
  { label: '6M', value: '6M', range: '6M' },
  { label: '1Y', value: '1Y', range: '1Y' },
  { label: '5Y', value: '5Y', range: '5Y' },
  { label: 'MAX', value: 'MAX', range: 'MAX' },
];

function CompanyDetailsPage() {
  const { symbol } = useParams();
  const [details, setDetails] = useState(null);
  const [quote, setQuote] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [range, setRange] = useState(RANGE_OPTIONS[2]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const normalizedDetails = useMemo(() => {
    if (!details) {
      return null;
    }

    return {
      ...details,
      description: details.longBusinessSummary || details.description || 'No company description is available yet.',
    };
  }, [details]);

  const normalizedQuote = useMemo(() => {
    if (!quote) {
      return null;
    }

    return {
      price: quote.currentPrice ?? quote.price ?? null,
      change: quote.change ?? null,
      previous_close: quote.previousClose ?? quote.previous_close ?? null,
      volume: quote.volume ?? null,
      open: quote.open ?? null,
      high: quote.high ?? null,
      low: quote.low ?? null,
      market_status: quote.marketState ?? quote.market_status ?? 'Unknown',
    };
  }, [quote]);

  useEffect(() => {
    async function loadCompany() {
      if (!symbol) {
        setDetails(null);
        setQuote(null);
        setChartData([]);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setDetails(null);
      setQuote(null);
      setChartData([]);

      try {
        const [companyResponse, quoteResponse, chartResponse] = await Promise.all([
          getCompanyDetails(symbol),
          getStockQuote(symbol),
          getStockChart(symbol, { range: range.range }),
        ]);

        setDetails(companyResponse?.data || null);
        setQuote(quoteResponse?.data || null);
        setChartData(chartResponse?.data?.data || []);
      } catch (stockError) {
        setError(stockError?.response?.data?.message || stockError?.message || 'Unable to load company data.');
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [range, symbol]);

  if (loading) {
    return (
      <PageShell title="Company Details" heading="Company overview" description="Inspect a single company with rich details and supporting market context." badge="Insights">
        <Loader />
      </PageShell>
    );
  }

  return (
    <PageShell title="Company Details" heading={normalizedDetails?.name || symbol} description="Inspect a single company with rich details and supporting market context." badge="Insights">
      {error ? <div className="stock-error-banner">{error}</div> : null}
      {!error && normalizedDetails ? (
        <>
          <section className="info-card stock-detail-card">
            <div className="stock-detail-header">
              <div>
                <p className="section-eyebrow">Market overview</p>
                <h2>{normalizedDetails.name}</h2>
                <p className="stock-detail-subtitle">{normalizedDetails.symbol} • {normalizedDetails.exchange || 'Unknown exchange'}</p>
              </div>
              <div className="stock-logo-placeholder">{normalizedDetails.symbol?.slice(0, 2) || 'ST'}</div>
            </div>

            <div className="stock-metrics-grid">
              <div className="stock-metric-card">
                <span className="metric-label">Current price</span>
                <strong>{normalizedQuote?.price != null ? `$${normalizedQuote.price.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">Today's change</span>
                <strong>{normalizedQuote?.change != null ? `${normalizedQuote.change.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">Previous close</span>
                <strong>{normalizedQuote?.previous_close != null ? `$${normalizedQuote.previous_close.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">Volume</span>
                <strong>{normalizedQuote?.volume != null ? normalizedQuote.volume.toLocaleString() : 'N/A'}</strong>
              </div>
            </div>

            <div className="stock-detail-grid">
              <div className="stock-detail-section">
                <h3>Company profile</h3>
                <p>{normalizedDetails.description || 'No company description is available yet.'}</p>
                <ul className="stock-detail-list">
                  <li><span>Industry</span><strong>{normalizedDetails.industry || 'N/A'}</strong></li>
                  <li><span>Sector</span><strong>{normalizedDetails.sector || 'N/A'}</strong></li>
                  <li><span>Currency</span><strong>{normalizedDetails.currency || 'N/A'}</strong></li>
                  <li><span>Country</span><strong>{normalizedDetails.country || 'N/A'}</strong></li>
                  <li><span>Website</span><strong>{normalizedDetails.website ? <a href={normalizedDetails.website} target="_blank" rel="noreferrer">Visit</a> : 'N/A'}</strong></li>
                </ul>
              </div>
              <div className="stock-detail-section">
                <h3>Market snapshot</h3>
                <ul className="stock-detail-list">
                  <li><span>Symbol</span><strong>{normalizedDetails.symbol}</strong></li>
                  <li><span>Exchange</span><strong>{normalizedDetails.exchange || 'N/A'}</strong></li>
                  <li><span>Open</span><strong>{normalizedQuote?.open != null ? `$${normalizedQuote.open.toFixed(2)}` : 'N/A'}</strong></li>
                  <li><span>High</span><strong>{normalizedQuote?.high != null ? `$${normalizedQuote.high.toFixed(2)}` : 'N/A'}</strong></li>
                  <li><span>Low</span><strong>{normalizedQuote?.low != null ? `$${normalizedQuote.low.toFixed(2)}` : 'N/A'}</strong></li>
                  <li><span>Market status</span><strong>{normalizedQuote?.market_status || normalizedDetails.market_status || 'Unknown'}</strong></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="info-card">
            <div className="stock-chart-header">
              <div>
                <p className="section-eyebrow">Historical prices</p>
                <h2>Price chart</h2>
              </div>
              <div className="stock-range-toggle">
                {RANGE_OPTIONS.map((option) => (
                  <button key={option.value} className={option.value === range.value ? 'stock-range-toggle__button active' : 'stock-range-toggle__button'} onClick={() => setRange(option)} type="button">
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="stock-chart-card">
              <StockChart data={chartData} symbol={normalizedDetails.symbol} />
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}

export default CompanyDetailsPage;

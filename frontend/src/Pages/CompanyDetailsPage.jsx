import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from '../Components/PageShell';
import Loader from '../Components/Loader';
import StockCandlestickChart from '../Components/charts/StockCandlestickChart';
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
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState('');
  const activeRequestRef = useRef(0);
  const previousSymbolRef = useRef(symbol);

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
        setChartLoading(false);
        return;
      }

      const requestId = activeRequestRef.current + 1;
      activeRequestRef.current = requestId;
      const shouldResetChartData = previousSymbolRef.current !== symbol;
      previousSymbolRef.current = symbol;
      setLoading(true);
      setError('');
      setDetails(null);
      setQuote(null);
      if (shouldResetChartData) {
        setChartData([]);
      }
      setChartLoading(true);

      try {
        const [companyResponse, quoteResponse, chartResponse] = await Promise.all([
          getCompanyDetails(symbol),
          getStockQuote(symbol),
          getStockChart(symbol, { range: range.range }),
        ]);

        if (activeRequestRef.current !== requestId) {
          return;
        }

        setDetails(companyResponse?.data || null);
        setQuote(quoteResponse?.data || null);
        setChartData(chartResponse?.data?.data || []);
      } catch (stockError) {
        if (activeRequestRef.current !== requestId) {
          return;
        }

        setError(stockError?.response?.data?.message || stockError?.message || 'Unable to load company data.');
      } finally {
        if (activeRequestRef.current === requestId) {
          setLoading(false);
          setChartLoading(false);
        }
      }
    }

    loadCompany();

    return () => {
      activeRequestRef.current += 1;
    };
  }, [range, symbol]);

  const chartSummary = useMemo(() => {
    if (!chartData.length) {
      return null;
    }

    const latest = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const change = latest.close - previous?.close;
    const changePercent = previous?.close ? (change / previous.close) * 100 : 0;

    return {
      latestPrice: latest.close,
      change,
      changePercent,
      open: latest.open,
      high: Math.max(...chartData.map((item) => item.high)),
      low: Math.min(...chartData.map((item) => item.low)),
      previousClose: previous?.close ?? latest.open,
      volume: latest.volume || 0,
    };
  }, [chartData]);

  const chartStatusText = useMemo(() => {
    if (!normalizedQuote?.market_status) {
      return 'Market status unavailable';
    }

    return normalizedQuote.market_status;
  }, [normalizedQuote]);

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

            <div className="stock-chart-summary-grid">
              <div className="stock-metric-card">
                <span className="metric-label">Current price</span>
                <strong>{chartSummary?.latestPrice != null ? `$${chartSummary.latestPrice.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">Today's change</span>
                <strong className={chartSummary?.change >= 0 ? 'positive-value' : 'negative-value'}>{chartSummary?.change != null ? `${chartSummary.change >= 0 ? '+' : ''}${chartSummary.change.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">% change</span>
                <strong className={chartSummary?.changePercent >= 0 ? 'positive-value' : 'negative-value'}>{chartSummary?.changePercent != null ? `${chartSummary.changePercent >= 0 ? '+' : ''}${chartSummary.changePercent.toFixed(2)}%` : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">Open</span>
                <strong>{chartSummary?.open != null ? `$${chartSummary.open.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">High</span>
                <strong>{chartSummary?.high != null ? `$${chartSummary.high.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">Low</span>
                <strong>{chartSummary?.low != null ? `$${chartSummary.low.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">Previous close</span>
                <strong>{chartSummary?.previousClose != null ? `$${chartSummary.previousClose.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">Volume</span>
                <strong>{chartSummary?.volume ? chartSummary.volume.toLocaleString() : 'N/A'}</strong>
              </div>
              <div className="stock-metric-card">
                <span className="metric-label">Market status</span>
                <strong>{chartStatusText}</strong>
              </div>
            </div>

            <div className="stock-chart-card">
              <StockCandlestickChart data={chartData} symbol={normalizedDetails.symbol} isLoading={chartLoading} error={error} />
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}

export default CompanyDetailsPage;

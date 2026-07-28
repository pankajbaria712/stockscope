import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from '../Components/PageShell';
import Loader from '../Components/Loader';
import StockCandlestickChart from '../Components/charts/StockCandlestickChart';
import CompanyHeader from '../Components/CompanyHeader';
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
  const [isWatchlisted, setIsWatchlisted] = useState(false);
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
      symbol: quote.symbol || normalizedDetails?.symbol || symbol,
      currentPrice: quote.currentPrice ?? quote.price ?? null,
      change: quote.change ?? null,
      changePercent: quote.changePercent ?? null,
      previousClose: quote.previousClose ?? quote.previous_close ?? null,
      volume: quote.volume ?? null,
      open: quote.open ?? null,
      high: quote.high ?? null,
      low: quote.low ?? null,
      marketState: quote.marketState ?? quote.market_status ?? 'Unknown',
      currency: quote.currency || normalizedDetails?.currency || 'USD',
      lastUpdated: quote.lastUpdated ?? new Date().toISOString(),
      peRatio: quote.peRatio ?? null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow ?? null,
      averageVolume: quote.averageVolume ?? null,
    };
  }, [quote, normalizedDetails, symbol]);

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
    if (!normalizedQuote?.marketState) {
      return 'Market status unavailable';
    }

    return normalizedQuote.marketState;
  }, [normalizedQuote]);

  if (loading) {
    return (
      <PageShell title="Company Details" heading="Company overview" description="Inspect a single company with rich details and supporting market context." badge="Insights">
        <Loader />
      </PageShell>
    );
  }

  const handleToggleWatchlist = () => {
    setIsWatchlisted((current) => !current);
  };

  const handleOpenChart = () => {
    const chartSection = document.getElementById('company-chart-section');
    if (chartSection) {
      chartSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PageShell title="Company Details" heading={normalizedDetails?.name || symbol} description="Inspect a single company with rich details and supporting market context." badge="Insights">
      {error ? <div className="stock-error-banner">{error}</div> : null}
      {!error && normalizedDetails ? (
        <>
          <section className="company-details-card info-card stock-detail-card">
            <CompanyHeader
              details={normalizedDetails}
              quote={normalizedQuote}
              isWatchlisted={isWatchlisted}
              onToggleWatchlist={handleToggleWatchlist}
              onOpenChart={handleOpenChart}
            />
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

            <div className="stock-chart-card" id="company-chart-section">
              <StockCandlestickChart data={chartData} symbol={normalizedDetails.symbol} isLoading={chartLoading} error={error} />
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}

export default CompanyDetailsPage;

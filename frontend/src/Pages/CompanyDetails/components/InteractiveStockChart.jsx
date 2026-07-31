import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Download, Maximize2, RefreshCcw, Sparkles, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../Context/ThemeContext';
import { getCompanyDetails, getStockChart, getStockQuote } from '../../../Services/stockService';
import LiveValue from '../../../Components/LiveValue';

const RANGE_OPTIONS = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'MAX'];
const CHART_TYPES = ['line', 'candlestick'];
const INTERVAL_OPTIONS = ['1m', '2m', '5m', '15m', '30m', '60m'];

const fallbackInterval = {
  '1D': '5m',
  '5D': '15m',
  '1M': '15m',
  '3M': '1h',
  '6M': '1d',
  '1Y': '1d',
  '5Y': '1wk',
  'MAX': '1mo',
};

const RANGE_INTERVAL_MAP = {
  '1D': ['1m', '2m', '5m', '15m', '30m', '60m'],
  '5D': ['5m', '15m', '30m', '60m'],
  '1M': ['5m', '15m', '30m', '60m', '1d'],
  '3M': ['15m', '30m', '60m', '1d'],
  '6M': ['30m', '60m', '1d'],
  '1Y': ['60m', '1d'],
  '5Y': ['1d', '1wk'],
  MAX: ['1d', '1wk', '1mo'],
};

function normalizeChartData(data = []) {
  if (!Array.isArray(data)) return [];

  return data
    .filter((item) => item && Number.isFinite(item.time) && Number.isFinite(item.open) && Number.isFinite(item.high) && Number.isFinite(item.low) && Number.isFinite(item.close))
    .map((item) => ({
      time: Number(item.time),
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close),
      volume: Number(item.volume ?? 0),
    }));
}

function mapIntervalToTradingView(interval) {
  switch (interval) {
    case '1m':
    case '2m':
      return '1';
    case '5m':
      return '5';
    case '15m':
      return '15';
    case '30m':
      return '30';
    case '60m':
    case '1h':
      return '60';
    case '1d':
    case 'D':
      return 'D';
    case '1wk':
    case 'W':
      return 'W';
    case '1mo':
    case 'M':
      return 'M';
    default:
      return 'D';
  }
}

function extractChartSeriesData(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload && payload.data && Array.isArray(payload.data.data)) {
    return payload.data.data;
  }

  return [];
}

function formatCurrency(value, currency) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(Number(value));
  } catch {
    return String(value);
  }
}

function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${value >= 0 ? '+' : ''}${Number(value).toFixed(2)}%`;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function InteractiveStockChart({ symbol, initialRange = '1D', initialChartType = 'candlestick', initialInterval = null, compact = false }) {
  const { theme } = useTheme();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const widgetScriptRef = useRef(null);
  const widgetRef = useRef(null);
  const [range, setRange] = useState(initialRange);
  const [chartType, setChartType] = useState(initialChartType);
  const [interval, setInterval] = useState(initialInterval || fallbackInterval[initialRange] || '5m');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState([]);
  const [quote, setQuote] = useState(null);
  const [exchange, setExchange] = useState('NASDAQ');
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [flashClass, setFlashClass] = useState('');
  const previousPrice = usePrevious(quote?.currentPrice);

  const isDark = theme === 'dark';
  const normalizedData = useMemo(() => normalizeChartData(chartData), [chartData]);
  const hasData = normalizedData.length > 0;
  const priceChange = quote?.currentPrice != null && quote?.previousClose != null ? quote.currentPrice - quote.previousClose : null;

  const selectedInterval = useMemo(() => interval || fallbackInterval[range], [interval, range]);
  const chartContainerId = useMemo(() => {
    const safeSymbol = (symbol || 'stock').replace(/[^a-zA-Z0-9_-]/g, '-');
    return `tradingview-${safeSymbol}-${range}-${selectedInterval}-${chartType}-${theme}-${isFullscreen ? 'fullscreen' : 'normal'}`;
  }, [chartType, isFullscreen, range, selectedInterval, symbol, theme]);

  const loadChart = useCallback(async () => {
    setError('');
    setIsLoading(true);
    const cacheKey = `${symbol}:${range}:${selectedInterval}`;
    const cacheEntry = cacheRef.current.get(cacheKey);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (cacheEntry) {
        const normalizedCacheEntry = extractChartSeriesData(cacheEntry);
        setChartData(normalizedCacheEntry);
      }

      const [companyResp, chartResp, quoteResp] = await Promise.all([
        getCompanyDetails(symbol, { signal: controller.signal }),
        cacheEntry ? Promise.resolve({ data: cacheEntry }) : getStockChart(symbol, { range, interval: selectedInterval, signal: controller.signal }),
        getStockQuote(symbol, { signal: controller.signal }),
      ]);

      if (controller.signal.aborted) {
        return;
      }

      const chartPayload = extractChartSeriesData(chartResp?.data ?? chartResp ?? cacheEntry);
      setChartData(chartPayload);
      cacheRef.current.set(cacheKey, chartPayload);
      setQuote(quoteResp?.data || null);
      setExchange(companyResp?.data?.exchange || 'NASDAQ');
      setLastUpdate(Date.now());
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'canceled') {
        return;
      }
      setError(err?.message || err?.response?.data?.message || 'Unable to load chart data.');
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [symbol, range, selectedInterval]);

  const refreshPrice = useCallback(async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const quoteResp = await getStockQuote(symbol, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setQuote(quoteResp?.data || null);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'canceled') {
        return;
      }
      console.warn('Failed to refresh quote', err);
    }
  }, [symbol]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshPrice();
    }, 20000);
    return () => window.clearInterval(intervalId);
  }, [refreshPrice]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || !symbol) return undefined;

    const height = isFullscreen ? 560 : (compact ? 320 : 420);
    container.style.display = 'block';
    container.style.width = '100%';
    container.style.height = `${height}px`;
    container.style.minHeight = `${height}px`;
    container.style.background = 'transparent';

    const cleanupWidget = () => {
      if (widgetRef.current?.remove) {
        widgetRef.current.remove();
      }
      widgetRef.current = null;
      chartRef.current = null;
      container.innerHTML = '';
    };

    cleanupWidget();

    const mountWidget = () => {
      if (!window.TradingView?.widget) {
        return;
      }

      const widget = new window.TradingView.widget({
        autosize: true,
        symbol: `${exchange || 'NASDAQ'}:${symbol}`,
        interval: mapIntervalToTradingView(selectedInterval),
        timezone: 'Etc/UTC',
        theme: isDark ? 'dark' : 'light',
        style: chartType === 'line' ? '2' : '1',
        locale: 'en',
        toolbar_bg: isDark ? '#0f172a' : '#f8fafc',
        enable_publishing: false,
        allow_symbol_change: false,
        hide_top_toolbar: false,
        save_image: false,
        container_id: chartContainerId,
      });
      widgetRef.current = widget;
      chartRef.current = widget;
    };

    if (!window.TradingView?.widget) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        mountWidget();
      };
      script.onerror = () => {
        container.innerHTML = '<div class="chart-error-overlay"><p>Unable to load TradingView chart.</p></div>';
      };
      widgetScriptRef.current = script;
      document.body.appendChild(script);
      return () => {
        cleanupWidget();
        if (widgetScriptRef.current?.parentNode) {
          widgetScriptRef.current.parentNode.removeChild(widgetScriptRef.current);
        }
        widgetScriptRef.current = null;
      };
    }

    mountWidget();

    return () => {
      cleanupWidget();
    };
  }, [chartContainerId, chartType, exchange, hasData, isDark, isFullscreen, range, selectedInterval, compact, symbol, theme]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleRangeChange = (value) => {
    setRange(value);
    setInterval((current) => {
      const allowed = RANGE_INTERVAL_MAP[value] || [];
      return allowed.includes(current) ? current : fallbackInterval[value] || allowed[0] || '1d';
    });
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  const handleIntervalChange = (value) => {
    setInterval(value);
  };

  const handleResetZoom = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, []);

  const handleFullscreenToggle = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleDownload = () => {
    if (!chartRef.current) return;
    const data = chartRef.current.takeScreenshot();
    const link = document.createElement('a');
    link.href = data;
    link.download = `${symbol}-chart.png`;
    link.click();
  };

  const openFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = useCallback(() => setIsFullscreen(false), []);

  useEffect(() => {
    if (!isFullscreen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, closeFullscreen]);

  useEffect(() => {
    if (previousPrice == null || quote?.currentPrice == null) return undefined;
    const direction = quote.currentPrice > previousPrice ? 'price-flash-up' : quote.currentPrice < previousPrice ? 'price-flash-down' : '';
    if (!direction) return undefined;
    setFlashClass(direction);
    const timeout = window.setTimeout(() => setFlashClass(''), 400);
    return () => window.clearTimeout(timeout);
  }, [quote?.currentPrice, previousPrice]);

  return (
    <section className="company-details-chart" aria-labelledby="chart-section-title">
      <div className="chart-header-panel glass-card">
        <div>
          <p className="eyebrow">Interactive Chart</p>
          <h2 id="chart-section-title">{symbol}</h2>
          <p className="subtle">{quote?.marketState || 'Market Status unavailable'} · {range} · {chartType === 'line' ? 'Line' : 'Candlestick'} · {selectedInterval.toUpperCase()}</p>
        </div>
        <div className={`chart-header-values ${flashClass}`}>
          <span className="chart-price">{formatCurrency(quote?.currentPrice, quote?.currency)}</span>
          <span className={`chart-delta ${priceChange >= 0 ? 'positive' : 'negative'}`}>
            <LiveValue value={priceChange} format={(value) => `${value >= 0 ? '+' : ''}${value?.toFixed(2) ?? '—'}`} showIcon positive={priceChange > 0} />
            <small>{formatPercent(quote?.changePercent)}</small>
          </span>
          <small className="chart-last-updated">Last updated: {quote?.lastUpdated ? new Date(quote.lastUpdated).toLocaleTimeString() : '—'}</small>
        </div>
      </div>

      <div className="chart-toolbar glass-card">
        <div className="chart-toolbar-left">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`chart-pill ${option === range ? 'active' : ''}`}
              onClick={() => handleRangeChange(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="chart-toolbar-center">
          {INTERVAL_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`chart-pill ${option === selectedInterval ? 'active' : ''}`}
              onClick={() => handleIntervalChange(option)}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="chart-toolbar-center">
          {CHART_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`chart-pill ${type === chartType ? 'active' : ''}`}
              onClick={() => handleChartTypeChange(type)}
            >
              {type === 'line' ? <TrendingUp size={14} /> : <Sparkles size={14} />} {type === 'line' ? 'Line' : 'Candlestick'}
            </button>
          ))}
        </div>

        <div className="chart-toolbar-right">
          <button className="icon-pill" type="button" onClick={handleResetZoom} aria-label="Reset zoom"><ArrowUpRight size={16} /></button>
          <button className="icon-pill" type="button" onClick={loadChart} aria-label="Refresh chart"><RefreshCcw size={16} /></button>
          <button className="icon-pill" type="button" onClick={handleDownload} aria-label="Download chart as PNG"><Download size={16} /></button>
          <button className="icon-pill" type="button" onClick={openFullscreen} aria-label="Open fullscreen chart"><Maximize2 size={16} /></button>
        </div>
      </div>

      <div className="chart-container paper-card">
        {!isFullscreen ? <div id={chartContainerId} key={chartContainerId} ref={chartContainerRef} className="chart-canvas" /> : null}
        {isLoading ? (
          <div className="chart-loading-overlay" role="status" aria-live="polite">
            <div className="chart-skeleton" />
            <span>Loading historical data...</span>
          </div>
        ) : null}
        {!isLoading && error ? (
          <div className="chart-error-overlay" role="alert">
            <p>{error}</p>
          </div>
        ) : null}
        {!isLoading && !error && !hasData ? (
          <div className="chart-error-overlay" role="status">
            <p>No historical chart data is available for this symbol.</p>
          </div>
        ) : null}
      </div>

      {isFullscreen ? (
        <div className="chart-fullscreen-shell" role="dialog" aria-modal="true" aria-label="Fullscreen chart">
          <div className="chart-fullscreen-backdrop" onClick={closeFullscreen} />
          <div className="chart-fullscreen-content glass-card">
            <div className="fullscreen-header">
              <div>
                <h2>{symbol} Fullscreen Chart</h2>
                <p>{quote?.marketState || 'Market status unavailable'}</p>
              </div>
              <button className="icon-pill" type="button" onClick={closeFullscreen} aria-label="Close fullscreen"><ArrowUpRight size={18} /></button>
            </div>
            <div className="chart-fullscreen-toolbar">
              <div className="chart-toolbar-left">
                {RANGE_OPTIONS.map((option) => (
                  <button key={option} type="button" className={`chart-pill ${option === range ? 'active' : ''}`} onClick={() => handleRangeChange(option)}>{option}</button>
                ))}
              </div>
              <div className="chart-toolbar-center">
                {CHART_TYPES.map((type) => (
                  <button key={type} type="button" className={`chart-pill ${type === chartType ? 'active' : ''}`} onClick={() => handleChartTypeChange(type)}>{type === 'line' ? 'Line' : 'Candlestick'}</button>
                ))}
              </div>
              <div className="chart-toolbar-right">
                <button className="icon-pill" type="button" onClick={loadChart}><RefreshCcw size={16} /></button>
                <button className="icon-pill" type="button" onClick={handleDownload}><Download size={16} /></button>
              </div>
            </div>
            <div className="chart-container chart-container-fullscreen paper-card">
              <div id={chartContainerId} key={`${chartContainerId}-fullscreen`} ref={chartContainerRef} className="chart-canvas" />
              {isLoading ? (
                <div className="chart-loading-overlay" role="status" aria-live="polite">
                  <div className="chart-skeleton" />
                  <span>Refreshing chart...</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

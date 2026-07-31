import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { useTheme } from '../../Context/ThemeContext';
import { ArrowUpRight, BarChart3, Clock3, TrendingDown, TrendingUp } from 'lucide-react';
import LiveValue from '../LiveValue';

const RANGE_OPTIONS = [
  { label: '1D', value: '1D' },
  { label: '5D', value: '5D' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: '5Y', value: '5Y' },
  { label: 'MAX', value: 'MAX' },
];

const INTERVAL_OPTIONS = [
  { label: '1m', value: '1m' },
  { label: '2m', value: '2m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h', value: '60m' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1wk' },
];

function normalizeChartData(data = []) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.reduce((result, item) => {
    if (!item) {
      return result;
    }

    const time = item.time instanceof Date ? Math.floor(item.time.getTime() / 1000) : Number(item.time);
    const open = Number(item.open);
    const high = Number(item.high);
    const low = Number(item.low);
    const close = Number(item.close);
    const volume = Number(item.volume ?? 0);

    if (!Number.isFinite(time) || !Number.isFinite(open) || !Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(close)) {
      return result;
    }

    result.push({
      time,
      open,
      high,
      low,
      close,
      volume: Number.isFinite(volume) ? volume : 0,
    });

    return result;
  }, []);
}

function formatPrice(value, currency = 'USD') {
  if (value === null || value === undefined) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return String(value);
  }
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return '—';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function CompanyChart({
  data = [],
  symbol = '',
  quote = null,
  isLoading = false,
  error = '',
  range,
  onRangeChange,
  chartType,
  onChartTypeChange,
  interval,
  onIntervalChange,
  onOpenFullscreen,
  showRangeButtons = false,
  showFullscreenButton = true,
  showResetZoom = false,
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const volumeRef = useRef(null);
  const { theme } = useTheme();
  const normalizedData = useMemo(() => normalizeChartData(data), [data]);
  const hasData = normalizedData.length > 0;
  const priceChange = quote?.currentPrice != null && quote?.previousClose != null ? quote.currentPrice - quote.previousClose : null;
  const pricePositive = priceChange > 0;
  const currentPrice = quote?.currentPrice;
  const lastUpdated = quote?.lastUpdated ? new Date(quote.lastUpdated) : null;

  const chartOptions = useMemo(() => ({
    width: containerRef.current?.clientWidth || 640,
    height: 440,
    layout: {
      background: { type: ColorType.Solid, color: theme === 'dark' ? 'rgba(2, 8, 23, 0.98)' : 'rgba(248, 250, 252, 0.98)' },
      textColor: theme === 'dark' ? '#cbd5e1' : '#334155',
    },
    grid: {
      vertLines: { color: theme === 'dark' ? 'rgba(148, 163, 184, 0.16)' : 'rgba(71, 85, 105, 0.16)' },
      horzLines: { color: theme === 'dark' ? 'rgba(148, 163, 184, 0.16)' : 'rgba(71, 85, 105, 0.16)' },
    },
    crosshair: {
      mode: 1,
      vertLine: { color: theme === 'dark' ? 'rgba(34, 211, 238, 0.45)' : 'rgba(37, 99, 235, 0.35)' },
      horzLine: { color: theme === 'dark' ? 'rgba(34, 211, 238, 0.45)' : 'rgba(37, 99, 235, 0.35)' },
    },
    rightPriceScale: { borderColor: theme === 'dark' ? 'rgba(148, 163, 184, 0.24)' : 'rgba(100, 116, 139, 0.24)' },
    timeScale: { borderColor: theme === 'dark' ? 'rgba(148, 163, 184, 0.24)' : 'rgba(100, 116, 139, 0.24)' },
    localization: {
      priceFormatter: (price) => `$${Number(price).toFixed(2)}`,
    },
  }), [theme]);

  const createSeries = useCallback((chart) => {
    if (chartType === 'line') {
      return chart.addSeries(LineSeries, {
        color: '#22c55e',
        lineWidth: 2,
      });
    }

    return chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
  }, [chartType]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    if (!hasData) {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      return undefined;
    }

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, chartOptions);
    chartRef.current = chart;
    seriesRef.current = createSeries(chart);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      scaleMargins: { top: 0.72, bottom: 0 },
    });
    volumeRef.current = volumeSeries;

    const candlestickData = normalizedData
      .filter((item) => Number.isFinite(item.open) && Number.isFinite(item.high) && Number.isFinite(item.low) && Number.isFinite(item.close))
      .map((item) => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

    if (chartType === 'line') {
      seriesRef.current.setData(normalizedData.map((item) => ({ time: item.time, value: item.close })));
    } else {
      seriesRef.current.setData(candlestickData);
    }

    volumeSeries.setData(normalizedData.map((item) => ({ time: item.time, value: item.volume, color: item.close >= item.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)' })));
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth || 640 });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volumeRef.current = null;
    };
  }, [chartOptions, createSeries, hasData, normalizedData]);

  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || !hasData) {
      return undefined;
    }

    if (chartType === 'line') {
      seriesRef.current.setData(normalizedData.map((item) => ({ time: item.time, value: item.close })));
    } else {
      seriesRef.current.setData(normalizedData);
    }

    if (volumeRef.current) {
      volumeRef.current.setData(normalizedData.map((item) => ({ time: item.time, value: item.volume, color: item.close >= item.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)' })));
    }

    chartRef.current.timeScale().fitContent();
    return undefined;
  }, [chartType, hasData, normalizedData]);

  return (
    <div className="company-chart-shell">
      <div className="company-chart-toolbar">
        <div>
          <h3>{symbol}</h3>
          <p>{quote?.marketState || 'Market status unavailable'}</p>
        </div>
        <div className="company-chart-toolbar-values">
          <LiveValue value={currentPrice} format={(value) => formatPrice(value, quote?.currency)} showIcon positive={pricePositive} />
          <span>{priceChange != null ? `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}` : '—'}</span>
          <span>{quote?.changePercent != null ? formatPercent(quote.changePercent) : '—'}</span>
        </div>
        <div className="company-chart-toolbar-actions">
          <button type="button" className="ghost-button" onClick={onOpenFullscreen}>Full screen</button>
        </div>
      </div>

      <div className="company-chart-range-toggle">
        {RANGE_OPTIONS.map((option) => (
          <button key={option.value} className={option.value === range ? 'stock-range-toggle__button active' : 'stock-range-toggle__button'} onClick={() => onRangeChange(option.value)} type="button">
            {option.label}
          </button>
        ))}
      </div>

      <div className="company-chart-type-toggle">
        {['line', 'candlestick'].map((type) => (
          <button key={type} className={chartType === type ? 'stock-range-toggle__button active' : 'stock-range-toggle__button'} onClick={() => onChartTypeChange(type)} type="button">
            {type === 'line' ? 'Line chart' : 'Candlestick'}
          </button>
        ))}
      </div>

      {chartType === 'candlestick' ? (
        <div className="company-chart-interval-toggle">
          {INTERVAL_OPTIONS.map((option) => (
            <button key={option.value} className={interval === option.value ? 'stock-range-toggle__button active' : 'stock-range-toggle__button'} onClick={() => onIntervalChange(option.value)} type="button">
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="company-chart-container">
        <div ref={containerRef} className="stock-candlestick-chart" />
        {isLoading ? (
          <div className="stock-chart-overlay" role="status" aria-live="polite">
            <div className="stock-chart-skeleton" />
            <p>Loading chart data…</p>
          </div>
        ) : null}
        {!isLoading && !hasData && error ? (
          <div className="stock-chart-overlay stock-chart-overlay--error" role="alert">
            <p>{error}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CompanyChart;

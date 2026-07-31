import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createChart, CrosshairMode, ColorType, LineType, LineSeries } from 'lightweight-charts';
import { useTheme } from '../../../Context/ThemeContext';
import { getStockChart, getStockQuote } from '../../../Services/stockService';
import { ArrowUpRight } from 'lucide-react';

const RANGE_OPTIONS = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'MAX'];
const RETURN_METRICS = [
  { label: '1 DAY', range: '1D' },
  { label: '5 DAY', range: '5D' },
  { label: '1 MONTH', range: '1M' },
  { label: '3 MONTHS', range: '3M' },
  { label: '6 MONTHS', range: '6M' },
  { label: 'YTD', range: 'YTD' },
  { label: '1 YEAR', range: '1Y' },
  { label: '3 YEARS', range: '3Y' },
  { label: '5 YEARS', range: '5Y' },
  { label: '10 YEARS', range: '10Y' },
];

function toLocaleCurrency(value, currency = 'USD') {
  if (value == null || Number.isNaN(Number(value))) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(Number(value));
  } catch {
    return String(value);
  }
}

function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${value >= 0 ? '+' : ''}${Number(value).toFixed(2)}%`;
}

function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('en-US');
}

function normalizeBar(bar) {
  if (!bar || bar.time == null || bar.close == null) return null;
  return {
    time: Number(bar.time),
    open: Number(bar.open ?? bar.o ?? 0),
    high: Number(bar.high ?? bar.h ?? 0),
    low: Number(bar.low ?? bar.l ?? 0),
    close: Number(bar.close ?? bar.c ?? 0),
    volume: Number(bar.volume ?? bar.v ?? 0),
  };
}

function getDateOffset(range, latestDate) {
  const date = new Date(latestDate);
  switch (range) {
    case '1D':
      date.setDate(date.getDate() - 1);
      break;
    case '5D':
      date.setDate(date.getDate() - 5);
      break;
    case '1M':
      date.setMonth(date.getMonth() - 1);
      break;
    case '3M':
      date.setMonth(date.getMonth() - 3);
      break;
    case '6M':
      date.setMonth(date.getMonth() - 6);
      break;
    case '1Y':
      date.setFullYear(date.getFullYear() - 1);
      break;
    case '3Y':
      date.setFullYear(date.getFullYear() - 3);
      break;
    case '5Y':
      date.setFullYear(date.getFullYear() - 5);
      break;
    case '10Y':
      date.setFullYear(date.getFullYear() - 10);
      break;
    default:
      return null;
  }
  return date.getTime();
}

function getYtdTarget(latestDate) {
  const date = new Date(latestDate);
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getRangeSubset(data, range) {
  if (!Array.isArray(data) || data.length === 0) return [];
  const latest = data[data.length - 1].time * 1000;
  const targetMs = range === 'YTD' ? getYtdTarget(latest) : getDateOffset(range, latest);
  if (!targetMs) return data;
  return data.filter((bar) => bar.time * 1000 >= targetMs);
}

function computeReturn(data, currentPrice, range) {
  const subset = getRangeSubset(data, range);
  if (!subset.length || currentPrice == null) return null;
  const start = subset[0].close;
  if (!start || !Number.isFinite(start)) return null;
  return ((currentPrice - start) / start) * 100;
}

export default function PricePerformancePanel() {
  const { symbol } = useParams();
  const { theme } = useTheme();
  const [range, setRange] = useState('1Y');
  const [chartData, setChartData] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const tooltipRef = useRef(null);
  const cacheRef = useRef(new Map());
  const barMapRef = useRef(new Map());

  const currentPrice = quote?.currentPrice ?? null;
  const periodReturn = useMemo(() => computeReturn(chartData, currentPrice, range), [chartData, currentPrice, range]);
  const periodDelta = useMemo(() => {
    const subset = getRangeSubset(chartData, range);
    const start = subset[0]?.close;
    return start != null && currentPrice != null ? currentPrice - start : null;
  }, [chartData, currentPrice, range]);

  const trendPositive = periodReturn == null ? true : periodReturn >= 0;
  const lineColor = trendPositive ? '#16a34a' : '#dc2626';
  const topColor = trendPositive ? 'rgba(16, 163, 127, 0.22)' : 'rgba(239, 68, 68, 0.18)';
  const bottomColor = trendPositive ? 'rgba(16, 163, 127, 0.04)' : 'rgba(239, 68, 68, 0.06)';

  const historicalReturns = useMemo(
    () => RETURN_METRICS.map((item) => ({
      label: item.label,
      value: formatPercent(computeReturn(chartData, currentPrice, item.range)),
    })),
    [chartData, currentPrice],
  );

  const loadQuote = useCallback(async () => {
    try {
      const response = await getStockQuote(symbol);
      setQuote(response?.data || null);
    } catch (err) {
      console.warn('Failed to load quote', err);
    }
  }, [symbol]);

  const loadChart = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (cacheRef.current.has(range)) {
        setChartData(cacheRef.current.get(range));
        setLoading(false);
        return;
      }

      const response = await getStockChart(symbol, { range });
      const raw = Array.isArray(response?.data?.data) ? response.data.data : [];
      const normalized = raw
        .map(normalizeBar)
        .filter((bar) => bar && Number.isFinite(bar.time) && Number.isFinite(bar.close));

      cacheRef.current.set(range, normalized);
      setChartData(normalized);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load performance data');
    } finally {
      setLoading(false);
    }
  }, [range, symbol]);

  useEffect(() => {
    cacheRef.current.clear();
    setChartData([]);
    setQuote(null);
    setError('');
    setLoading(true);
    loadQuote();
  }, [loadQuote, symbol]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return undefined;

    if (!chartData.length) {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      return undefined;
    }

    const chartOptions = {
      width: container.clientWidth,
      height: 340,
      layout: {
        background: { type: ColorType.Solid, color: theme === 'dark' ? '#071021' : '#ffffff' },
        textColor: theme === 'dark' ? '#cbd5e1' : '#475569',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? 'rgba(148,163,184,0.08)' : 'rgba(71,85,105,0.12)' },
        horzLines: { color: theme === 'dark' ? 'rgba(148,163,184,0.08)' : 'rgba(71,85,105,0.12)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: theme === 'dark' ? 'rgba(56,189,248,0.55)' : 'rgba(37,99,235,0.45)', width: 1 },
        horzLine: { color: 'transparent' },
      },
      rightPriceScale: { borderColor: theme === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(71,85,105,0.14)' },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: theme === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(71,85,105,0.14)' },
      localization: {
        priceFormatter: (price) => toLocaleCurrency(price, quote?.currency),
      },
    };

    if (!chartRef.current) {
      chartRef.current = createChart(container, chartOptions);
      seriesRef.current = chartRef.current.addSeries(LineSeries, {
        color: lineColor,
        lineWidth: 3,
        topColor,
        bottomColor,
        lineType: LineType.Curved,
      });

      tooltipRef.current = document.createElement('div');
      tooltipRef.current.className = 'price-performance-tooltip';
      tooltipRef.current.style.display = 'none';
      container.appendChild(tooltipRef.current);

      chartRef.current.subscribeCrosshairMove((param) => {
        if (!param.point || !param.time || !param.seriesData || Object.keys(param.seriesData).length === 0) {
          tooltipRef.current.style.display = 'none';
          return;
        }

        const bar = barMapRef.current.get(typeof param.time === 'object' ? Number(param.time) : Number(param.time));
        if (!bar) {
          tooltipRef.current.style.display = 'none';
          return;
        }

        const date = new Date(bar.time * 1000);
        tooltipRef.current.innerHTML = `
          <div class="tooltip-title">${date.toLocaleDateString()}</div>
          <div class="tooltip-row"><span>Open</span><strong>${toLocaleCurrency(bar.open, quote?.currency)}</strong></div>
          <div class="tooltip-row"><span>High</span><strong>${toLocaleCurrency(bar.high, quote?.currency)}</strong></div>
          <div class="tooltip-row"><span>Low</span><strong>${toLocaleCurrency(bar.low, quote?.currency)}</strong></div>
          <div class="tooltip-row"><span>Close</span><strong>${toLocaleCurrency(bar.close, quote?.currency)}</strong></div>
          <div class="tooltip-row"><span>Volume</span><strong>${formatNumber(bar.volume)}</strong></div>
        `;
        tooltipRef.current.style.display = 'block';
        tooltipRef.current.style.left = `${Math.min(container.clientWidth - 260, Math.max(12, param.point.x + 12))}px`;
        tooltipRef.current.style.top = `${Math.max(12, param.point.y - 12)}px`;
      });
    } else {
      chartRef.current.applyOptions(chartOptions);
      seriesRef.current.applyOptions({ color: lineColor, topColor, bottomColor });
    }

    const lineData = chartData.map((bar) => ({ time: bar.time, value: bar.close }));
    seriesRef.current.setData(lineData);
    chartRef.current.timeScale().fitContent();
    barMapRef.current = new Map(chartData.map((bar) => [bar.time, bar]));

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [chartData, lineColor, topColor, bottomColor, quote?.currency, range, theme]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <section className="price-performance-panel">
        <div className="price-performance-header">
          <div>
            <p className="eyebrow">Price Performance</p>
            <h2>Loading performance data...</h2>
          </div>
        </div>
        <div className="price-performance-skeleton" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="price-performance-panel">
        <div className="price-performance-header">
          <div>
            <p className="eyebrow">Price Performance</p>
            <h2>Error loading performance</h2>
          </div>
        </div>
        <div className="price-performance-error">{error}</div>
      </section>
    );
  }

  return (
    <section className="price-performance-panel" aria-labelledby="price-performance-title">
      <div className="price-performance-header">
        <div>
          <p className="eyebrow">Recent price action and historical returns</p>
          <h2 id="price-performance-title">Price Performance</h2>
        </div>
        <div className="price-performance-actions">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`range-pill ${range === option ? 'range-pill--active' : ''}`}
              onClick={() => setRange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="price-performance-grid">
        <div className="performance-chart-card">
          <div className="performance-summary">
            <div>
              <p className="performance-price">{toLocaleCurrency(currentPrice, quote?.currency)}</p>
              <p className={`performance-change ${trendPositive ? 'positive' : 'negative'}`}>
                {periodDelta != null ? `${periodDelta >= 0 ? '+' : ''}${toLocaleCurrency(periodDelta, quote?.currency)}` : '—'}
                {' '}
                <span>({periodReturn != null ? formatPercent(periodReturn) : '—'})</span>
              </p>
            </div>
            <div className="performance-badge">
              <ArrowUpRight size={16} /> {range}
            </div>
          </div>
          <div ref={chartContainerRef} className="performance-chart" />
        </div>

        <div className="performance-returns-card">
          <p className="returns-title">Historical Returns</p>
          <div className="returns-grid">
            {historicalReturns.map((item) => (
              <div key={item.label} className="returns-tile">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

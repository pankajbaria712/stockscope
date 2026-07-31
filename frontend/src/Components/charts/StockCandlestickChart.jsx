import { useEffect, useMemo, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useTheme } from '../../Context/ThemeContext';

function normalizeChartData(data = []) {
  return Array.isArray(data)
    ? data
        .filter((item) => item && Number.isFinite(item.time) && Number.isFinite(item.open) && Number.isFinite(item.high) && Number.isFinite(item.low) && Number.isFinite(item.close))
        .map((item) => ({
          time: Number(item.time),
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          volume: Number(item.volume ?? 0),
        }))
    : [];
}

function StockCandlestickChart({ data = [], symbol = '', isLoading = false, error = '' }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const { theme } = useTheme();

  const normalizedData = useMemo(() => normalizeChartData(data), [data]);
  const hasData = normalizedData.length > 0;

  useEffect(() => {
    const container = chartContainerRef.current;

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

    if (chartRef.current && isLoading) {
      return undefined;
    }

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const isDarkTheme = theme === 'dark';
    const chart = createChart(container, {
      width: container.clientWidth || 640,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: isDarkTheme ? 'rgba(2, 8, 23, 0.98)' : 'rgba(248, 250, 252, 0.96)' },
        textColor: isDarkTheme ? '#cbd5e1' : '#334155',
      },
      grid: {
        vertLines: { color: isDarkTheme ? 'rgba(148, 163, 184, 0.16)' : 'rgba(71, 85, 105, 0.16)' },
        horzLines: { color: isDarkTheme ? 'rgba(148, 163, 184, 0.16)' : 'rgba(71, 85, 105, 0.16)' },
      },
      crosshair: { mode: 1, vertLine: { color: isDarkTheme ? 'rgba(34, 211, 238, 0.45)' : 'rgba(37, 99, 235, 0.35)' }, horzLine: { color: isDarkTheme ? 'rgba(34, 211, 238, 0.45)' : 'rgba(37, 99, 235, 0.35)' } },
      rightPriceScale: { borderColor: isDarkTheme ? 'rgba(148, 163, 184, 0.24)' : 'rgba(100, 116, 139, 0.24)' },
      leftPriceScale: { borderColor: isDarkTheme ? 'rgba(148, 163, 184, 0.24)' : 'rgba(100, 116, 139, 0.24)' },
      timeScale: { borderColor: isDarkTheme ? 'rgba(148, 163, 184, 0.24)' : 'rgba(100, 116, 139, 0.24)' },
      handleScale: true,
      handleScroll: true,
      localization: {
        priceFormatter: (price) => `$${Number(price).toFixed(2)}`,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#38bdf8',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
      scaleMargins: {
        top: 0.75,
        bottom: 0,
      },
    });

    candlestickSeries.setData(normalizedData);
    volumeSeries.setData(normalizedData.map((item) => ({ time: item.time, value: item.volume || 0, color: item.close >= item.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)' })));

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth || 640 });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      if (chartRef.current === chart) {
        chartRef.current = null;
      }
    };
  }, [hasData, isLoading, normalizedData, symbol, theme]);

  return (
    <div className="stock-candlestick-shell">
      <div ref={chartContainerRef} className="stock-candlestick-chart" />
      {isLoading ? (
        <div className="stock-chart-overlay" role="status" aria-live="polite">
          <div className="stock-chart-skeleton" />
          <p>Loading historical candles…</p>
        </div>
      ) : null}
      {!isLoading && !hasData && error ? (
        <div className="stock-chart-overlay stock-chart-overlay--error" role="alert">
          <p>{error}</p>
        </div>
      ) : null}
      {!isLoading && !hasData && !error ? (
        <div className="stock-chart-overlay" role="status" aria-live="polite">
          <p>No historical data is available for this timeframe yet.</p>
        </div>
      ) : null}
    </div>
  );
}

export default StockCandlestickChart;

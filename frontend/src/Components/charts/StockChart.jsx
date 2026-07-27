import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { useTheme } from '../../Context/ThemeContext';

function StockChart({ data = [], symbol = '' }) {
  const chartContainerRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const container = chartContainerRef.current;
    const width = container.clientWidth || 640;
    const normalizedData = Array.isArray(data)
      ? data
          .filter((item) => item && Number.isFinite(item.time) && Number.isFinite(item.open) && Number.isFinite(item.high) && Number.isFinite(item.low) && Number.isFinite(item.close))
          .map((item) => ({
            time: Number(item.time),
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close),
          }))
      : [];

    if (!normalizedData.length) {
      return;
    }

    const isDarkTheme = theme === 'dark';
    const chart = createChart(container, {
      width,
      height: 320,
      layout: {
        background: { type: ColorType.Solid, color: isDarkTheme ? 'rgba(2, 8, 23, 0.95)' : 'rgba(248, 250, 252, 0.95)' },
        textColor: isDarkTheme ? '#cbd5e1' : '#334155',
      },
      grid: {
        vertLines: { color: isDarkTheme ? 'rgba(148, 163, 184, 0.12)' : 'rgba(71, 85, 105, 0.16)' },
        horzLines: { color: isDarkTheme ? 'rgba(148, 163, 184, 0.12)' : 'rgba(71, 85, 105, 0.16)' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: isDarkTheme ? 'rgba(148, 163, 184, 0.24)' : 'rgba(100, 116, 139, 0.24)' },
      timeScale: { borderColor: isDarkTheme ? 'rgba(148, 163, 184, 0.24)' : 'rgba(100, 116, 139, 0.24)' },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData(normalizedData);

    chart.timeScale().fitContent();
    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth || width });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, symbol, theme]);

  return <div ref={chartContainerRef} className="h-[320px] w-full rounded-2xl" />;
}

export default StockChart;

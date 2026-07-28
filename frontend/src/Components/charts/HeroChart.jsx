import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import { useTheme } from '../../Context/ThemeContext';

function HeroChart({ data = [] }) {
  const chartContainerRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const container = chartContainerRef.current;
    const normalizedData = Array.isArray(data)
      ? data
          .filter((item) => item && item.time && Number.isFinite(item.value))
          .map((item) => ({
            time: item.time,
            value: Number(item.value),
          }))
      : [];

    if (!normalizedData.length) {
      return;
    }

    const isDarkTheme = theme === 'dark';
    const chart = createChart(container, {
      width: container.clientWidth || 320,
      height: container.clientHeight || 130,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDarkTheme ? '#cbd5e1' : '#475569',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { visible: false },
      timeScale: {
        visible: false,
        borderColor: 'transparent',
      },
      localization: {
        priceFormatter: (price) => price.toFixed(2),
      },
    });

    const series = chart.addSeries(LineSeries, {
      color: isDarkTheme ? '#38bdf8' : '#0284c7',
      lineWidth: 2,
    });

    series.setData(normalizedData);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth || 320 });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, theme]);

  return <div ref={chartContainerRef} className="h-full w-full rounded-[1rem]" />;
}

export default HeroChart;

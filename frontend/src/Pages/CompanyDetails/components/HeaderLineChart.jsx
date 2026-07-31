import React, { useMemo } from 'react';

function normalize(data = []) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((d) => d && (d.time != null) && (d.close != null))
    .map((d) => ({ time: Number(d.time), value: Number(d.close) }));
}

export default function HeaderLineChart({ symbol, data = [] }) {
  const normalized = useMemo(() => normalize(data), [data]);

  if (!normalized.length) {
    return <div className="header-line-chart" style={{ height: 120 }} />;
  }

  const values = normalized.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 600;
  const height = 120;
  const padding = 8;

  const points = normalized.map((d, i) => {
    const x = padding + (i / Math.max(1, normalized.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (d.value - min) / Math.max(1e-8, max - min)) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const lastValue = values[values.length - 1];

  return (
    <div className="header-line-chart" style={{ width: '100%', maxWidth: '100%', height }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points.split(' ').pop().split(',')[0]} cy={points.split(' ').pop().split(',')[1]} r="3" fill="#2563eb" />
        <text x={width - padding} y={padding + 12} textAnchor="end" fontSize="12" fill="#0f172a">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(lastValue)}</text>
      </svg>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function defaultFormat(value) {
  return value === null || value === undefined ? '—' : String(value);
}

function LiveValue({
  value,
  format = defaultFormat,
  className = '',
  symbolClassName = '',
  showIcon = false,
  iconUp = '▲',
  iconDown = '▼',
  positive = null,
}) {
  const previousValueRef = useRef(value);
  const [direction, setDirection] = useState('none');

  useEffect(() => {
    if (previousValueRef.current === value || value === null || value === undefined) {
      previousValueRef.current = value;
      return undefined;
    }

    if (previousValueRef.current !== null && previousValueRef.current !== undefined) {
      const nextDirection = value > previousValueRef.current ? 'up' : value < previousValueRef.current ? 'down' : 'none';
      if (nextDirection !== 'none') {
        setDirection(nextDirection);
        const timer = window.setTimeout(() => setDirection('none'), 800);
        previousValueRef.current = value;
        return () => window.clearTimeout(timer);
      }
    }

    previousValueRef.current = value;
    return undefined;
  }, [value]);

  const colorClass = direction === 'up' ? 'live-value--up' : direction === 'down' ? 'live-value--down' : '';
  const textClass = positive === true ? 'live-value-positive' : positive === false ? 'live-value-negative' : '';
  const icon = direction === 'up' ? iconUp : direction === 'down' ? iconDown : '';

  return (
    <motion.span
      initial={false}
      animate={{ scale: direction === 'up' ? [1, 1.03, 1] : direction === 'down' ? [1, 0.97, 1] : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`live-value ${colorClass} ${textClass} ${className}`.trim()}
    >
      <span className={symbolClassName}>{format(value)}</span>
      {showIcon && icon ? <span className="live-value__icon">{icon}</span> : null}
    </motion.span>
  );
}

export default LiveValue;

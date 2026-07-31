import { useEffect, useState } from 'react';
import { getCompanyDetails, getStockQuote } from '../../../Services/stockService';

// Lightweight hook scaffold — keeps API access but does not auto-fetch.
export default function useCompanyData(symbol) {
  const [details, setDetails] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // We intentionally do not auto-invoke APIs here during the scaffold phase.
  // When rebuilding the UI we will wire these up carefully to avoid duplicate requests.
  useEffect(() => {
    return () => {};
  }, [symbol]);

  return { details, quote, loading, error, setDetails, setQuote, setLoading, setError };
}

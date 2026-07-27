import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp } from 'lucide-react';
import PageShell from '../Components/PageShell';
import { searchStocks } from '../Services/stockService';

const DEFAULT_SUGGESTIONS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL'];

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setError('');
        setLoading(false);
        return;
      }

      const currentRequestId = ++requestIdRef.current;
      setLoading(true);
      setError('');

      try {
        const response = await searchStocks(query);
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const payload = response?.data?.results || [];
        setResults(payload);
      } catch (stockError) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setResults([]);
        setError(stockError?.response?.data?.message || stockError?.message || 'Unable to search stocks right now.');
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      requestIdRef.current += 1;
    };
  }, [query]);

  const suggestions = useMemo(() => DEFAULT_SUGGESTIONS.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()) || !query.trim()), [query]);

  return (
    <PageShell title="Search" heading="Search companies" description="Discover companies with a premium, live stock search experience." badge="Discover">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-premium backdrop-blur-xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">Live Discovery</p>
            <h2 className="text-2xl font-semibold text-white">Find companies instantly</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Search global companies by symbol or name and open a detailed view with one click.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200">
            <TrendingUp size={16} />
            <span>Realtime market intelligence</span>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-slate-900/90 px-4 py-4 shadow-2xl shadow-cyan-950/30">
            <Search className="text-cyan-400" size={22} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for AAPL, Tesla, Microsoft..."
              aria-label="Search companies"
              className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
            />
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" role="status" aria-label="Searching" /> : null}
          </div>

          <AnimatePresence>
            {query.trim() && (results.length || error || loading) ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute left-0 right-0 top-[calc(100%+0.7rem)] z-20 rounded-[1.2rem] border border-white/10 bg-slate-950/95 p-2 shadow-2xl">
                {loading ? (
                  <div className="flex items-center gap-3 px-3 py-3 text-sm text-slate-400">Searching markets...</div>
                ) : null}

                {!loading && error ? <div className="px-3 py-3 text-sm text-rose-300">{error}</div> : null}

                {!loading && !error && results.length ? (
                  <div className="max-h-72 overflow-auto">
                    {results.map((item) => (
                      <button key={item.symbol} onClick={() => navigate(`/company/${item.symbol}`)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/5" type="button">
                        <div>
                          <p className="font-medium text-white">{item.companyName || item.symbol}</p>
                          <p className="text-sm text-slate-400">{item.symbol} • {item.exchange || 'Market'}</p>
                        </div>
                        <div className="text-right text-sm text-slate-400">
                          <p>{item.type || 'Equity'}</p>
                          <p>{item.exchange || 'Market'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}

                {!loading && !error && !results.length && query.trim() ? (
                  <div className="px-3 py-3 text-sm text-slate-400">No matches found for that search.</div>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {!query.trim() ? (
          <div className="mt-6 rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-200">
              <Sparkles size={16} />
              <span>Popular searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button key={item} onClick={() => setQuery(item)} className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-white" type="button">
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>
    </PageShell>
  );
}

export default SearchPage;

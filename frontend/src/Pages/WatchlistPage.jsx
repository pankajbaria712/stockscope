import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowDownRight, ArrowUpRight, ExternalLink, Loader2, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageShell from '../Components/PageShell';
import { getStockQuote, getWatchlist, removeFromWatchlist } from '../Services/stockService';

function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Number(value) >= 1000 ? 0 : 2,
  }).format(Number(value));
}

function formatChange(value) {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  const safe = Number(value);
  return `${safe >= 0 ? '+' : ''}${safe.toFixed(2)}`;
}

function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [refreshing, setRefreshing] = useState(false);
  const refreshLockRef = useRef(false);

  const loadWatchlist = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await getWatchlist();
      const watchlistItems = Array.isArray(response?.data) ? response.data : [];
      setItems(watchlistItems);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load your watchlist');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshQuotes = useCallback(async (watchlistItems = items) => {
    if (!watchlistItems?.length) {
      setQuotes({});
      return;
    }

    if (refreshLockRef.current) return;

    refreshLockRef.current = true;
    setRefreshing(true);

    try {
      const quoteResponses = await Promise.all(watchlistItems.map((item) => getStockQuote(item.stockSymbol)));
      const nextQuotes = {};

      watchlistItems.forEach((item, index) => {
        const payload = quoteResponses[index]?.data || null;
        nextQuotes[item.stockSymbol] = payload;
      });

      setQuotes(nextQuotes);
    } catch {
      // ignore quote refresh failures and keep the existing list visible
    } finally {
      refreshLockRef.current = false;
      setRefreshing(false);
    }
  }, [items]);

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    if (!items.length) {
      setQuotes({});
      return;
    }

    refreshQuotes(items);
  }, [items, refreshQuotes]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshQuotes(items);
    }, 60000);

    return () => window.clearInterval(timer);
  }, [items, refreshQuotes]);

  const handleRemove = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      setItems((current) => current.filter((item) => item.stockSymbol !== symbol));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to remove this company');
    }
  };

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const list = items.filter((item) => {
      if (!normalizedSearch) return true;
      return [item.companyName, item.stockSymbol, item.exchange].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
    });

    return list.sort((left, right) => {
      const leftQuote = quotes[left.stockSymbol] || {};
      const rightQuote = quotes[right.stockSymbol] || {};
      const leftPrice = Number(leftQuote.currentPrice ?? 0);
      const rightPrice = Number(rightQuote.currentPrice ?? 0);
      const leftChange = Number(leftQuote.changePercent ?? leftQuote.change ?? 0);
      const rightChange = Number(rightQuote.changePercent ?? rightQuote.change ?? 0);

      if (sortBy === 'price') return rightPrice - leftPrice;
      if (sortBy === 'change') return rightChange - leftChange;
      return String(left.companyName || left.stockSymbol).localeCompare(String(right.companyName || right.stockSymbol));
    });
  }, [items, quotes, search, sortBy]);

  const summaryLabel = useMemo(() => {
    if (!filteredItems.length) return 'No active positions';
    const positiveCount = filteredItems.filter((item) => {
      const quote = quotes[item.stockSymbol] || {};
      const change = Number(quote.change ?? 0);
      return change >= 0;
    }).length;

    return `${positiveCount}/${filteredItems.length} trending up`;
  }, [filteredItems, quotes]);

  return (
    <PageShell title="Watchlist" heading="Your watchlist" description="Track the companies you care about with live pricing and quick actions." badge="Portfolio">
      <div className="watchlist-page">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="watchlist-hero">
          <div className="watchlist-hero__content">
            <div>
              <p className="page-badge">Live portfolio</p>
              <h2>Watch the market with clarity</h2>
              <p>Stay informed with a calm, polished workspace for your most important companies.</p>
            </div>
            <div className="watchlist-hero__stats">
              <div className="watchlist-stat">
                <span>Tracked</span>
                <strong>{items.length}</strong>
              </div>
              <div className="watchlist-stat">
                <span>Status</span>
                <strong>{summaryLabel}</strong>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="watchlist-toolbar">
          <div className="watchlist-toolbar__search">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your watchlist" />
          </div>
          <div className="watchlist-toolbar__actions">
            <label className="watchlist-select">
              <span>Sort</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="change">Change</option>
              </select>
            </label>
            <span className={`watchlist-refresh ${refreshing ? '' : 'watchlist-refresh--muted'}`}>
              {refreshing ? <><Loader2 size={14} className="watchlist-refresh__spinner" /> Refreshing…</> : 'Live updates enabled'}
            </span>
          </div>
        </motion.section>

        {loading ? (
          <div className="watchlist-grid watchlist-grid--loading" aria-live="polite">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="watchlist-card watchlist-card--skeleton" />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="watchlist-empty-state">
            <AlertCircle size={24} />
            <h3>We hit a snag</h3>
            <p>{error}</p>
          </motion.div>
        ) : null}

        {!loading && !error && !filteredItems.length ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="watchlist-empty-state">
            <div className="watchlist-empty-state__icon">📈</div>
            <h3>No stocks in your watchlist yet</h3>
            <p>Save companies from the details page to build your personal market view.</p>
          </motion.div>
        ) : null}

        {!loading && !error && filteredItems.length ? (
          <div className="watchlist-grid">
            {filteredItems.map((item) => {
              const quote = quotes[item.stockSymbol] || {};
              const price = quote.currentPrice ?? null;
              const change = quote.change ?? null;
              const changePercent = quote.changePercent ?? null;
              const positive = Number(change || 0) >= 0;
              const fallbackLabel = (item.companyName || item.stockSymbol || 'S').slice(0, 1).toUpperCase();

              return (
                <motion.article key={item.stockSymbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="watchlist-card">
                  <div className="watchlist-card__top">
                    <div className="watchlist-company">
                      <div className="watchlist-logo">{fallbackLabel}</div>
                      <div>
                        <h3>{item.companyName || item.stockSymbol}</h3>
                        <p>{item.stockSymbol} • {item.exchange || 'Market'}</p>
                      </div>
                    </div>
                    <span className={`watchlist-badge ${positive ? 'watchlist-badge--positive' : 'watchlist-badge--negative'}`}>
                      {positive ? <><ArrowUpRight size={14} /> Live</> : <><ArrowDownRight size={14} /> Watch</>}
                    </span>
                  </div>

                  <div className="watchlist-card__metrics">
                    <div>
                      <span className="watchlist-label">Price</span>
                      <strong>{formatPrice(price)}</strong>
                    </div>
                    <div>
                      <span className="watchlist-label">Day change</span>
                      <strong className={positive ? 'watchlist-value--positive' : 'watchlist-value--negative'}>{formatChange(change)}</strong>
                    </div>
                    <div>
                      <span className="watchlist-label">% change</span>
                      <strong className={positive ? 'watchlist-value--positive' : 'watchlist-value--negative'}>{changePercent == null ? 'N/A' : `${changePercent >= 0 ? '+' : ''}${Number(changePercent).toFixed(2)}%`}</strong>
                    </div>
                  </div>

                  <div className="watchlist-card__actions">
                    <button type="button" className="ghost-button" onClick={() => handleRemove(item.stockSymbol)}>
                      <Trash2 size={15} /> Remove
                    </button>
                    <Link to={`/company/${encodeURIComponent(item.stockSymbol)}`} className="secondary-button">
                      <span>Open</span>
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}

export default WatchlistPage;

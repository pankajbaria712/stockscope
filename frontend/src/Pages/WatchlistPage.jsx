import PageShell from '../Components/PageShell';

function WatchlistPage() {
  return (
    <PageShell
      title="Watchlist"
      heading="Your watchlist"
      description="Track favorite companies and monitor their progress in a focused space."
      badge="Portfolio"
    >
      <div className="info-card">
        <h2>Watchlist placeholder</h2>
        <p>Saved securities and status updates will appear here once the data experience is introduced.</p>
      </div>
    </PageShell>
  );
}

export default WatchlistPage;

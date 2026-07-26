import PageShell from '../Components/PageShell';

function SearchPage() {
  return (
    <PageShell
      title="Search"
      heading="Search companies"
      description="Find stocks and research summaries using a dedicated discovery experience."
      badge="Discover"
    >
      <div className="info-card">
        <h2>Advanced search placeholder</h2>
        <p>This page will host filtering, search results, and company discovery UI.</p>
      </div>
    </PageShell>
  );
}

export default SearchPage;

import PageShell from '../Components/PageShell';

function CompanyDetailsPage() {
  return (
    <PageShell
      title="Company Details"
      heading="Company overview"
      description="Inspect a single company with rich details and supporting market context."
      badge="Insights"
    >
      <div className="info-card">
        <h2>Company details placeholder</h2>
        <p>Detailed company content, metrics, and narrative sections will live here.</p>
      </div>
    </PageShell>
  );
}

export default CompanyDetailsPage;

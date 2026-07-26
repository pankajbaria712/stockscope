import PageShell from '../Components/PageShell';

function AboutPage() {
  return (
    <PageShell
      title="About"
      heading="About StockScope"
      description="Learn more about the purpose, principles, and product vision behind StockScope."
      badge="Story"
    >
      <div className="info-card">
        <h2>Mission placeholder</h2>
        <p>This page will soon describe the project goals and the team behind it.</p>
      </div>
    </PageShell>
  );
}

export default AboutPage;

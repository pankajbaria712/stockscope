import PageShell from '../Components/PageShell';

function ProfilePage() {
  return (
    <PageShell
      title="Profile"
      heading="Your profile"
      description="Manage your preferences and profile information in a clean, dedicated view."
      badge="Settings"
    >
      <div className="info-card">
        <h2>Profile placeholder</h2>
        <p>Profile details and account preferences will be surfaced here later.</p>
      </div>
    </PageShell>
  );
}

export default ProfilePage;

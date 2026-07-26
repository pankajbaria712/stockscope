import PageShell from '../Components/PageShell';

function LoginPage() {
  return (
    <PageShell
      title="Login"
      heading="Sign in"
      description="Access your StockScope workspace when authentication becomes available."
      badge="Auth"
    >
      <div className="auth-form-card">
        <h2>Login form placeholder</h2>
        <p>Authentication UI will be added here in a future iteration.</p>
      </div>
    </PageShell>
  );
}

export default LoginPage;

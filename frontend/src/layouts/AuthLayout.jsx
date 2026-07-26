import { Outlet, Link } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="auth-layout">
      <section className="auth-card" aria-label="Authentication area">
        <div className="auth-card__brand">
          <Link to="/" className="brand-link">
            <span className="brand-mark">S</span>
            <span>StockScope</span>
          </Link>
          <p>Secure access to your market workspace.</p>
        </div>

        <Outlet />
      </section>
    </div>
  );
}

export default AuthLayout;

import { NavLink, Outlet } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/compare', label: 'Compare' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function PublicLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <span className="brand-mark">S</span>
          <div>
            <p className="brand-name">StockScope</p>
            <p className="brand-subtitle">Market intelligence, simplified</p>
          </div>
        </div>

        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet />
    </div>
  );
}

export default PublicLayout;

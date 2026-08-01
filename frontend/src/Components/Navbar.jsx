import { motion } from 'framer-motion';
import { Menu, ArrowRight, UserCircle2, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Markets', to: '/search' },
  { label: 'Compare', to: '/compare' },
  { label: 'Watchlist', to: '/watchlist' },
  { label: 'About', to: '/about' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY) {
        setShowNavbar(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { isAuthenticated, user, logout } = useAuth();

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: showNavbar ? 0 : -100, opacity: showNavbar ? 1 : 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="navbar"
    >
      <div className="navbar__inner">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="StockScope logo" className="brand__logo" />
        </Link>

        <nav className="navbar__links" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));

            return (
              <Link key={link.to} to={link.to} className={`nav-link ${isActive ? 'nav-link--active' : ''}`} aria-current={isActive ? 'page' : undefined}>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="navbar__actions">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="icon-button" aria-label="Profile">
                {user?.avatar ? <img src={user.avatar} alt="avatar" style={{ width: 20, height: 20, borderRadius: 12 }} /> : <UserCircle2 size={18} />}
              </Link>
              <button type="button" className="ghost-button" onClick={logout} aria-label="Sign out">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-button">
                Login
              </Link>
              <Link to="/register" className="primary-button">
                Get Started
                <ArrowRight size={16} />
              </Link>
            </>
          )}

          <button className="mobile-toggle" type="button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={20} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mobile-menu">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));

            return (
              <Link key={link.to} to={link.to} className={`mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`} aria-current={isActive ? 'page' : undefined} onClick={() => setMenuOpen(false)}>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </motion.header>
  );
}

export default Navbar;

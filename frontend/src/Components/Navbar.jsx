import { motion } from 'framer-motion';
import { Menu, Search, SunMedium, MoonStar, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/about' },
  { label: 'Markets', to: '/search' },
  { label: 'Compare', to: '/compare' },
  { label: 'About', to: '/about' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showNavbar, setShowNavbar] = useState(true);

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
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="navbar__actions">
          <button className="icon-button" type="button" aria-label="Search companies">
            <Search size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
          </button>
          <Link to="/login" className="text-button">
            Login
          </Link>
          <Link to="/register" className="primary-button">
            Get Started
            <ArrowRight size={16} />
          </Link>
          <button className="mobile-toggle" type="button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={20} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="mobile-menu__link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </motion.header>
  );
}

export default Navbar;

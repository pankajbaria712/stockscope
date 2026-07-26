import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div>
          <Link to="/" className="brand brand--footer">
            <span className="brand__mark">S</span>
            <span className="brand__text">StockScope</span>
          </Link>
          <p className="footer-copy">A modern research platform for confident investing.</p>
        </div>

        <div className="footer-links">
          <div>
            <h3>Navigation</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/search">Markets</Link></li>
              <li><Link to="/compare">Compare</Link></li>
              <li><Link to="/watchlist">Watchlist</Link></li>
            </ul>
          </div>
          <div>
            <h3>Resources</h3>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy-policy">Privacy</Link></li>
              <li><Link to="/terms-of-service">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h3>Social</h3>
            <div className="social-links">
              <a href="https://github.com" aria-label="GitHub">
                <FaGithub size={18} />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn">
                <FaLinkedin size={18} />
              </a>
              <a href="https://twitter.com" aria-label="Twitter">
                <FaTwitter size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© 2026 StockScope. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

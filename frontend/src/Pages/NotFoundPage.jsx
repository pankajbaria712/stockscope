import { Link } from 'react-router-dom';
import PageShell from '../Components/PageShell';

function NotFoundPage() {
  return (
    <PageShell
      title="Page Not Found"
      heading="We lost that page"
      description="The page you requested could not be found, but you can return to the main experience."
      badge="404"
    >
      <div className="not-found-card">
        <div className="not-found-illustration" aria-hidden="true">
          <span>404</span>
        </div>
        <h2>Nothing to see here</h2>
        <p>The route you tried to open does not exist yet or may have moved.</p>
        <Link to="/" className="primary-link">
          Go Home
        </Link>
      </div>
    </PageShell>
  );
}

export default NotFoundPage;

import { useEffect } from 'react';

function PageShell({ title, heading, description, badge, children }) {
  useEffect(() => {
    document.title = title ? `${title} | StockScope` : 'StockScope';
  }, [title]);

  return (
    <main className="page-shell" aria-labelledby="page-heading">
      <section className="page-hero">
        <div className="page-hero__content">
          {badge ? <p className="page-badge">{badge}</p> : null}
          <h1 id="page-heading">{heading}</h1>
          <p className="page-description">{description}</p>
        </div>
      </section>

      <section className="page-content" aria-label={`${heading} content`}>
        {children}
      </section>
    </main>
  );
}

export default PageShell;

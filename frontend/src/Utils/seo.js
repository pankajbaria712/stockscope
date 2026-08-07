export function buildCompanySeoData(symbol, company = {}) {
  const companyName = company?.name || company?.companyName || symbol || 'Company';
  const safeSymbol = symbol || 'company';
  const pageTitle = `${companyName} (${safeSymbol}) Stock Price, Chart & Analysis | StockScope`;
  const description = `View live stock price, charts, company information, market statistics, and analysis for ${companyName} on StockScope.`;

  return {
    title: pageTitle,
    description,
    path: `/company/${encodeURIComponent(safeSymbol)}`,
    image: '/logo.png',
    type: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        description,
        url: `https://www.stockscope.app/company/${encodeURIComponent(safeSymbol)}`,
        about: {
          '@type': 'Organization',
          name: companyName,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'StockScope',
        url: 'https://www.stockscope.app',
        logo: 'https://www.stockscope.app/logo.png',
        sameAs: ['https://www.google.com', 'https://www.bing.com'],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'StockScope',
        url: 'https://www.stockscope.app',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.stockscope.app/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export function buildDefaultSeoData(pathname = '/') {
  const routeMap = {
    '/': {
      title: 'Home',
      description: 'StockScope helps investors analyze Indian and US stocks with live prices, interactive charts, company profiles, and personalized watchlists.',
      image: '/logo.png',
      type: 'website',
    },
    '/search': {
      title: 'Search',
      description: 'Search stocks and companies instantly on StockScope with live market discovery and company insights.',
      image: '/logo.png',
      type: 'website',
    },
    '/watchlist': {
      title: 'My Watchlist',
      description: 'Track your favorite companies and monitor live performance from your personalized StockScope watchlist.',
      image: '/logo.png',
      type: 'website',
    },
    '/profile': {
      title: 'My Profile',
      description: 'Manage your StockScope account details, preferences, and protected market workspace.',
      image: '/logo.png',
      type: 'website',
    },
    '/login': {
      title: 'Login',
      description: 'Sign in to your StockScope account to access watchlists, saved insights, and market tools.',
      image: '/logo.png',
      type: 'website',
    },
    '/register': {
      title: 'Create Account',
      description: 'Create a StockScope account to build a personalized watchlist and access premium market research tools.',
      image: '/logo.png',
      type: 'website',
    },
    '/about': {
      title: 'About StockScope',
      description: 'Learn about the StockScope mission, product philosophy, and modern investing experience for today’s market participants.',
      image: '/logo.png',
      type: 'website',
    },
    '/contact': {
      title: 'Contact StockScope',
      description: 'Reach out to StockScope for questions, feedback, and partnership opportunities.',
      image: '/logo.png',
      type: 'website',
    },
    '/privacy-policy': {
      title: 'Privacy Policy',
      description: 'Review the StockScope privacy policy and understand how account and market data are handled.',
      image: '/logo.png',
      type: 'website',
    },
    '/terms-of-service': {
      title: 'Terms of Service',
      description: 'Read the StockScope terms of service and usage guidelines for the platform experience.',
      image: '/logo.png',
      type: 'website',
    },
  };

  return routeMap[pathname] || {
    title: 'Page Not Found',
    description: 'The requested StockScope page could not be found. Return to the homepage to continue exploring markets.',
    image: '/logo.png',
    type: 'website',
  };
}

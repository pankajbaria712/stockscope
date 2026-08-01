import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import SeoHead from './SeoHead';
import { buildCompanySeoData, buildDefaultSeoData } from '../Utils/seo';

function SeoRouteManager() {
  const location = useLocation();
  const params = useParams();

  const seoData = useMemo(() => {
    if (location.pathname.startsWith('/company/')) {
      return buildCompanySeoData(params.symbol || 'company');
    }

    return buildDefaultSeoData(location.pathname);
  }, [location.pathname, params.symbol]);

  return (
    <SeoHead
      title={seoData.title}
      description={seoData.description}
      path={seoData.path || location.pathname}
      image={seoData.image}
      type={seoData.type}
      jsonLd={seoData.jsonLd}
    />
  );
}

export default SeoRouteManager;

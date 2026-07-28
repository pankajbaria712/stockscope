import { useEffect, useMemo, useState } from 'react';
import {
  getHomeOverview,
  getHomeTrending,
  getHomePopular,
} from '../Services/homeService';

const INITIAL_STATE = {
  loading: true,
  error: null,
  overview: null,
  trending: null,
  popular: null,
};

export function useHomepageData() {
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    let active = true;

    async function loadHomepageData() {
      setState(INITIAL_STATE);

      try {
        const [overviewResponse, trendingResponse, popularResponse] = await Promise.all([
          getHomeOverview(),
          getHomeTrending(),
          getHomePopular(),
        ]);

        if (!active) {
          return;
        }

        setState({
          loading: false,
          error: null,
          overview: overviewResponse?.data || null,
          trending: trendingResponse?.data || null,
          popular: popularResponse?.data || null,
        });
      } catch (homeError) {
        if (!active) {
          return;
        }

        setState({
          loading: false,
          error: homeError?.response?.data?.message || homeError?.message || 'Unable to load homepage data.',
          overview: null,
          trending: null,
          popular: null,
        });
      }
    }

    loadHomepageData();

    return () => {
      active = false;
    };
  }, []);

  const heroData = useMemo(() => state.overview?.hero || null, [state.overview]);
  const marketOverviewData = useMemo(() => state.overview?.marketOverview || [], [state.overview]);
  const trendingStocksData = useMemo(() => state.trending?.stocks || [], [state.trending]);
  const popularCompaniesData = useMemo(() => state.popular?.companies || [], [state.popular]);

  return {
    ...state,
    heroData,
    marketOverviewData,
    trendingStocksData,
    popularCompaniesData,
  };
}

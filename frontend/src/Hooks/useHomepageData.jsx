import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
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
  lastRefreshedAt: null,
  isUpdating: false,
};
const POLL_INTERVAL_MS = 15000;
const MARKET_OPEN_MINUTES = 9 * 60 + 15;
const MARKET_CLOSE_MINUTES = 15 * 60 + 30;

function getIndiaDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
  });
  const parts = formatter.formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function getIndiaTimestamp(parts, hour = '09', minute = '15') {
  return Date.parse(`${parts.year}-${parts.month}-${parts.day}T${hour}:${minute}:00+05:30`);
}

function getIndiaNow() {
  const parts = getIndiaDateParts();
  return {
    date: new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+05:30`),
    parts,
  };
}

function getIndiaWeekdayIndex(weekday) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
}

function isIndiaMarketOpen() {
  const { parts } = getIndiaNow();
  const weekday = getIndiaWeekdayIndex(parts.weekday);
  if (weekday < 1 || weekday > 5) {
    return false;
  }

  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return minutes >= MARKET_OPEN_MINUTES && minutes <= MARKET_CLOSE_MINUTES;
}

function getNextIndiaMarketOpen() {
  const now = new Date();
  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const parts = getIndiaDateParts(candidate);
    const weekday = getIndiaWeekdayIndex(parts.weekday);
    if (weekday < 1 || weekday > 5) {
      continue;
    }

    const candidateOpen = getIndiaTimestamp(parts, '09', '15');
    if (offset === 0) {
      const currentIndia = Date.parse(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+05:30`);
      if (currentIndia < candidateOpen) {
        return candidateOpen;
      }
      const currentMinutes = Number(parts.hour) * 60 + Number(parts.minute);
      if (currentMinutes <= MARKET_CLOSE_MINUTES) {
        return null;
      }
    } else {
      return candidateOpen;
    }
  }

  return null;
}

export function useHomepageData() {
  const [state, setState] = useState(INITIAL_STATE);
  const activeRef = useRef(true);
  const pollRef = useRef(null);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const clearTimers = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const abortPendingRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const scheduleResume = () => {
    clearTimers();
    const nextOpen = getNextIndiaMarketOpen();
    if (!nextOpen) {
      return;
    }

    const delay = Math.max(0, nextOpen - Date.now());
    timeoutRef.current = window.setTimeout(() => {
      if (!activeRef.current) {
        return;
      }
      startPolling();
    }, delay);
  };

  const updateState = (updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return {
        ...prev,
        ...next,
      };
    });
  };

  const loadHomepageData = async () => {
    abortPendingRequest();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    updateState((prev) => ({
      loading: prev.overview === null && prev.trending === null && prev.popular === null,
      error: null,
      isUpdating: true,
    }));

    try {
      const [overviewResponse, trendingResponse, popularResponse] = await Promise.all([
        getHomeOverview({ signal }),
        getHomeTrending({ signal }),
        getHomePopular({ signal }),
      ]);

      if (!activeRef.current) {
        return;
      }

      updateState((prev) => ({
        loading: false,
        isUpdating: false,
        error: null,
        overview: overviewResponse ?? prev.overview,
        trending: trendingResponse ?? prev.trending,
        popular: popularResponse ?? prev.popular,
        lastRefreshedAt: new Date().toISOString(),
      }));
    } catch (homeError) {
      if (!activeRef.current) {
        return;
      }

      if (axios.isCancel(homeError) || homeError?.name === 'CanceledError') {
        return;
      }

      updateState((prev) => ({
        loading: false,
        isUpdating: false,
        error: homeError?.response?.data?.message || homeError?.message || 'Unable to load homepage data.',
        overview: prev.overview,
        trending: prev.trending,
        popular: prev.popular,
      }));
    }
  };

  const startPolling = () => {
    clearTimers();

    loadHomepageData();

    if (!isIndiaMarketOpen()) {
      scheduleResume();
      return;
    }

    pollRef.current = window.setInterval(() => {
      if (!activeRef.current) {
        return;
      }

      if (isIndiaMarketOpen()) {
        loadHomepageData();
        return;
      }

      clearTimers();
      scheduleResume();
    }, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    activeRef.current = true;
    startPolling();

    return () => {
      activeRef.current = false;
      clearTimers();
      abortPendingRequest();
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

import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loader from '../Components/Loader';
import ProtectedRoute from '../Components/ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import PublicLayout from '../layouts/PublicLayout';

const HomePage = lazy(() => import('../Pages/HomePage'));
const LoginPage = lazy(() => import('../Pages/LoginPage'));
const RegisterPage = lazy(() => import('../Pages/RegisterPage'));
const SearchPage = lazy(() => import('../Pages/SearchPage'));
const CompanyDetailsPage = lazy(() => import('../Pages/CompanyDetailsPage'));
const ComparePage = lazy(() => import('../Pages/ComparePage'));
const WatchlistPage = lazy(() => import('../Pages/WatchlistPage'));
const ProfilePage = lazy(() => import('../Pages/ProfilePage'));
const AboutPage = lazy(() => import('../Pages/AboutPage'));
const ContactPage = lazy(() => import('../Pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('../Pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('../Pages/TermsOfServicePage'));
const NotFoundPage = lazy(() => import('../Pages/NotFoundPage'));

function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/company/:symbol" element={<CompanyDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;

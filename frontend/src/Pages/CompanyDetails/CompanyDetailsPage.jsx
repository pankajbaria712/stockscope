import React from 'react';
import './styles/companyDetails.css';
import CompanyHeader from './components/CompanyHeader';
import PricePerformancePanel from './components/PricePerformancePanel';
import BusinessFundamentals from './components/BusinessFundamentals';

export default function CompanyDetailsPage() {
  return (
    <div className="company-details-root">
      <CompanyHeader />
      <PricePerformancePanel />
      <BusinessFundamentals />
    </div>
  );
}

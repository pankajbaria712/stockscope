import { getCompanyDetails, getStockQuote, getStockChart, getCompanyHubData } from '../../../Services/stockService';

// Re-export existing service functions so the new CompanyDetails module can import from a single place.
export { getCompanyDetails, getStockQuote, getStockChart, getCompanyHubData };

import { useParams } from 'react-router-dom';
import InteractiveStockChart from './InteractiveStockChart';

export default function CompanyChart() {
  const { symbol } = useParams();

  return <InteractiveStockChart symbol={symbol} />;
}

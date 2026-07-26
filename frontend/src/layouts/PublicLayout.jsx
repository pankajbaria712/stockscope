import { Outlet } from 'react-router-dom';
import Navbar from '../Components/Navbar';

function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;

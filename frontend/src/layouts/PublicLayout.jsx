import { Outlet } from 'react-router-dom';

function PublicLayout() {
  return (
    <div className="app-shell">
      <Outlet />
    </div>
  );
}

export default PublicLayout;

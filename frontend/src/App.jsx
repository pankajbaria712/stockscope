import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './Context/AuthContext';
import { ThemeProvider } from './Context/ThemeContext';
import AppRoutes from './Routes/AppRoutes';
import SeoRouteManager from './Components/SeoRouteManager';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SeoRouteManager />
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

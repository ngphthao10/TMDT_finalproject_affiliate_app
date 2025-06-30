import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import InfluencerLogin from './components/InfluencerLogin';
import Commission from './pages/Commission'
import Dashboard from './pages/KolDashboard'
import Report from './pages/KOLConversionReport'
import Payout from './pages/KOLPayout'
import './App.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '$';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (data) => {
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <InfluencerLogin onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentView={currentView}
        onNavigate={handleNavigate}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'commission' && <Commission />}
          {currentView === 'report' && <Report />}
          {currentView === 'payment' && <Payout influencerId={user?.influencer_id} />}
        </main>
      </div>
    </div>
  );
};

export default App;
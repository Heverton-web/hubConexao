import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Layout>
      {user?.role === 'super_admin' ? (
        <Admin />
      ) : (
        <Dashboard />
      )}
    </Layout>
  );
};

export default App;
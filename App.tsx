import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Layout } from './components/Layout';
import { GlobalEffects } from './components/GlobalEffects';

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <GlobalEffects />
      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <Layout>
          {user?.role === 'super_admin' ? (
            <Admin />
          ) : (
            <Dashboard />
          )}
        </Layout>
      )}
    </>
  );
};

export default App;
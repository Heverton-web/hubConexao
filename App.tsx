import React from 'react';
import { GlobalEffects } from './components/GlobalEffects';
import { AppRouter } from './components/AppRouter';

const App: React.FC = () => {
  return (
    <>
      <GlobalEffects />
      <AppRouter />
    </>
  );
};

export default App;
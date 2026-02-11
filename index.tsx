import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BrandProvider } from './contexts/BrandContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <BrandProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrandProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
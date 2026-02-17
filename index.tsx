import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BrandProvider } from './contexts/BrandContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { ReloadPrompt } from './components/ReloadPrompt';
import { ShortcutProvider } from './contexts/ShortcutContext';
import './styles/theme-transition.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <BrandProvider>
            <ToastProvider>
              <ShortcutProvider>
                <AuthProvider>
                  <App />
                </AuthProvider>

                <ToastContainer />
                <ReloadPrompt />
              </ShortcutProvider>
            </ToastProvider>
          </BrandProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode >
);
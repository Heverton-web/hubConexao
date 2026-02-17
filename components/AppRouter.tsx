import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthPage } from '../pages/AuthPage';
import { Dashboard } from '../pages/Dashboard';
import { Admin } from '../pages/Admin';
import { Collections } from '../pages/Collections';
import { CollectionDetail } from '../pages/CollectionDetail';
import { Layout } from './Layout';
import { ProtectedRoute } from './ProtectedRoute';

const NotFound: React.FC = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page text-main">
        <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
        <p className="text-xl text-muted mb-8">P\u00e1gina n\u00e3o encontrada</p>
        <a href="/dashboard" className="px-6 py-3 bg-accent text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
            Voltar ao Dashboard
        </a>
    </div>
);

export const AppRouter: React.FC = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <Routes>
            {/* Public Route */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to={user?.role === 'super_admin' ? '/admin' : '/dashboard'} replace /> : <AuthPage />}
            />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Layout><Dashboard /></Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/collections"
                element={
                    <ProtectedRoute>
                        <Layout><Collections /></Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/collections/:id"
                element={
                    <ProtectedRoute>
                        <Layout><CollectionDetail /></Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute requiredRole="super_admin">
                        <Layout><Admin /></Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/:tab"
                element={
                    <ProtectedRoute requiredRole="super_admin">
                        <Layout><Admin /></Layout>
                    </ProtectedRoute>
                }
            />

            {/* Root Redirect */}
            <Route
                path="/"
                element={
                    isAuthenticated
                        ? <Navigate to={user?.role === 'super_admin' ? '/admin' : '/dashboard'} replace />
                        : <Navigate to="/login" replace />
                }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
